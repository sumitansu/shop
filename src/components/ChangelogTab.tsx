import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  History,
  PlusCircle,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  User,
  Files,
} from 'lucide-react';
import { ChangeLogEntry } from '../types';

export const ChangelogTab: React.FC = () => {
  const [copiedRow, setCopiedRow] = useState(false);

  // Form to generate markdown row for README.md
  const [author, setAuthor] = useState('');
  const [scope, setScope] = useState('');
  const [filesModified, setFilesModified] = useState('');
  const [summary, setSummary] = useState('');
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');

  // Initial logged entries matching README.md
  const entries: ChangeLogEntry[] = [
    {
      id: 'log-6',
      date: '2026-10-04 14:05 UTC',
      author: 'AI Assistant',
      scope: 'Master Specification & Roadmap Integration',
      files: ['README.md', 'src/components/ChangelogTab.tsx', '.env'],
      summary:
        'Enshrined complete E-Commerce Site Spec ("DoRaemon\'s Shop"), added Master Implementation Roadmap with real-time phase tracking (Completed vs Next Up), restored environment configuration, and established strict small-step verification protocol.',
    },
    {
      id: 'log-5',
      date: '2026-10-04 12:55 UTC',
      author: 'AI Assistant',
      scope: 'Quad-Redundancy Fallback & Site Canvas Clean',
      files: [
        'README.md',
        'src/lib/resilientVault.ts',
        'server.ts',
        'src/App.tsx',
        'src/components/CleanHome.tsx',
        'src/components/Navbar.tsx',
        'src/components/SystemDrawer.tsx',
        'src/components/ChangelogTab.tsx',
      ],
      summary:
        'Enshrined mandatory Quad-Storage Redundancy Policy (3 DBs + 1 Blob) in README.md with automatic failover fallback on rate-limits, implemented resilientVault service with multi-sync write and cascading fallback read, and cleaned the entire user-facing UI into a pristine, modern canvas ready for user feature instructions.',
    },
    {
      id: 'log-4',
      date: '2026-10-04 12:51 UTC',
      author: 'AI Assistant',
      scope: 'Supabase Backend Integration',
      files: [
        'server.ts',
        'api/todos.ts',
        '.env',
        '.env.example',
        'package.json',
        'src/lib/supabase.ts',
        'src/components/SupabaseTab.tsx',
        'src/components/Navbar.tsx',
        'src/App.tsx',
        'README.md',
        'src/components/ChangelogTab.tsx',
      ],
      summary:
        'Integrated @supabase/supabase-js, configured Supabase REST, PostgREST, and PostgreSQL connection strings in .env, created /api/supabase/* server proxy routes, implemented Vercel Serverless Function /api/todos.ts, and built an interactive Supabase Todos & PostgREST explorer tab with live mutations.',
    },
    {
      id: 'log-3',
      date: '2026-10-04 12:44 UTC',
      author: 'AI Assistant',
      scope: 'Neon PostgreSQL Integration',
      files: [
        'server.ts',
        'api/posts.ts',
        '.env',
        '.env.example',
        'package.json',
        'src/types/index.ts',
        'src/components/DatabaseTab.tsx',
        'src/components/Navbar.tsx',
        'src/App.tsx',
        'README.md',
        'src/components/ChangelogTab.tsx',
      ],
      summary:
        'Integrated @neondatabase/serverless for Neon Serverless PostgreSQL / Vercel Postgres, added server-side SQL query & table initialization endpoints, implemented Vercel Serverless Function /api/posts.ts with getData() query, configured DATABASE_URL pooler in .env, and created interactive Relational Database & Posts explorer UI.',
    },
    {
      id: 'log-2',
      date: '2026-10-04 12:37 UTC',
      author: 'AI Assistant',
      scope: 'Vercel Blob Storage Integration',
      files: [
        'server.ts',
        'api/blob.ts',
        '.env',
        '.env.example',
        'package.json',
        'src/types/index.ts',
        'src/components/BlobTab.tsx',
        'src/components/Navbar.tsx',
        'src/App.tsx',
        'README.md',
      ],
      summary:
        'Integrated @vercel/blob private file/asset storage, added server-side endpoints for put, get (with Cache-Control: private, no-cache), list, and del, configured BLOB_READ_WRITE_TOKEN, added Vercel Serverless Function /api/blob.ts, and built interactive Vercel Blob Manager UI with private stream preview.',
    },
    {
      id: 'log-1',
      date: '2026-10-04 12:10 UTC',
      author: 'AI Assistant',
      scope: 'Initial Infrastructure & Security Setup',
      files: [
        'README.md',
        'firebase-blueprint.json',
        'firestore.rules',
        'vercel.json',
        'package.json',
        'src/lib/firebase.ts',
        'src/context/AuthContext.tsx',
        'src/components/*',
        'src/App.tsx',
      ],
      summary:
        'Provisioned Firebase Firestore in asia-south1, deployed hardened ABAC security rules, configured Firebase Auth Google popup flow, created vercel.json with SPA rewrites & security headers, installed @vercel/analytics, and implemented developer portal dashboard with secure private vault.',
    },
  ];

  const handleGenerateRow = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    const row = `| ${now} | ${author || 'Developer'} | ${scope || 'Update'} | \`${filesModified || 'src/*'}\` | ${summary || 'Modifications completed.'} |`;
    setGeneratedMarkdown(row);
  };

  const copyRow = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopiedRow(true);
    setTimeout(() => setCopiedRow(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Mandatory Directive Callout */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              Mandatory Developer & Agent Policy
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">
              Change Reporting Directive (README.md)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Anyone working on this application—whether human software engineers, collaborators, or AI agents—<strong>must immediately report all modifications, additions, and architecture changes at the top of README.md</strong> before completing any work.
            </p>
          </div>
        </div>
      </div>

      {/* Change Log Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">Project Change History</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Synced with <span className="text-indigo-300">README.md</span>
          </span>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                    {entry.scope}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <User className="w-3 h-3 text-slate-500" />
                    {entry.author}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {entry.date}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{entry.summary}</p>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                  <Files className="w-3 h-3 text-slate-500" /> Files Affected:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entry.files.map((file) => (
                    <span
                      key={file}
                      className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contributor Row Generator Helper */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Generate Next README.md Change Record</h3>
        </div>
        <p className="text-xs text-slate-400">
          Working on a new feature or modification? Fill in the details below to format the required Markdown table row for <span className="font-mono text-slate-300">README.md</span>.
        </p>

        <form onSubmit={handleGenerateRow} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Name / Agent Handle</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. AI Assistant or Developer Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Scope / Feature</label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. User Profile Page, Custom Theme, API Proxy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Files Modified / Added</label>
              <input
                type="text"
                value={filesModified}
                onChange={(e) => setFilesModified(e.target.value)}
                placeholder="e.g. src/components/Dashboard.tsx, src/index.css"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Summary of Modifications</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. Added user profile tabs and protected route redirect logic"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            Format Change Entry
          </button>
        </form>

        {generatedMarkdown && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Generated Markdown Row for README.md:</span>
              <button
                onClick={copyRow}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
              >
                {copiedRow ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Row</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
              {generatedMarkdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
