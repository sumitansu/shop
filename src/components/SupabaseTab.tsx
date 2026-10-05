import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Zap,
  Terminal,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { TodoItem } from '../lib/supabase';

export const SupabaseTab: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [status, setStatus] = useState<{
    configured: boolean;
    connected: boolean;
    tableExists: boolean;
    url?: string;
    todoCount?: number;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Todo State
  const [newTitle, setNewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Fetch Status and Todos
  const fetchSupabaseData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Check status
      const statusRes = await fetch('/api/supabase/status');
      const statusData = await statusRes.json();
      setStatus(statusData);

      // 2. Fetch todos
      const todosRes = await fetch('/api/supabase/todos');
      if (todosRes.ok) {
        const todosData = await todosRes.json();
        setTodos(todosData.todos || []);
      } else {
        const err = await todosRes.json().catch(() => ({ error: 'Failed to fetch todos' }));
        // If table doesn't exist yet, we guide the user
        if (err.error?.includes('relation "public.todos" does not exist')) {
          setErrorMsg('The "todos" table does not exist in your Supabase project yet. Click "Seed Sample Todos" or run the SQL in your Supabase SQL editor.');
        } else {
          setErrorMsg(err.error);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  // Add Todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/supabase/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Insert failed' }));
        throw new Error(err.error || 'Failed to add todo');
      }

      const data = await res.json();
      setTodos((prev) => [data.todo, ...prev]);
      setActionSuccess(`Todo "${data.todo.title}" saved to Supabase!`);
      setNewTitle('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Todo Complete
  const handleToggleTodo = async (id: number | string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/supabase/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_complete: !currentStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Update failed' }));
        throw new Error(err.error || 'Failed to update todo');
      }

      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_complete: !currentStatus } : t))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (id: number | string) => {
    try {
      const res = await fetch(`/api/supabase/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(err.error || 'Delete failed');
      }
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setActionSuccess('Todo deleted from Supabase.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    }
  };

  // Seed Sample Todos
  const handleSeed = async () => {
    setSeeding(true);
    setErrorMsg(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/supabase/init', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seeding failed');
      setActionSuccess('Sample todos initialized in Supabase.');
      await fetchSupabaseData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setSeeding(false);
    }
  };

  const copyRestUrl = () => {
    const url = 'https://jbpznjbprhxxwlfnsksd.supabase.co/rest/v1/todos';
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 md:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Supabase PostgREST &amp; Client SDK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Supabase Backend &amp; Todos Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Integrated with your live Supabase project (<span className="font-mono text-emerald-300">jbpznjbprhxxwlfnsksd.supabase.co</span>) via <span className="font-mono text-slate-200">@supabase/supabase-js</span> and direct PostgREST REST APIs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSupabaseData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Supabase Gateway</span>
            <span className="text-xs font-semibold text-white font-mono flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              {status?.connected ? 'Operational' : 'Connecting...'}
            </span>
          </div>
          <Database className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">PostgREST Endpoint</span>
            <span className="text-xs font-semibold text-white font-mono mt-0.5 truncate max-w-[150px] block">
              /rest/v1/todos
            </span>
          </div>
          <button
            onClick={copyRestUrl}
            title="Copy REST endpoint"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Loaded Records</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono block mt-0.5">
              {todos.length} Todos
            </span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Supabase Notice:</p>
            <p className="font-mono break-all">{errorMsg}</p>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Add Todo Form + Todos List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Todo (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Todo (`supabase.from(&apos;todos&apos;).insert()`)</span>
            </h3>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>{seeding ? 'Seeding...' : 'Seed Sample'}</span>
            </button>
          </div>

          <form onSubmit={handleAddTodo} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Task Description <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Build multi-cloud sync pipeline"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Writing to Supabase...' : 'Save Todo'}</span>
            </button>
          </form>

          {/* Code reference box */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">SDK Query Pattern:</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto">
{`const { data, error } = await supabase
  .from('todos')
  .select();`}
            </pre>
          </div>

          <div className="pt-1">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Direct cURL / PostgREST Pattern:</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto">
{`curl 'https://jbpznjbprhxxwlfnsksd.supabase.co/rest/v1/todos' \\
  -H "apikey: <SUPABASE_ANON_KEY>"`}
            </pre>
          </div>
        </div>

        {/* Right Column: Todos List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Supabase Todos Table ({todos.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                from(&apos;todos&apos;).select()
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                Querying Supabase PostgREST...
              </div>
            ) : todos.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-center space-y-2">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No todos found in Supabase</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type a task on the left or click &ldquo;Seed Sample&rdquo; to insert your first record into your Supabase database.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      todo.is_complete
                        ? 'bg-slate-950/50 border-slate-800/60 text-slate-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => handleToggleTodo(todo.id, todo.is_complete)}
                        className="cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      >
                        {todo.is_complete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`truncate ${
                          todo.is_complete ? 'line-through text-slate-500' : 'text-white font-medium'
                        }`}
                      >
                        {todo.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-400">
                        #{todo.id}
                      </span>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        title="Delete Todo"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unified Matrix card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Full Cloud Ecosystem Map</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-emerald-300 block">Supabase</span>
                <p className="text-slate-400 text-[10px]">PostgREST APIs &amp; realtime todos</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-cyan-300 block">Neon Postgres</span>
                <p className="text-slate-400 text-[10px]">Serverless SQL &amp; relational posts</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-purple-300 block">Vercel Blob</span>
                <p className="text-slate-400 text-[10px]">Private streaming documents</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-indigo-300 block">Firebase</span>
                <p className="text-slate-400 text-[10px]">ABAC Vault &amp; Google Auth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
