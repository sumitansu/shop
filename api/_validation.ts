/**
 * Input validation, sanitization, and security guardrails for DoRaemon's Shop.
 * Enforces strict character allow-lists, length boundaries, and contentType constraints.
 */

// Allow-listed MIME types for file/blob storage
export const ALLOWED_BLOB_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedBlobContentType = (typeof ALLOWED_BLOB_CONTENT_TYPES)[number];

export interface ValidationResult<T = unknown> {
  valid: boolean;
  error?: string;
  data?: T;
}

/**
 * Validates and sanitizes a blob pathname:
 * - Allowed characters: only [a-z0-9/_.-]
 * - Must NOT contain ".." (directory traversal)
 * - Must NOT have a leading "/"
 * - Length: 1 to 255 characters
 */
export function sanitizeBlobPathname(pathname: unknown): ValidationResult<string> {
  if (typeof pathname !== 'string' || !pathname.trim()) {
    return { valid: false, error: 'Pathname is required and must be a non-empty string' };
  }

  const clean = pathname.trim().toLowerCase();

  if (clean.length > 255) {
    return { valid: false, error: 'Pathname exceeds maximum length of 255 characters' };
  }

  if (clean.startsWith('/')) {
    return { valid: false, error: 'Pathname must not have a leading slash' };
  }

  if (clean.includes('..')) {
    return { valid: false, error: 'Pathname must not contain directory traversal sequences ("..")' };
  }

  const validPathRegex = /^[a-z0-9_./-]+$/;
  if (!validPathRegex.test(clean)) {
    return {
      valid: false,
      error: 'Pathname contains illegal characters. Allowed: lowercase letters, numbers, slash, underscore, period, hyphen',
    };
  }

  return { valid: true, data: clean };
}

/**
 * Validates contentType against strict allow-list:
 * Specifically rejects HTML, SVG, scripts, and unapproved types.
 */
export function validateBlobContentType(contentType: unknown): ValidationResult<AllowedBlobContentType> {
  if (typeof contentType !== 'string' || !contentType.trim()) {
    return { valid: false, error: 'Content-Type is required' };
  }

  const normalized = contentType.split(';')[0].trim().toLowerCase();

  // Explicit safety block against scriptable vectors
  if (
    normalized.includes('html') ||
    normalized.includes('svg') ||
    normalized.includes('xml') ||
    normalized.includes('javascript')
  ) {
    return { valid: false, error: 'Prohibited Content-Type: HTML, SVG, XML, and scripts are strictly forbidden' };
  }

  if (!ALLOWED_BLOB_CONTENT_TYPES.includes(normalized as AllowedBlobContentType)) {
    return {
      valid: false,
      error: `Invalid Content-Type "${normalized}". Allowed types: ${ALLOWED_BLOB_CONTENT_TYPES.join(', ')}`,
    };
  }

  return { valid: true, data: normalized as AllowedBlobContentType };
}

/**
 * Validates integer or alphanumeric identifier:
 * - Max length 128 characters
 * - Characters: [a-zA-Z0-9_-]
 */
export function validateIdentifier(id: unknown): ValidationResult<string> {
  if (id === undefined || id === null) {
    return { valid: false, error: 'Identifier is required' };
  }

  const stringId = String(id).trim();
  if (!stringId) {
    return { valid: false, error: 'Identifier cannot be empty' };
  }

  if (stringId.length > 128) {
    return { valid: false, error: 'Identifier exceeds maximum length of 128 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(stringId)) {
    return { valid: false, error: 'Identifier contains invalid characters' };
  }

  return { valid: true, data: stringId };
}

