import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { put, get, list, del } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper to check Blob token
const getBlobToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured in environment.');
  }
  return token;
};

// Helper for Neon PostgreSQL client
const getSql = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }
  return neon(dbUrl);
};

// Helper for Supabase Client
const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and key are not configured in environment.');
  }
  return createSupabaseClient(url, key);
};

// --- Neon Serverless PostgreSQL API Routes ---

// Database Health & Table Status
app.get('/api/db/status', async (_req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.json({
        configured: false,
        connected: false,
        message: 'DATABASE_URL is missing in environment',
      });
    }

    const sql = getSql();
    const testResult = await sql`SELECT 1 as ping, current_database() as db_name, version() as version;`;

    // Check if posts table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      ) as exists;
    `;

    const tableExists = Boolean(tableCheck[0]?.exists);
    let postCount = 0;
    if (tableExists) {
      const countRes = await sql`SELECT count(*)::int as count FROM posts;`;
      postCount = countRes[0]?.count || 0;
    }

    return res.json({
      configured: true,
      connected: true,
      database: testResult[0]?.db_name || 'neondb',
      tableExists,
      postCount,
      host: process.env.PGHOST || 'neon.tech',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Neon DB Status Error:', message);
    return res.status(500).json({
      configured: Boolean(process.env.DATABASE_URL),
      connected: false,
      error: message,
    });
  }
});

// Initialize / Ensure Posts Table Exists
app.post('/api/db/init', async (_req, res) => {
  try {
    const sql = getSql();

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Anonymous',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Check if table is empty, seed initial welcome post
    const countCheck = await sql`SELECT count(*)::int as count FROM posts;`;
    if (countCheck[0]?.count === 0) {
      await sql`
        INSERT INTO posts (title, content, author)
        VALUES 
          ('Welcome to Neon PostgreSQL on Vercel', 'This relational record is queried live from your Neon Serverless PostgreSQL instance using @neondatabase/serverless.', 'System Administrator'),
          ('Full-Stack Cloud Architecture Ready', 'The platform now orchestrates Firebase Firestore (ABAC Vault), Vercel Blob (Private Files), and Neon PostgreSQL (Relational Data).', 'Cloud Engineer');
      `;
    }

    const currentPosts = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
    return res.json({
      success: true,
      message: 'Posts table created and initialized successfully.',
      posts: currentPosts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Neon DB Init Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Get Posts (Direct implementation of user's getData function)
app.get('/api/db/posts', async (_req, res) => {
  try {
    const sql = getSql();
    // Auto-create table if not yet present
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Anonymous',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const data = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
    return res.json({ posts: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Neon DB Get Posts Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Insert Post
app.post('/api/db/posts', async (req, res) => {
  try {
    const { title, content, author = 'Anonymous' } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const sql = getSql();
    const result = await sql`
      INSERT INTO posts (title, content, author)
      VALUES (${title.trim()}, ${content.trim()}, ${author.trim() || 'Anonymous'})
      RETURNING *;
    `;

    return res.json({
      success: true,
      post: result[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Neon DB Insert Post Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Delete Post
app.delete('/api/db/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const sql = getSql();
    await sql`DELETE FROM posts WHERE id = ${postId};`;
    return res.json({ success: true, deletedId: postId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Neon DB Delete Post Error:', message);
    return res.status(500).json({ error: message });
  }
});

// --- Quad-Storage Resilient Fallback Engine ---

// System Health Summary across 3 DBs + 1 Blob
app.get('/api/system/health', async (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    databases: [
      { id: 'firestore', name: 'Firebase Firestore', configured: true, type: 'Document NoSQL & ABAC' },
      { id: 'neon', name: 'Neon Serverless PostgreSQL', configured: Boolean(process.env.DATABASE_URL), type: 'Relational SQL (Pooler)' },
      { id: 'supabase', name: 'Supabase Database', configured: Boolean(process.env.SUPABASE_URL), type: 'PostgREST & Edge DB' },
    ],
    blobStorage: {
      id: 'vercel_blob',
      name: 'Vercel Blob Storage',
      configured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      type: 'Encrypted Private Object Stream',
    },
    resiliencePolicy: 'Quad-Redundancy Failover with Automatic Next-Provider Fallback',
  });
});

// Multi-Sync Write to Neon, Supabase, and Vercel Blob
app.post('/api/vault/save-all', async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'key and value are required' });
  }

  const results = { neon: false, supabase: false, vercel_blob: false };

  // 1. Neon PostgreSQL
  try {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS vault_secrets (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      INSERT INTO vault_secrets (key, value, updated_at)
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP;
    `;
    results.neon = true;
  } catch (err) {
    console.warn('Neon save secret error:', err);
  }

  // 2. Supabase
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('vault_secrets').upsert({ key, value });
    if (!error) {
      results.supabase = true;
    }
  } catch (err) {
    console.warn('Supabase save secret error:', err);
  }

  // 3. Vercel Blob
  try {
    const token = getBlobToken();
    await put(`secrets/${key}.json`, JSON.stringify({ key, value, updatedAt: new Date().toISOString() }), {
      access: 'private',
      token,
      contentType: 'application/json',
    });
    results.vercel_blob = true;
  } catch (err) {
    console.warn('Vercel Blob save secret error:', err);
  }

  res.json(results);
});

// Resilient Fallback Get (Neon -> Supabase -> Vercel Blob)
app.get('/api/vault/get', async (req, res) => {
  const key = req.query.key as string;
  if (!key) return res.status(400).json({ error: 'Missing key parameter' });

  const fallbackChain: { provider: string; status: 'success' | 'failed' | 'rate_limited'; error?: string }[] = [];

  // Provider 1: Neon PostgreSQL
  try {
    const sql = getSql();
    const rows = await sql`SELECT value FROM vault_secrets WHERE key = ${key} LIMIT 1;`;
    if (rows && rows.length > 0) {
      fallbackChain.push({ provider: 'neon', status: 'success' });
      return res.json({ value: rows[0].value, providerUsed: 'neon', fallbackChain });
    }
    fallbackChain.push({ provider: 'neon', status: 'failed', error: 'Key not found in Neon' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRateLimit = msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('quota');
    fallbackChain.push({ provider: 'neon', status: isRateLimit ? 'rate_limited' : 'failed', error: msg });
  }

  // Provider 2: Supabase (Automatic Fallback)
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('vault_secrets').select('value').eq('key', key).single();
    if (data?.value) {
      fallbackChain.push({ provider: 'supabase', status: 'success' });
      return res.json({ value: data.value, providerUsed: 'supabase', fallbackChain });
    }
    fallbackChain.push({ provider: 'supabase', status: 'failed', error: error?.message || 'Key not in Supabase' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    fallbackChain.push({ provider: 'supabase', status: 'failed', error: msg });
  }

  // Provider 3: Vercel Blob (Automatic Fallback)
  try {
    const token = getBlobToken();
    const result = await get(`secrets/${key}.json`, { access: 'private', token });
    if (result && result.stream) {
      const text = await new Response(result.stream).text();
      const parsed = JSON.parse(text);
      fallbackChain.push({ provider: 'vercel_blob', status: 'success' });
      return res.json({ value: parsed.value, providerUsed: 'vercel_blob', fallbackChain });
    }
    fallbackChain.push({ provider: 'vercel_blob', status: 'failed', error: 'Key not found in Vercel Blob' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    fallbackChain.push({ provider: 'vercel_blob', status: 'failed', error: msg });
  }

  return res.status(404).json({ error: 'Secret not found across providers', fallbackChain });
});

// --- Supabase API Routes ---

// Health & Status
app.get('/api/supabase/status', async (_req, res) => {
  try {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return res.json({
        configured: false,
        connected: false,
        message: 'SUPABASE_URL or keys missing in environment',
      });
    }

    const supabase = getSupabase();
    // Test query on todos table
    const { data, error, count } = await supabase
      .from('todos')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      return res.json({
        configured: true,
        connected: true,
        tableExists: false,
        message: error.message,
        url,
        todoCount: 0,
      });
    }

    return res.json({
      configured: true,
      connected: true,
      tableExists: true,
      url,
      todoCount: count ?? data?.length ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase Status Error:', message);
    return res.status(500).json({
      configured: Boolean(process.env.SUPABASE_URL),
      connected: false,
      error: message,
    });
  }
});

// Get Todos (Direct implementation of user's supabase.from('todos').select())
app.get('/api/supabase/todos', async (_req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ todos: data || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase Get Todos Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Insert Todo
app.post('/api/supabase/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: title.trim(), is_complete: false }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ todo: data?.[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase Insert Todo Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Toggle Todo Completed
app.patch('/api/supabase/todos/:id', async (req, res) => {
  try {
    const { is_complete } = req.body;
    const todoId = req.params.id;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: Boolean(is_complete) })
      .eq('id', todoId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ todo: data?.[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase Update Todo Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Delete Todo
app.delete('/api/supabase/todos/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const supabase = getSupabase();
    const { error } = await supabase.from('todos').delete().eq('id', todoId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, deletedId: todoId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase Delete Todo Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Seed Sample Todos
app.post('/api/supabase/init', async (_req, res) => {
  try {
    const supabase = getSupabase();
    const sampleTodos = [
      { title: 'Explore Supabase PostgREST & Realtime API', is_complete: true },
      { title: 'Test multi-cloud data orchestration (Neon, Blob, Firebase, Supabase)', is_complete: true },
      { title: 'Deploy unified production app to Vercel free tier', is_complete: false },
    ];

    const { data, error } = await supabase.from('todos').insert(sampleTodos).select();
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      message: 'Sample todos seeded into Supabase',
      todos: data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase Init Error:', message);
    return res.status(500).json({ error: message });
  }
});

// --- Vercel Blob API Routes ---

// Health & Status
app.get('/api/blob/status', (_req, res) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  res.json({
    status: 'ok',
    configured: Boolean(token),
    hasRwToken: Boolean(token && token.startsWith('vercel_blob_rw_')),
    storeId: process.env.BLOB_STORE_ID || 'store_Ai7bFlevUBpVJohX',
  });
});

// Upload / Put Blob (Private or Public)
app.post('/api/blob/upload', async (req, res) => {
  try {
    const token = getBlobToken();
    const { pathname, content, contentType = 'text/plain;charset=utf-8', access = 'private' } = req.body;

    if (!pathname || content === undefined) {
      return res.status(400).json({ error: 'pathname and content are required' });
    }

    const blob = await put(pathname, content, {
      access: access === 'public' ? 'public' : 'private',
      contentType,
      token,
    });

    return res.json({
      success: true,
      blob,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Vercel Blob Put Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Retrieve / Get Blob (Private Streaming matching user's spec)
app.get('/api/blob/get', async (req, res) => {
  try {
    const token = getBlobToken();
    const pathname = req.query.pathname as string;

    if (!pathname) {
      return res.status(400).json({ error: 'Missing pathname query parameter' });
    }

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
    const message = error instanceof Error ? error.message : String(error);
    console.error('Vercel Blob Get Error:', message);
    return res.status(500).json({ error: message });
  }
});

// List Blobs
app.get('/api/blob/list', async (_req, res) => {
  try {
    const token = getBlobToken();
    const result = await list({ token });
    return res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Vercel Blob List Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Delete Blob
app.delete('/api/blob/delete', async (req, res) => {
  try {
    const token = getBlobToken();
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing url in request body' });
    }

    await del(url, { token });
    return res.json({ success: true, deleted: url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Vercel Blob Delete Error:', message);
    return res.status(500).json({ error: message });
  }
});

// --- Server Lifecycle & Vite Middlewares ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudSecure Server running on http://0.0.0.0:${PORT} (mode: ${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
