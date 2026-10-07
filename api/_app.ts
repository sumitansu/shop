import express from 'express';
import { Readable } from 'stream';
import multer from 'multer';
import { put, get, list, del } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { apiLimiter, mutationLimiter, publicShopLimiter } from './_rateLimit.ts';
import { expressRequireAuth, expressRequireAdmin } from './_auth.ts';
import {
  sanitizeBlobPathname,
  validateBlobContentType,
  verifyMagicBytes,
  MAX_BLOB_FILE_SIZE_BYTES,
} from './_validation.ts';
import { validateAndCalculateOrder } from './_shopRules.ts';
import { confirmOrder, listOrders, updateOrderStatus } from './_orders.ts';

const apiApp = express();

// Trust reverse proxy (Vercel / Cloud Run) to extract real client IP
apiApp.set('trust proxy', 1);

// Global body parser: 100kb limit (multipart uploads handled via multer)
apiApp.use(express.json({ limit: '100kb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Apply baseline rate limiting to all incoming API traffic
apiApp.use(apiLimiter);

// Multipart parser with 4.5 MB in-memory cap for Vercel Serverless
const uploadStorage = multer.memoryStorage();
const multerUploader = multer({
  storage: uploadStorage,
  limits: {
    fileSize: MAX_BLOB_FILE_SIZE_BYTES,
  },
});

const multerUploadMiddleware: express.RequestHandler = (req, res, next) => {
  multerUploader.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: `File size exceeds maximum allowed limit of ${MAX_BLOB_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: `Upload failed: ${err.message}` });
    }
    next();
  });
};

// Helper for Blob token
export const getBlobToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured in environment.');
  }
  return token;
};

// Helper for Neon PostgreSQL client (Orders engine)
export const getSql = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }
  return neon(dbUrl);
};

// ==========================================
// Vercel Blob Storage Route Handlers
// ==========================================

const uploadBlobHandler: express.RequestHandler = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: 'File is required in multipart form-data (field name: "file")',
      });
    }

    if (req.file.size > MAX_BLOB_FILE_SIZE_BYTES) {
      return res.status(413).json({
        error: `File exceeds maximum size limit of ${MAX_BLOB_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
      });
    }

    // Determine target pathname from request body/query or fallback to uploaded file originalname
    const rawPath = req.body?.pathname || req.query?.pathname || req.file.originalname;
    const pathValidation = sanitizeBlobPathname(rawPath);
    if (!pathValidation.valid || !pathValidation.data) {
      return res.status(400).json({ error: pathValidation.error || 'Invalid pathname' });
    }
    const cleanPathname = pathValidation.data;

    // Determine content type from request body or file mimetype
    const rawContentType = req.body?.contentType || req.file.mimetype;
    const typeValidation = validateBlobContentType(rawContentType);
    if (!typeValidation.valid || !typeValidation.data) {
      return res.status(400).json({ error: typeValidation.error || 'Invalid content-type' });
    }
    const cleanContentType = typeValidation.data;

    // Verify magic bytes against declared content-type
    const magicValidation = verifyMagicBytes(req.file.buffer, cleanContentType);
    if (!magicValidation.valid) {
      return res.status(400).json({ error: magicValidation.error });
    }

    const token = getBlobToken();

    // Force access: 'private' unconditionally
    const blob = await put(cleanPathname, req.file.buffer, {
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

// --- 1. Public Shop Routes (No login required, strict per-IP limiter) ---
const shopRouter = express.Router();
shopRouter.use(publicShopLimiter);

const calculateBillHandler: express.RequestHandler = (req, res) => {
  const result = validateAndCalculateOrder(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    success: true,
    bill: result.bill,
    config: result.config,
  });
};

// Mount calculate-bill on shopRouter (handles /calculate-bill and /shop/calculate-bill)
shopRouter.post('/calculate-bill', calculateBillHandler);
shopRouter.post('/shop/calculate-bill', calculateBillHandler);

// Public catalog routes placeholder / ready for Phase 2
const catalogHandler: express.RequestHandler = (_req, res) => {
  return res.json({
    success: true,
    catalog: [],
    message: 'Public catalog route ready for Phase 2',
  });
};
shopRouter.get('/catalog', catalogHandler);
shopRouter.get('/shop/catalog', catalogHandler);

// Mount public shopRouter with and without /api prefix
apiApp.use('/api/shop', shopRouter);
apiApp.use('/shop', shopRouter);

// --- 2. Protected Routes (Strict Firebase ID Token Auth Required) ---
const protectedRouter = express.Router();
protectedRouter.use(expressRequireAuth);

// Vercel Blob (Protected & Administrator Only)
protectedRouter.post('/blob/upload', mutationLimiter, expressRequireAdmin, multerUploadMiddleware, uploadBlobHandler);
protectedRouter.get('/blob/get', expressRequireAdmin, getBlobHandler);
protectedRouter.get('/blob/list', expressRequireAdmin, listBlobsHandler);
protectedRouter.delete('/blob/delete', mutationLimiter, expressRequireAdmin, deleteBlobHandler);

// Blob Dispatcher Alias
protectedRouter.get('/blob', expressRequireAdmin, async (req, res, next) => {
  if (req.query.action === 'list') {
    return listBlobsHandler(req, res, next);
  }
  return getBlobHandler(req, res, next);
});
protectedRouter.post('/blob', mutationLimiter, expressRequireAdmin, multerUploadMiddleware, uploadBlobHandler);
protectedRouter.delete('/blob', mutationLimiter, expressRequireAdmin, deleteBlobHandler);

// ==========================================
// Neon PostgreSQL Orders Management (Stage 7 - Admin Only)
// ==========================================

// Confirm an order code into the Neon orders database
protectedRouter.post('/orders/confirm', mutationLimiter, expressRequireAdmin, async (req, res) => {
  const { orderCode, customerName, config, status } = req.body;
  const result = await confirmOrder({
    orderCode,
    customerName,
    config,
    status,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    success: true,
    order: result.order,
  });
});

// List all confirmed orders (sorted by urgency: paid, pending, shipped, delivered)
protectedRouter.get('/orders', expressRequireAdmin, async (_req, res) => {
  const result = await listOrders();
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  return res.json({
    success: true,
    orders: result.orders,
  });
});

// Update order fulfillment status
protectedRouter.patch('/orders/:id/status', mutationLimiter, expressRequireAdmin, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const result = await updateOrderStatus(orderId, status);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    success: true,
    order: result.order,
  });
});

// Alias for status update via POST
protectedRouter.post('/orders/status', mutationLimiter, expressRequireAdmin, async (req, res) => {
  const { id, orderId, status } = req.body;
  const targetId = id || orderId;
  if (!targetId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }
  const result = await updateOrderStatus(targetId, status);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    success: true,
    order: result.order,
  });
});

// Mount protected router on both /api and /
apiApp.use('/api', protectedRouter);
apiApp.use('/', protectedRouter);

export default apiApp;
