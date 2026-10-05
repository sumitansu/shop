import { put, get, list, del } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

// Vercel Edge / Serverless Function Handler
export default async function handler(request: Request) {
  const url = new URL(request.url);
  const pathnameParam = url.searchParams.get('pathname');
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: 'BLOB_READ_WRITE_TOKEN is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET: Retrieve private blob by pathname or list
  if (request.method === 'GET') {
    if (url.searchParams.get('action') === 'list') {
      const result = await list({ token });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!pathnameParam) {
      return new Response(JSON.stringify({ error: 'Missing pathname' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await get(pathnameParam, {
      access: 'private',
      token,
    });

    if (result === null) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(result.stream, {
      headers: {
        'Cache-Control': 'private, no-cache',
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // POST: Upload blob (default private)
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { pathname, content, access = 'private', contentType = 'text/plain;charset=utf-8' } = body;

      if (!pathname || content === undefined) {
        return new Response(JSON.stringify({ error: 'Missing pathname or content' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const blob = await put(pathname, content, {
        access: access === 'public' ? 'public' : 'private',
        contentType,
        token,
      });

      return new Response(JSON.stringify({ success: true, blob }), {
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

  // DELETE: Delete blob
  if (request.method === 'DELETE') {
    try {
      const body = await request.json();
      if (!body.url) {
        return new Response(JSON.stringify({ error: 'Missing url' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await del(body.url, { token });
      return new Response(JSON.stringify({ success: true, deleted: body.url }), {
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
