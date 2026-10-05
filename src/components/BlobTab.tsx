import React, { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  Copy,
  Check,
  FileCode,
  HardDrive,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BlobItem } from '../types';

export const BlobTab: React.FC = () => {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<{ configured: boolean; hasRwToken: boolean } | null>(null);

  // Upload Form State
  const [pathname, setPathname] = useState('articles/blob.txt');
  const [content, setContent] = useState('Hello World!');
  const [contentType, setContentType] = useState('text/plain;charset=utf-8');
  const [access, setAccess] = useState<'private' | 'public'>('private');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Preview Modal / State
  const [previewContent, setPreviewContent] = useState<{
    pathname: string;
    text: string;
    contentType: string;
    loading: boolean;
  } | null>(null);

  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Fetch Blob Status and Blob List
  const fetchStatusAndList = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Status
      const statusRes = await fetch('/api/blob/status');
      if (statusRes.ok) {
        const s = await statusRes.json();
        setStatus(s);
      }

      // 2. List
      const listRes = await fetch('/api/blob/list');
      if (!listRes.ok) {
        const errData = await listRes.json().catch(() => ({ error: 'Failed to fetch blob list' }));
        throw new Error(errData.error || 'Failed to list blobs');
      }
      const data = await listRes.json();
      setBlobs(data.blobs || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndList();
  }, []);

  // Upload Handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathname.trim() || content === undefined) {
      setErrorMsg('Pathname and content are required.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setUploadSuccess(null);

    try {
      const res = await fetch('/api/blob/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname: pathname.trim(),
          content,
          contentType,
          access,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadSuccess(`Successfully stored blob: ${data.blob.pathname} (${data.blob.size} bytes)`);
      // Refresh list
      await fetchStatusAndList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  // Quick Preset: User's Example
  const loadExamplePreset = () => {
    setPathname('articles/blob.txt');
    setContent('Hello World!');
    setContentType('text/plain;charset=utf-8');
    setAccess('private');
  };

  // Read Private Blob (streams via /api/blob/get?pathname=...)
  const handleReadBlob = async (itemPathname: string) => {
    setPreviewContent({
      pathname: itemPathname,
      text: '',
      contentType: '',
      loading: true,
    });

    try {
      const res = await fetch(`/api/blob/get?pathname=${encodeURIComponent(itemPathname)}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to retrieve blob');
      }
      const ct = res.headers.get('content-type') || 'text/plain';
      const text = await res.text();
      setPreviewContent({
        pathname: itemPathname,
        text,
        contentType: ct,
        loading: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPreviewContent({
        pathname: itemPathname,
        text: `Error reading private blob: ${msg}`,
        contentType: 'text/plain',
        loading: false,
      });
    }
  };

  // Delete Blob
  const handleDeleteBlob = async (blobUrl: string, itemPathname: string) => {
    if (!confirm(`Are you sure you want to delete ${itemPathname}?`)) return;

    try {
      const res = await fetch('/api/blob/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blobUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to delete blob' }));
        throw new Error(err.error || 'Failed to delete');
      }

      setBlobs((prev) => prev.filter((b) => b.url !== blobUrl));
      if (previewContent?.pathname === itemPathname) {
        setPreviewContent(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 md:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Vercel Blob Storage Integration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Private Blob Storage with @vercel/blob
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Store articles, confidential assets, and private documents with encrypted server-side tokens. Private blobs require authenticated retrieval and stream via custom serverless endpoints with <span className="font-mono text-emerald-300">Cache-Control: private, no-cache</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStatusAndList}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Token Configuration</span>
            <span className="text-xs font-semibold text-white font-mono">
              {status?.hasRwToken ? 'BLOB_READ_WRITE_TOKEN (Active)' : 'Detecting...'}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Blobs in Store</span>
            <span className="text-sm font-bold text-white font-mono">{blobs.length} items</span>
          </div>
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Default Storage Access</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private (Zero Public Exposure)
            </span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Blob Service Notice:</p>
            <p className="font-mono break-all">{errorMsg}</p>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Main Grid: Upload Form + Stored Blobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload New Blob (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Put Blob (`put()`)</span>
            </h3>
            <button
              onClick={loadExamplePreset}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample</span>
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Blob Pathname <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={pathname}
                onChange={(e) => setPathname(e.target.value)}
                placeholder="e.g. articles/blob.txt or docs/secret.json"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                The relative destination path inside your Vercel Blob store.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Access Mode</label>
                <select
                  value={access}
                  onChange={(e) => setAccess(e.target.value as 'private' | 'public')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="private">Private (Protected)</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Content-Type</label>
                <input
                  type="text"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  placeholder="text/plain"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                </input>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Blob Payload Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Enter string, JSON, markdown, or data here..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Storing in Vercel Blob...' : 'Put to Vercel Blob Store'}</span>
            </button>
          </form>

          {/* Code snippet card */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Equivalent Server-Side Call:</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto">
{`const blob = await put('${pathname}', '${content.slice(0, 30)}${content.length > 30 ? '...' : ''}', {
  access: '${access}',
  token: process.env.BLOB_READ_WRITE_TOKEN
});`}
            </pre>
          </div>
        </div>

        {/* Right Column: Blobs List + Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Stored Blobs ({blobs.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Fetched via <span className="text-indigo-300">list()</span>
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                Loading stored blobs...
              </div>
            ) : blobs.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No blobs found in store</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Load Sample&rdquo; and &ldquo;Put to Vercel Blob Store&rdquo; on the left to write your first file (e.g. <span className="font-mono text-slate-300">articles/blob.txt</span>).
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {blobs.map((blob) => (
                  <div
                    key={blob.url}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                          {blob.pathname}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {blob.size} B
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Uploaded: {new Date(blob.uploadedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleReadBlob(blob.pathname)}
                        title="Read / Stream Private Blob"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Stream</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(blob.pathname)}
                        title="Copy Pathname"
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedPath === blob.pathname ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteBlob(blob.url, blob.pathname)}
                        title="Delete Blob"
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

          {/* Live Stream / Read Result Viewer */}
          {previewContent && (
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono truncate">
                    Streaming: {previewContent.pathname}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {previewContent.contentType && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {previewContent.contentType}
                    </span>
                  )}
                  <button
                    onClick={() => setPreviewContent(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {previewContent.loading ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                  Streaming private blob through server proxy...
                </div>
              ) : (
                <div className="space-y-2">
                  <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-52">
                    {previewContent.text}
                  </pre>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Served with headers: Cache-Control: private, no-cache | X-Content-Type-Options: nosniff
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vercel NextRequest / Serverless Reference */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <span>Native Vercel Serverless Function Implementation</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              When deploying to Vercel, the function at <span className="font-mono text-slate-300">/api/blob.ts</span> executes in Vercel Edge / Serverless runtime using your <span className="font-mono text-slate-300">BLOB_READ_WRITE_TOKEN</span> environment variable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
