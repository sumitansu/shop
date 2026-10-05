import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export async function getData() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  const sql = neon(dbUrl);
  const data = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
  return data;
}

export default async function handler(request: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: 'DATABASE_URL is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sql = neon(dbUrl);

  // Auto ensure table exists
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Anonymous',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (err) {
    console.error('Table check warning:', err);
  }

  // GET: Fetch posts
  if (request.method === 'GET') {
    try {
      const posts = await getData();
      return new Response(JSON.stringify({ posts }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // POST: Insert post
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { title, content, author = 'Anonymous' } = body;

      if (!title || !content) {
        return new Response(JSON.stringify({ error: 'Title and content are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await sql`
        INSERT INTO posts (title, content, author)
        VALUES (${title.trim()}, ${content.trim()}, ${author.trim() || 'Anonymous'})
        RETURNING *;
      `;

      return new Response(JSON.stringify({ success: true, post: result[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
