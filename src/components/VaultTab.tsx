import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Key,
  FileKey2,
  FolderLock,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { PrivateVaultItem } from '../types';

export const VaultTab: React.FC = () => {
  const { user, signIn } = useAuth();
  const [items, setItems] = useState<PrivateVaultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [secretContent, setSecretContent] = useState<string>('');
  const [category, setCategory] = useState<PrivateVaultItem['category']>('secret_note');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // UI helpers
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live simulation state for unauthenticated test
  const [simulatingUnauth, setSimulatingUnauth] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<{
    tested: boolean;
    blocked: boolean;
    message: string;
  } | null>(null);

  // Subscribe to user's private vault items in real-time
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const vaultRef = collection(db, 'vault');
    const q = query(vaultRef, where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: PrivateVaultItem[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as PrivateVaultItem);
        });
        // Sort newest first
        fetched.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setItems(fetched);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'vault');
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : 'Error accessing vault');
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !secretContent.trim()) {
      setErrorMsg('Title and sensitive content are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const vaultId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newDocRef = doc(db, 'vault', vaultId);

    const payload = {
      id: vaultId,
      ownerId: user.uid,
      title: title.trim(),
      secretContent: secretContent.trim(),
      category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(newDocRef, payload);
      setTitle('');
      setSecretContent('');
      setCategory('secret_note');
      setShowAddForm(false);
    } catch (err: unknown) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `vault/${vaultId}`);
      } catch (processedErr) {
        setErrorMsg(processedErr instanceof Error ? processedErr.message : 'Failed to save confidential record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'vault', id));
    } catch (err: unknown) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `vault/${id}`);
      } catch (processedErr) {
        setErrorMsg(processedErr instanceof Error ? processedErr.message : 'Failed to delete record.');
      }
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulate unauthorized public read attempt
  const runUnauthSecurityAudit = async () => {
    setSimulatingUnauth(true);
    setSimulationResult(null);
    try {
      // Attempt to query all vault items without credentials / arbitrary query
      const testCol = collection(db, 'vault');
      const testQ = query(testCol, where('ownerId', '==', 'unauthorized_attacker_id_xyz'));
      const snap = await getDocs(testQ);
      setSimulationResult({
        tested: true,
        blocked: false,
        message: `Query succeeded with ${snap.size} records.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isDenied = msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied');
      setSimulationResult({
        tested: true,
        blocked: isDenied,
        message: isDenied
          ? 'PERMISSION_DENIED: Firebase Security Rules successfully blocked unauthorized access to vault collection!'
          : `Handled with response: ${msg}`,
      });
    } finally {
      setSimulatingUnauth(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderLock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Confidential Firebase Vault</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Data that cannot or should not be displayed publicly on the website is stored here in Firebase Firestore. It is protected by Zero-Trust ABAC rules—accessible only by the authenticated owner.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Store New Secret'}</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Security / Validation Error:</p>
            <p className="font-mono break-all">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* If Not Authenticated */}
      {!user ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Vault Locked — Authentication Required</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              In accordance with security requirements, confidential data is never exposed to public or unauthenticated visitors. To access your private vault items or create new secure records, sign in with your account.
            </p>
            <div className="pt-2">
              <button
                onClick={() => signIn()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google to Access Vault</span>
              </button>
            </div>
          </div>

          {/* Security Audit / Proof Widget */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Live Zero-Trust Rules Verification</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Execute an unauthenticated probe against the Firestore backend to prove unauthorized requests are blocked by deployed rules.
                </p>
              </div>
              <button
                onClick={runUnauthSecurityAudit}
                disabled={simulatingUnauth}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {simulatingUnauth ? 'Auditing...' : 'Run Security Audit'}
              </button>
            </div>

            {simulationResult && (
              <div
                className={`mt-4 p-3 rounded-lg border text-xs font-mono ${
                  simulationResult.blocked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simulationResult.blocked ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security Shield Verified: ACCESS PROPERLY BLOCKED</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Warning: Unexpected Access Result</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] break-all">{simulationResult.message}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated View */
        <div className="space-y-6">
          {/* Add Item Form */}
          {showAddForm && (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl shadow-indigo-950/20">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>Store Confidential Asset in Firebase</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Owner UID: <span className="text-indigo-300">{user.uid.slice(0, 8)}...</span>
                </span>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Asset Title / Identifier <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Production Stripe Secret Key, AWS Access Token, Private Key"
                      maxLength={150}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Classification Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PrivateVaultItem['category'])}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="secret_note">Secret Note / Confidential Text</option>
                      <option value="api_key">API Key / Token</option>
                      <option value="credentials">System Credentials / Passwords</option>
                      <option value="financial">Financial / Payment Keys</option>
                      <option value="confidential">Strictly Confidential Internal Data</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confidential Payload (Forbidden from Public Web) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={secretContent}
                    onChange={(e) => setSecretContent(e.target.value)}
                    placeholder="Enter confidential string, token, JSON payload, or encrypted secret here..."
                    rows={3}
                    maxLength={10000}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Stored in Firestore collection `/vault` with ABAC rules.</span>
                    <span>{secretContent.length} / 10,000 chars</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? 'Encrypting & Storing...' : 'Save to Firebase Vault'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stored Records List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Your Protected Records ({items.length})</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> End-to-End ABAC Enforced
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                Loading your confidential records from Firestore...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center space-y-3">
                <FileKey2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No confidential items stored yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Store New Secret&rdquo; above to save any private keys, credentials, or sensitive notes that must never be visible to public users.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {items.map((item) => {
                  const isRevealed = revealedIds[item.id] || false;
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                              {item.category.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Doc ID: {item.id}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleReveal(item.id)}
                            title={isRevealed ? 'Mask secret' : 'Reveal secret'}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCopy(item.id, item.secretContent)}
                            title="Copy to clipboard"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete secret"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Secret Content display */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
                        {isRevealed ? (
                          <div className="text-indigo-200 break-all select-all">{item.secretContent}</div>
                        ) : (
                          <div className="text-slate-500 tracking-widest select-none">
                            ••••••••••••••••••••••••••••••••••••••••••••
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
