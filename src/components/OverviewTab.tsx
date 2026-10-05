import React, { useState } from 'react';
import { Database, ShieldCheck, Lock, Globe, FileCode2, ArrowRight, Activity, Server, KeyRound, AlertTriangle } from 'lucide-react';
import { TabType } from '../types';
import { testConnection, firebaseConfig } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface OverviewTabProps {
  setActiveTab: (tab: TabType) => void;
  isFirebaseConnected: boolean;
  setIsFirebaseConnected: (val: boolean) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  setActiveTab,
  isFirebaseConnected,
  setIsFirebaseConnected,
}) => {
  const { user } = useAuth();
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTestingPing(true);
    try {
      const res = await testConnection();
      setPingResult(res);
      setIsFirebaseConnected(res.success);
    } catch {
      setPingResult({
        success: false,
        latencyMs: 0,
        message: 'Could not contact server directly.',
      });
      setIsFirebaseConnected(false);
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Production Infrastructure Configured</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Secure Foundation for Your Web Platform
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Your application is integrated with <strong className="text-white">Firebase Firestore</strong> (Enterprise edition in <span className="font-mono text-indigo-300">asia-south1</span>), <strong className="text-white">Firebase Authentication</strong>, hardened Zero-Trust security rules, and full <strong className="text-white">Vercel Free Tier</strong> configuration.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('vault')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Launch Secure Cloud Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('vercel')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Vercel Deployment Checklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contributor Notice Callout */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm">
          <h3 className="font-semibold text-amber-300">Mandatory Contributor Directive Active</h3>
          <p className="text-slate-300 mt-1">
            As specified in <span className="font-mono text-amber-200">README.md</span>, anyone working on this application (including developers and AI assistants) must record all code modifications, architectural changes, and new features in the README Change Log before concluding work.
          </p>
          <button
            onClick={() => setActiveTab('changelog')}
            className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View README Change Log & Report Guidelines</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Firestore */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Provisioned
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Cloud Firestore</h3>
          <p className="text-xs text-slate-400 mt-1">Enterprise database engine with real-time listeners and multi-region backups.</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Region: <span className="text-slate-200">asia-south1</span></div>
            <div className="truncate">Project: <span className="text-slate-200">{firebaseConfig.projectId}</span></div>
          </div>
        </div>

        {/* Card 2: Firebase Auth */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user ? 'Active Session' : 'Ready'}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Firebase Authentication</h3>
          <p className="text-xs text-slate-400 mt-1">Google OAuth Provider popup flow, JWT verification, and user metadata synchronization.</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Current User: <span className="text-slate-200">{user ? user.email : 'Unauthenticated'}</span></div>
            <div>Auth Domain: <span className="text-slate-200 truncate block">{firebaseConfig.authDomain}</span></div>
          </div>
        </div>

        {/* Card 3: Security Rules */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Zero-Trust
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Hardened ABAC Rules</h3>
          <p className="text-xs text-slate-400 mt-1">Default-deny firewall. Zero public leakage. Only owners can access their records in `/vault`.</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Rules Status: <span className="text-emerald-400 font-semibold">Deployed to Cloud</span></div>
            <div>Blueprint: <span className="text-slate-200">Strict Schema Sync</span></div>
          </div>
        </div>

        {/* Card 4: Vercel Free Tier */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Globe className="w-5 h-5" />
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Vercel Ready
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Vercel Free Tier</h3>
          <p className="text-xs text-slate-400 mt-1">Includes `vercel.json` SPA routing, custom security headers, caching, and Vercel Analytics.</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Analytics: <span className="text-emerald-400 font-semibold">@vercel/analytics</span></div>
            <div>Hosting Plan: <span className="text-slate-200">Hobby (Free Tier)</span></div>
          </div>
        </div>
      </div>

      {/* Live Firestore Connection Test Interactive Widget */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Live Firebase Server Ping Test</h2>
              <p className="text-xs text-slate-400">
                Pings Firestore live using <span className="font-mono text-indigo-300">getDocFromServer</span> to verify real-time network connectivity.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testingPing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
          >
            {testingPing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Pinging Server...</span>
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Run Direct Server Test</span>
              </>
            )}
          </button>
        </div>

        {pingResult && (
          <div
            className={`mt-4 p-3.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
              pingResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{pingResult.message}</span>
            <span className="font-bold">{pingResult.latencyMs} ms</span>
          </div>
        )}
      </div>

      {/* Architecture Deep-Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Security Model: Private Data Isolation</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Per project requirements, any data that should not be visible publicly on the website is never rendered into static client bundles or stored in public storage. Instead, it is routed through the Firebase Firestore <span className="font-mono text-purple-300">/vault</span> collection guarded by Attribute-Based Access Control:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>Public/Unauthenticated visitors are denied read/write access at the Firestore engine level.</li>
            <li>Users can only query documents where <span className="font-mono text-slate-200">ownerId == auth.uid</span>.</li>
            <li>Server timestamps are verified against <span className="font-mono text-slate-200">request.time</span> to eliminate client spoofing.</li>
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Vercel Free Tier Optimization</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Everything required to run seamlessly on Vercel is structured for you:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li><span className="font-mono text-slate-200">vercel.json</span> defines rewrite rules so single-page-app routes never return 404.</li>
            <li>Security response headers (<span className="font-mono text-slate-200">HSTS, X-Frame-Options, No-Sniff</span>) are pre-configured.</li>
            <li><span className="font-mono text-slate-200">@vercel/analytics</span> is installed and active on the root mount.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
