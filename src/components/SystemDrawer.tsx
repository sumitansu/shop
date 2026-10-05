import React, { useState } from 'react';
import { X, Shield, Database, Lock, Globe, FileText, HardDrive, Table, Zap } from 'lucide-react';
import { VaultTab } from './VaultTab';
import { DatabaseTab } from './DatabaseTab';
import { SupabaseTab } from './SupabaseTab';
import { BlobTab } from './BlobTab';
import { AuthTab } from './AuthTab';
import { VercelGuideTab } from './VercelGuideTab';
import { ChangelogTab } from './ChangelogTab';
import { OverviewTab } from './OverviewTab';

interface SystemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isFirebaseConnected: boolean;
  setIsFirebaseConnected: (val: boolean) => void;
}

export const SystemDrawer: React.FC<SystemDrawerProps> = ({
  isOpen,
  onClose,
  isFirebaseConnected,
  setIsFirebaseConnected,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'vault' | 'neon' | 'supabase' | 'blob' | 'auth' | 'vercel' | 'changelog'
  >('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-950 border-l border-slate-800 flex flex-col h-full shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">System Architecture &amp; Storage Inspector</h2>
              <p className="text-xs text-slate-400">Quad-Storage Redundancy &amp; Developer Tools</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('vault')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'vault' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Firebase Vault</span>
          </button>
          <button
            onClick={() => setActiveSubTab('neon')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'neon' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Neon Postgres</span>
          </button>
          <button
            onClick={() => setActiveSubTab('supabase')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'supabase' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Supabase</span>
          </button>
          <button
            onClick={() => setActiveSubTab('blob')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'blob' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Vercel Blob</span>
          </button>
          <button
            onClick={() => setActiveSubTab('auth')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'auth' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auth
          </button>
          <button
            onClick={() => setActiveSubTab('vercel')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'vercel' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vercel Setup
          </button>
          <button
            onClick={() => setActiveSubTab('changelog')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'changelog' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>README Log</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSubTab === 'overview' && (
            <OverviewTab
              setActiveTab={(tab) => {
                if (tab === 'vault') setActiveSubTab('vault');
                if (tab === 'database') setActiveSubTab('neon');
                if (tab === 'supabase') setActiveSubTab('supabase');
                if (tab === 'blob') setActiveSubTab('blob');
                if (tab === 'auth') setActiveSubTab('auth');
                if (tab === 'vercel') setActiveSubTab('vercel');
                if (tab === 'changelog') setActiveSubTab('changelog');
              }}
              isFirebaseConnected={isFirebaseConnected}
              setIsFirebaseConnected={setIsFirebaseConnected}
            />
          )}
          {activeSubTab === 'vault' && <VaultTab />}
          {activeSubTab === 'neon' && <DatabaseTab />}
          {activeSubTab === 'supabase' && <SupabaseTab />}
          {activeSubTab === 'blob' && <BlobTab />}
          {activeSubTab === 'auth' && <AuthTab />}
          {activeSubTab === 'vercel' && <VercelGuideTab />}
          {activeSubTab === 'changelog' && <ChangelogTab />}
        </div>
      </div>
    </div>
  );
};
