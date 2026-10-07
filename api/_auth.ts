import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  'gen-lang-client-0174410808';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  payload: JWTPayload;
}

export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; status: 401; error: string };

/**
 * Verifies a Firebase ID token from an Authorization: Bearer <token> header.
 * Compatible with Node.js and Edge/Serverless runtimes via jose (Web Crypto).
 */
export async function verifyAuthHeader(authHeader?: string | null): Promise<AuthResult> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      status: 401,
      error: 'Unauthorized',
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      success: false,
      status: 401,
      error: 'Unauthorized',
    };
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    const uid = (payload.sub || (payload as Record<string, unknown>).user_id) as string;
    if (!uid) {
      return {
        success: false,
        status: 401,
        error: 'Unauthorized',
      };
    }

    return {
      success: true,
      user: {
        uid,
        email: payload.email as string | undefined,
        emailVerified: Boolean(payload.email_verified),
        payload,
      },
    };
  } catch (err: unknown) {
    console.error('JWT verification error:', err);
    return {
      success: false,
      status: 401,
      error: 'Unauthorized',
    };
  }
}

/**
 * Checks whether the given UID is listed in the ADMIN_UID environment variable.
 * If ADMIN_UID is not set or empty, all admin checks return false (fail closed).
 */
export function isAdminUser(uid?: string | null): boolean {
  if (!uid) return false;
  const adminUidEnv = process.env.ADMIN_UID;
  if (!adminUidEnv || !adminUidEnv.trim()) {
    return false;
  }
  const allowedUids = adminUidEnv.split(',').map((id) => id.trim()).filter(Boolean);
  return allowedUids.includes(uid);
}

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends ExpressRequest {
  user?: AuthenticatedUser;
}

/**
 * Express middleware to enforce a verified Firebase ID token on routes.
 */
export async function expressRequireAuth(
  req: AuthenticatedRequest,
  res: ExpressResponse,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const result = await verifyAuthHeader(authHeader);

  if (!result.success) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  req.user = result.user;
  next();
}

/**
 * Express middleware to enforce that the authenticated user's UID matches ADMIN_UID.
 */
export function expressRequireAdmin(
  req: AuthenticatedRequest,
  res: ExpressResponse,
  next: NextFunction
): void {
  if (!req.user || !isAdminUser(req.user.uid)) {
    res.status(403).json({
      error: 'Forbidden: Administrator privileges required (UID does not match ADMIN_UID)',
    });
    return;
  }
  next();
}
