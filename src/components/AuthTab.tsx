import React from 'react';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  LogIn,
  LogOut,
  Copy,
  Check,
  Code2,
  User,
  Mail,
  Fingerprint,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig } from '../lib/firebase';

export const AuthTab: React.FC = () => {
  const { user, userProfile, signIn, signOut, loading, error } = useAuth();
  const [copiedToken, setCopiedToken] = React.useState(false);

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Firebase Authentication Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Configured with Google OAuth Popup flow and persistent user identity. Reserved for all future user account and role management.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <strong>Authentication Error:</strong> {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Session Card */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Current Identity State</span>
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                user
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {user ? 'Authenticated' : 'Guest'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
              Verifying authentication state...
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-12 h-12 rounded-xl ring-2 ring-indigo-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.displayName || 'Google User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-400" /> UID:
                  </span>
                  <button
                    onClick={copyUid}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="truncate max-w-[120px]">{user.uid}</span>
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified:
                  </span>
                  <span className="text-emerald-400">{user.emailVerified ? 'true' : 'false'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Registered:
                  </span>
                  <span className="text-slate-300">
                    {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Session</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center py-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">No Active Session</p>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate with Google to activate user session and access protected features.
                </p>
              </div>

              <button
                onClick={() => signIn()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Columns: Developer Guidelines for Authentication */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Developer Directive: Future Auth Implementation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              As required by the project specifications, Firebase Authentication is pre-wired to serve as the unified authentication provider across all pages. Any contributor or AI agent implementing future pages, dashboards, or protected endpoints must follow these conventions:
            </p>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
              <div className="text-slate-500">// 1. Import useAuth hook in any React component</div>
              <div className="text-indigo-300">import &#123; useAuth &#125; from &apos;../context/AuthContext&apos;;</div>
              <div className="text-slate-500 mt-2">// 2. Access current authenticated user and methods</div>
              <div>const &#123; user, signIn, signOut &#125; = useAuth();</div>
              <div className="text-slate-500 mt-2">// 3. Enforce permission checks before mutative operations</div>
              <div>if (!user) &#123; throw new Error(&quot;User must be logged in&quot;); &#125;</div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">OAuth & Security Config Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">Auth Domain</span>
                <span className="text-slate-200 break-all">{firebaseConfig.authDomain}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">OAuth Client ID</span>
                <span className="text-slate-200 break-all">{firebaseConfig.oAuthClientId || 'Configured via Firebase'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              Note: When deploying to Vercel, remember to add your production Vercel domain to the Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
