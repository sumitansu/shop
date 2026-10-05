import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Server,
  Zap,
  Code2,
  Calendar,
  User,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PostItem, DbStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const DatabaseTab: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Auto populate author from auth if empty
  useEffect(() => {
    if (user?.displayName && !author) {
      setAuthor(user.displayName);
    }
  }, [user, author]);

  // Fetch DB Status & Posts
  const fetchDbData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Check status
      const statusRes = await fetch('/api/db/status');
      const statusData = await statusRes.json();
      setDbStatus(statusData);

      // 2. Fetch posts
      const postsRes = await fetch('/api/db/posts');
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      } else {
        const err = await postsRes.json().catch(() => ({ error: 'Could not fetch posts' }));
        throw new Error(err.error || 'Could not fetch posts');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  // Initialize table
  const handleInitTable = async () => {
    setInitializing(true);
    setErrorMsg(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/db/init', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Initialization failed');
      setActionSuccess(data.message || 'Posts table initialized successfully');
      setPosts(data.posts || []);
      // re-check status
      const statusRes = await fetch('/api/db/status');
      setDbStatus(await statusRes.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setInitializing(false);
    }
  };

  // Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/db/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          author: author.trim() || user?.displayName || 'Anonymous',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Insert failed' }));
        throw new Error(err.error || 'Failed to insert post');
      }

      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);
      setActionSuccess(`Post #${data.post.id} successfully written to Neon PostgreSQL!`);
      setTitle('');
      setContent('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: number) => {
    try {
      const res = await fetch(`/api/db/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(err.error || 'Delete failed');
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setActionSuccess(`Post #${id} deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    }
  };

  // Quick preset template
  const loadExamplePost = () => {
    setTitle('Exploring Modern Serverless Architectures');
    setContent('By pairing Neon Serverless PostgreSQL with Firebase and Vercel Blob, we have dedicated relational schemas, ABAC auth isolation, and high-performance blob caching in one unified app.');
    setAuthor(user?.displayName || 'Cloud Architect');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 md:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>Neon Serverless PostgreSQL (Vercel Postgres)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Relational Database Engine &amp; Posts Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Connected to Neon Serverless PostgreSQL with PgBouncer connection pooling. Query relational tables directly using <span className="font-mono text-cyan-300">@neondatabase/serverless</span> over serverless HTTP/WebSockets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDbData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">PostgreSQL Connection</span>
            <span className="text-xs font-semibold text-white font-mono flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              {dbStatus?.connected ? 'Connected (neondb)' : 'Connecting...'}
            </span>
          </div>
          <Server className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Table: `posts`</span>
            <span className="text-xs font-semibold text-white font-mono mt-0.5 block">
              {dbStatus?.tableExists ? `${posts.length} records found` : 'Not Created'}
            </span>
          </div>
          <Table className="w-4 h-4 text-indigo-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Pooler Engine</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3" /> PgBouncer Pooler Active
            </span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">PostgreSQL Notice:</p>
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

      {/* Main Grid: Insert Form + Posts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Insert Post (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Insert Record (`posts`)</span>
            </h3>
            <button
              onClick={loadExamplePost}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Sample Post</span>
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Post Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My First Article in Neon Postgres"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Anonymous or Your Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Post Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write article or post body here..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Inserting into PostgreSQL...' : 'Insert into Posts Table'}</span>
            </button>
          </form>

          {/* Quick Initialize Table Button */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Schema Maintenance</span>
              <button
                onClick={handleInitTable}
                disabled={initializing}
                className="text-[11px] px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {initializing ? 'Initializing...' : 'Run Table Bootstrap / Seed'}
              </button>
            </div>
          </div>

          {/* Code reference box */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Exact neon query pattern:</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto">
{`const sql = neon(process.env.DATABASE_URL);
const data = await sql\`SELECT * FROM posts;\`;
return data;`}
            </pre>
          </div>
        </div>

        {/* Right Column: Posts List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>Posts Table Records ({posts.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                SELECT * FROM posts
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2" />
                Executing SQL query on Neon Serverless...
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-center space-y-2">
                <Database className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Table is empty</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Sample Post&rdquo; and &ldquo;Insert into Posts Table&rdquo; or click &ldquo;Run Table Bootstrap / Seed&rdquo; to populate initial records.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[10px]">
                            #{post.id}
                          </span>
                          <h4 className="font-bold text-white text-sm">{post.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            {post.author}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {post.created_at ? new Date(post.created_at).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete Post"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed pt-1 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Architecture comparison callout */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Full Multi-Tier Storage Architecture Summary</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-cyan-300 block">Neon PostgreSQL</span>
                <p className="text-slate-400">Structured relational tables, foreign keys, SQL queries (`posts`).</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-300 block">Vercel Blob</span>
                <p className="text-slate-400">Private streaming assets, documents, articles via `@vercel/blob`.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-indigo-300 block">Firebase Firestore</span>
                <p className="text-slate-400">Zero-Trust ABAC private vault &amp; Google authentication.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
