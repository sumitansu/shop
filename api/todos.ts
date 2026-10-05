import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and key are not configured');
  }
  return createClient(url, key);
};

export default async function handler(request: Request) {
  try {
    const supabase = getSupabase();

    // GET: Fetch todos
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ todos: data || [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST: Insert todo
    if (request.method === 'POST') {
      const body = await request.json();
      const { title } = body;

      if (!title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('todos')
        .insert([{ title: title.trim(), is_complete: false }])
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ todo: data?.[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PATCH: Update todo
    if (request.method === 'PATCH') {
      const body = await request.json();
      const { id, is_complete } = body;

      const { data, error } = await supabase
        .from('todos')
        .update({ is_complete: Boolean(is_complete) })
        .eq('id', id)
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ todo: data?.[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE: Delete todo
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');

      if (!id) {
        return new Response(JSON.stringify({ error: 'id query param is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, deletedId: id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
