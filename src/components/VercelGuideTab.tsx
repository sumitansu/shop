import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';

export const VercelGuideTab: React.FC = () => {
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const vercelJsonCode = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(vercelJsonCode);
    setCopiedVercelJson(true);
    setTimeout(() => setCopiedVercelJson(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 md:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Vercel Hobby (Free Tier) Hosting</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Deployment & Vercel Free Tier Optimizations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              We have pre-configured all features available on Vercel&apos;s free tier to maximize performance, security, and developer analytics for your web application.
            </p>
          </div>

          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold shadow-lg shadow-white/10 transition-all shrink-0 cursor-pointer self-start sm:self-center"
          >
            <span>Open Vercel Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid of Free Tier Features Configured */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <span>Pre-Configured Vercel Free Tier Capabilities</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">SPA Routing Rewrites</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configured via <span className="font-mono text-slate-300">vercel.json</span> to route all paths to <span className="font-mono text-slate-300">index.html</span>, eliminating 404 errors on browser page reloads and deep links.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">HTTP Security Headers</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Custom edge headers enforce strict MIME type checking, iframe clickjacking protection (<span className="font-mono text-slate-300">DENY</span>), and secure referrer policies.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 w-fit">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Vercel Web Analytics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated with <span className="font-mono text-slate-300">@vercel/analytics</span>. Provides real-time page views, Core Web Vitals, and geographic insights on Vercel&apos;s free plan.
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step Checklist for the User */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>What YOU Need to Do on Your Side (Action Checklist)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Follow this interactive checklist to deploy your project live to Vercel in less than 3 minutes.
          </p>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div
            onClick={() => toggleStep(1)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              completedSteps[1]
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  completedSteps[1]
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
              >
                {completedSteps[1] ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">Push Code to Your GitHub Repository</h4>
                <p className="text-slate-400">
                  Ensure all project files (<span className="font-mono text-slate-300">vercel.json</span>, <span className="font-mono text-slate-300">firebase-applet-config.json</span>, <span className="font-mono text-slate-300">README.md</span>, and source code) are pushed to GitHub.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => toggleStep(2)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              completedSteps[2]
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  completedSteps[2]
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
              >
                {completedSteps[2] ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">Import into Vercel Free (Hobby) Plan</h4>
                <p className="text-slate-400">
                  Log into <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">vercel.com</a> with your GitHub account, click <strong>&quot;Add New...&quot; &gt; &quot;Project&quot;</strong>, and select your repository.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => toggleStep(3)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              completedSteps[3]
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  completedSteps[3]
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
              >
                {completedSteps[3] ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">Confirm Build & Output Settings</h4>
                <p className="text-slate-400">
                  Vercel automatically detects Vite from <span className="font-mono text-slate-300">vercel.json</span>. Verify:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Framework</span>
                    <span className="text-sky-400">Vite</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Build Command</span>
                    <span className="text-emerald-400">npm run build</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Output Directory</span>
                    <span className="text-purple-400">dist</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => toggleStep(4)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              completedSteps[4]
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  completedSteps[4]
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
              >
                {completedSteps[4] ? <Check className="w-3.5 h-3.5" /> : '4'}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">Add Vercel Domain to Firebase Auth Authorized Domains</h4>
                <p className="text-slate-400">
                  Once Vercel deploys, copy your assignment domain (e.g. <span className="font-mono text-slate-300">your-project.vercel.app</span>). Go to <a href="https://console.firebase.google.com/project/gen-lang-client-0174410808/authentication/settings" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</a> and add it. This ensures Google Sign-In popups work seamlessly on your live Vercel URL!
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div
            onClick={() => toggleStep(5)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              completedSteps[5]
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  completedSteps[5]
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
              >
                {completedSteps[5] ? <Check className="w-3.5 h-3.5" /> : '5'}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">Enable Free Analytics in Vercel Dashboard</h4>
                <p className="text-slate-400">
                  In your project view on Vercel, navigate to the <strong>&quot;Analytics&quot;</strong> tab and click <strong>&quot;Enable&quot;</strong>. The code is already configured with <span className="font-mono text-slate-300">@vercel/analytics</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer: vercel.json */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Configured `vercel.json` (Included in Root)</span>
          </div>
          <button
            onClick={copyConfig}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            {copiedVercelJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto">
          {vercelJsonCode}
        </pre>
      </div>
    </div>
  );
};
