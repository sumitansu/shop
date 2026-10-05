import express from 'express';
import { Readable } from 'stream';
import { put, get, list, del } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import { expressRequireAuth, expressRequireAdmin } from './_auth.ts';
import {
  sanitizeBlobPathname,
  validateBlobContentType,
} from './_validation.ts';
import { validateAndCalculateOrder } from './_shopRules.ts';

const apiApp = express();

// --- Rate Limiting (Stage 2) ---
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for write operations, please try again later.' },
});

// Dedicated upload route JSON parser with 5MB limit
const uploadJsonParser = express.json({ limit: '5mb' });

// Global body parser: 100kb limit (bypassed for dedicated upload route)
apiApp.use((req, res, next) => {
  if (req.path.endsWith('/blob/upload') || req.path === '/api/blob/upload' || (req.path.endsWith('/blob') && req.method === 'POST')) {
    return uploadJsonParser(req, res, next);
  }
  return express.json({ limit: '100kb' })(req, res, next);
});
apiApp.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Apply rate limiting & auth barrier to all API routes
apiApp.use(apiLimiter);
apiApp.use(expressRequireAuth);

// Helper for Blob token
export const getBlobToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured in environment.');
  }
  return token;
};

// Helper for Neon PostgreSQL client (Core Quad-Storage Engine)
export const getSql = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }
  return neon(dbUrl);
};

// Helper for Supabase Client (Prefer anon key + RLS; service-role key only when required)
export const getSupabase = (preferServiceRole = false) => {
  const url = process.env.SUPABASE_URL;
  const key = preferServiceRole
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    : (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw new Error('SUPABASE_URL and key are not configured in environment.');
  }
  return createSupabaseClient(url, key);
};

// ==========================================
// Vercel Blob Storage Route Handlers
// ==========================================

const uploadBlobHandler: express.RequestHandler = async (req, res) => {
  try {
    const token = getBlobToken();
    const { pathname, content, contentType } = req.body;

    const pathValidation = sanitizeBlobPathname(pathname);
    if (!pathValidation.valid || !pathValidation.data) {
      return res.status(400).json({ error: pathValidation.error || 'Invalid pathname' });
    }
    const cleanPathname = pathValidation.data;

    const typeValidation = validateBlobContentType(contentType);
    if (!typeValidation.valid || !typeValidation.data) {
      return res.status(400).json({ error: typeValidation.error || 'Invalid content-type' });
    }
    const cleanContentType = typeValidation.data;

    if (content === undefined || content === null) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Force access: 'private' unconditionally
    const blob = await put(cleanPathname, content, {
      access: 'private',
      contentType: cleanContentType,
      token,
    });

    return res.json({
      success: true,
      blob,
    });
  } catch (error: unknown) {
    console.error('Vercel Blob Put Error:', error);
    return res.status(500).json({ error: 'Failed to upload blob' });
  }
};

const getBlobHandler: express.RequestHandler = async (req, res) => {
  try {
    const token = getBlobToken();
    const pathValidation = sanitizeBlobPathname(req.query.pathname);
    if (!pathValidation.valid || !pathValidation.data) {
      return res.status(400).json({ error: pathValidation.error || 'Invalid pathname parameter' });
    }
    const pathname = pathValidation.data;

    const result = await get(pathname, {
      access: 'private',
      token,
    });

    if (result === null) {
      return res.status(404).send('Not found');
    }

    res.setHeader('Cache-Control', 'private, no-cache');
    res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (result.stream) {
      const nodeStream = Readable.fromWeb(result.stream as unknown as import('stream/web').ReadableStream);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error: unknown) {
    console.error('Vercel Blob Get Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve blob' });
  }
};

const listBlobsHandler: express.RequestHandler = async (_req, res) => {
  try {
    const token = getBlobToken();
    const result = await list({ token });
    return res.json(result);
  } catch (error: unknown) {
    console.error('Vercel Blob List Error:', error);
    return res.status(500).json({ error: 'Failed to list blobs' });
  }
};

const deleteBlobHandler: express.RequestHandler = async (req, res) => {
  try {
    const token = getBlobToken();
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
      return res.status(400).json({ error: 'Valid URL string starting with https:// is required' });
    }

    await del(url, { token });
    return res.json({ success: true, deleted: url });
  } catch (error: unknown) {
    console.error('Vercel Blob Delete Error:', error);
    return res.status(500).json({ error: 'Failed to delete blob' });
  }
};

// ==========================================
// Register Routes (Supports both /path and /api/path)
// ==========================================

const router = express.Router();

// Vercel Blob
router.post('/blob/upload', mutationLimiter, expressRequireAdmin, uploadBlobHandler);
router.get('/blob/get', getBlobHandler);
router.get('/blob/list', expressRequireAdmin, listBlobsHandler);
router.delete('/blob/delete', mutationLimiter, expressRequireAdmin, deleteBlobHandler);

// Blob Dispatcher Alias
router.get('/blob', async (req, res, next) => {
  if (req.query.action === 'list') {
    return expressRequireAdmin(req, res, () => listBlobsHandler(req, res, next));
  }
  return getBlobHandler(req, res, next);
});
router.post('/blob', mutationLimiter, expressRequireAdmin, uploadBlobHandler);
router.delete('/blob', mutationLimiter, expressRequireAdmin, deleteBlobHandler);

// STAGE 8: Server-authoritative bill calculation & order validation
router.post('/shop/calculate-bill', mutationLimiter, (req, res) => {
  const result = validateAndCalculateOrder(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    success: true,
    bill: result.bill,
    config: result.config,
  });
});

// Mount router on both root and /api
apiApp.use('/api', router);
apiApp.use('/', router);

export default apiApp;
