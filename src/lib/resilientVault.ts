import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SecretRecord {
  key: string;
  value: string;
  updatedAt: string;
  lastProviderUsed?: string;
  providersSynced?: string[];
}

export interface FallbackResult {
  success: boolean;
  value?: string;
  providerUsed?: 'firestore' | 'supabase' | 'neon' | 'vercel_blob';
  fallbackChain: { provider: string; status: 'success' | 'failed' | 'rate_limited'; error?: string }[];
}

/**
 * Resilient Vault Service
 * Enforces the quad-storage policy:
 * 1. Firebase Firestore
 * 2. Neon PostgreSQL
 * 3. Supabase
 * 4. Vercel Blob
 *
 * Automatically falls back to the next available provider if one hits rate limits or downtime.
 */
export async function resilientGetSecret(key: string): Promise<FallbackResult> {
  const fallbackChain: FallbackResult['fallbackChain'] = [];

  // Attempt 1: Server proxy fallback endpoint (checks Neon -> Supabase -> Vercel Blob)
  try {
    const res = await fetch(`/api/vault/get?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.value !== undefined) {
        return {
          success: true,
          value: data.value,
          providerUsed: data.providerUsed,
          fallbackChain: data.fallbackChain || [{ provider: data.providerUsed, status: 'success' }],
        };
      }
    }
  } catch (err: unknown) {
    fallbackChain.push({
      provider: 'server_gateway',
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Attempt 2: Direct Client Firestore Read as robust fallback
  try {
    const ref = doc(db, 'vault_secrets', key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      fallbackChain.push({ provider: 'firestore', status: 'success' });
      return {
        success: true,
        value: snap.data().value,
        providerUsed: 'firestore',
        fallbackChain,
      };
    }
  } catch (err: unknown) {
    fallbackChain.push({
      provider: 'firestore',
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return {
    success: false,
    fallbackChain,
  };
}

/**
 * Multi-Sync Write: Replicates secrets across all 4 storage targets simultaneously.
 */
export async function resilientSaveSecret(key: string, value: string): Promise<{
  success: boolean;
  results: Record<string, boolean>;
}> {
  const results: Record<string, boolean> = {
    firestore: false,
    neon: false,
    supabase: false,
    vercel_blob: false,
  };

  // 1. Write to Firestore
  try {
    await setDoc(doc(db, 'vault_secrets', key), {
      key,
      value,
      updatedAt: new Date().toISOString(),
    });
    results.firestore = true;
  } catch (err) {
    console.warn('Firestore sync warning:', err);
  }

  // 2. Write to Server-managed targets (Neon, Supabase, Vercel Blob)
  try {
    const res = await fetch('/api/vault/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      const data = await res.json();
      results.neon = Boolean(data.neon);
      results.supabase = Boolean(data.supabase);
      results.vercel_blob = Boolean(data.vercel_blob);
    }
  } catch (err) {
    console.warn('Server storage sync warning:', err);
  }

  const success = Object.values(results).some(Boolean);
  return { success, results };
}
