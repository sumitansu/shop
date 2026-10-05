import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in logs per Stage 4 security directive
  console.warn(
    '[SECURITY AUDIT] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Hardcoded fallbacks have been removed.'
  );
}

/**
 * Returns an initialized SupabaseClient or throws immediately if env vars are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured in your environment.'
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Proxied client that fails loudly if invoked without environment variables
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        `Cannot access supabase.${String(prop)}: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Hardcoded fallbacks have been removed.`
      );
    }
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const value = Reflect.get(client, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export interface TodoItem {
  id: number | string;
  title: string;
  is_complete: boolean;
  created_at?: string;
  user_id?: string;
}

// Client SDK query matching user prompt:
// const { data, error } = await supabase.from('todos').select()
export async function fetchTodosDirect(): Promise<TodoItem[]> {
  const client = getSupabaseClient();
  const { data, error } = await client.from('todos').select().order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return (data as TodoItem[]) || [];
}

