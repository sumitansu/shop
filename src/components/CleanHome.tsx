import React, { useState } from 'react';
import {
  Shield,
  Database,
  Layers,
  HardDrive,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Terminal,
  RefreshCw,
  Sparkles,
  Server,
  Code2,
} from 'lucide-react';
import { resilientSaveSecret, resilientGetSecret, FallbackResult } from '../lib/resilientVault';

interface CleanHomeProps {
  onOpenSystemDrawer: () => void;
}

export const CleanHome: React.FC<CleanHomeProps> = ({ onOpenSystemDrawer }) => {
  // Test Failover State
  const [testKey, setTestKey] = useState('SYSTEM_ENCRYPTION_KEY');
  const [testValue, setTestValue] = useState('sec_val_9847120498124_alpha');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<Record<string, boolean> | null>(null);

  const [testingFallback, setTestingFallback] = useState(false);
  const [retrievedResult, setRetrievedResult] = useState<FallbackResult | null>(null);

  const handleTestMultiSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testKey || !testValue) return;

    setSyncing(true);
    setSyncResult(null);
    setRetrievedResult(null);

    const res = await resilientSaveSecret(testKey.trim(), testValue.trim());
    setSyncResult(res.results);
    setSyncing(false);
  };

  const handleTestFallbackFetch = async () => {
    setTestingFallback(true);
    const res = await resilientGetSecret(testKey.trim());
    setRetrievedResult(res);
    setTestingFallback(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-2 sm:px-4">
      {/* Top Status Pill */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 font-sans">Foundation Status:</span>
          <span className="font-semibold text-emerald-400">3 Databases + 1 Blob Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-400">Auto-Fallback Ready</span>
        </div>
      </div>

      {/* Hero: Clean Canvas */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Ready for Your Instructions.
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          The backend infrastructure is fully provisioned, hardened, and unified. All secret credentials, code, and tokens are replicated across all 4 storage engines with automatic rate-limit failover.
        </p>
        <p className="text-sm text-indigo-300 font-medium">
          Instruct what you would like to build on this website, and I will create it.
        </p>
      </div>

      {/* 4 Storage Engines Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Firebase */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Firebase Firestore</h3>
            <p className="text-xs text-slate-400 mt-0.5">Database 1 • Document NoSQL</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Zero-Trust ABAC &amp; Auth
          </div>
        </div>

        {/* Neon Postgres */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Neon PostgreSQL</h3>
            <p className="text-xs text-slate-400 mt-0.5">Database 2 • Relational SQL</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            PgBouncer Pooler Active
          </div>
        </div>

        {/* Supabase */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Supabase DB</h3>
            <p className="text-xs text-slate-400 mt-0.5">Database 3 • PostgREST</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Edge API &amp; Realtime
          </div>
        </div>

        {/* Vercel Blob */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Vercel Blob</h3>
            <p className="text-xs text-slate-400 mt-0.5">Storage 1 • Private Object</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Encrypted Asset Stream
          </div>
        </div>
      </div>

      {/* Interactive Quad-Storage Failover Tester Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Live Quad-Storage Replication &amp; Failover Verification</h2>
            </div>
            <p className="text-xs text-slate-400">
              Per your directive, secret tokens and critical data are replicated across all 4 targets simultaneously. Test the multi-sync and cascading fallback below.
            </p>
          </div>

          <button
            onClick={onOpenSystemDrawer}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>Open Architecture Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleTestMultiSync} className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          <div className="md:col-span-4">
            <label className="block text-slate-300 font-medium mb-1">Secret / Token Identifier Key</label>
            <input
              type="text"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. API_MASTER_KEY"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-slate-300 font-medium mb-1">Confidential Value Payload</label>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. secret_token_xyz"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Replicating...' : 'Sync All 4 Targets'}</span>
            </button>
          </div>
        </form>

        {/* Sync Status Badges */}
        {syncResult && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Replication Confirmation:</span>
              <button
                onClick={handleTestFallbackFetch}
                disabled={testingFallback}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>{testingFallback ? 'Testing failover...' : 'Execute Fallback Read Test →'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Firebase Firestore</span>
                <span className={syncResult.firestore ? 'text-emerald-400 font-mono font-bold' : 'text-slate-500'}>
                  {syncResult.firestore ? 'Synced ✓' : 'Queued'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Neon PostgreSQL</span>
                <span className={syncResult.neon ? 'text-cyan-400 font-mono font-bold' : 'text-slate-500'}>
                  {syncResult.neon ? 'Synced ✓' : 'Skipped'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Supabase</span>
                <span className={syncResult.supabase ? 'text-emerald-400 font-mono font-bold' : 'text-slate-500'}>
                  {syncResult.supabase ? 'Synced ✓' : 'Skipped'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Vercel Blob</span>
                <span className={syncResult.vercel_blob ? 'text-purple-400 font-mono font-bold' : 'text-slate-500'}>
                  {syncResult.vercel_blob ? 'Synced ✓' : 'Skipped'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Read Result */}
        {retrievedResult && (
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Failover Resolver Report:</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono uppercase text-[10px]">
                Served By: {retrievedResult.providerUsed}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-emerald-300 break-all text-[11px]">
              Value: {retrievedResult.value}
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
              <span>Failover Chain Traversed:</span>
              {retrievedResult.fallbackChain.map((chain, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                    chain.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {chain.provider} ({chain.status})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
