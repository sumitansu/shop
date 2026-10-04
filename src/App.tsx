import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, TabType } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { VaultTab } from './components/VaultTab';
import { AuthTab } from './components/AuthTab';
import { VercelGuideTab } from './components/VercelGuideTab';
import { ChangelogTab } from './components/ChangelogTab';
import { testConnection } from './lib/firebase';
import { Shield, ExternalLink, Github, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  useEffect(() => {
    // Validate connection to Firestore on initial boot
    async function initCheck() {
      try {
        const res = await testConnection();
        setIsFirebaseConnected(res.success);
      } catch (err) {
        console.error('Initial Firestore connection check failed:', err);
        setIsFirebaseConnected(false);
      }
    }
    initCheck();
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isFirebaseConnected={isFirebaseConnected}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewTab
              setActiveTab={setActiveTab}
              isFirebaseConnected={isFirebaseConnected}
              setIsFirebaseConnected={setIsFirebaseConnected}
            />
          )}
          {activeTab === 'vault' && <VaultTab />}
          {activeTab === 'auth' && <AuthTab />}
          {activeTab === 'vercel' && <VercelGuideTab />}
          {activeTab === 'changelog' && <ChangelogTab />}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-300">CloudSecure</span>
              <span>—</span>
              <span>Hardened Firebase ABAC &amp; Vercel Ready</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('changelog')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                README.md Log Policy
              </button>
              <button
                onClick={() => setActiveTab('vercel')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Vercel Free Tier Setup
              </button>
              <a
                href="https://firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-slate-300 transition-colors"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
