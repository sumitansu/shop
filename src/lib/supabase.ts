import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://jbpznjbprhxxwlfnsksd.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicHpuamJwcmh4eHdsZm5za3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzYyMDQsImV4cCI6MjEwNjcxMjIwNH0.M57kgCNuxGTb6QwGyog1qj0ihS_T6aKbBkfBeNriY9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const { data, error } = await supabase.from('todos').select().order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return (data as TodoItem[]) || [];
}
