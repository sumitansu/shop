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

// Maximum allowed blob upload size (4.5 MB Vercel Serverless payload cap)
export const MAX_BLOB_FILE_SIZE_BYTES = 4.5 * 1024 * 1024;

export interface ValidationResult<T = unknown> {
  valid: boolean;
  error?: string;
  data?: T;
}

/**
 * Verifies that the initial bytes (magic numbers) of a file buffer
 * match the declared MIME Content-Type.
 * Supported types: image/png, image/jpeg, image/webp, application/pdf.
 */
export function verifyMagicBytes(
  buffer: Buffer | Uint8Array,
  declaredContentType: AllowedBlobContentType
): ValidationResult<boolean> {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'File content is empty' };
  }

  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  switch (declaredContentType) {
    case 'image/png': {
      // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
      const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      if (bytes.length < 8) {
        return { valid: false, error: 'File too small to be a valid PNG' };
      }
      for (let i = 0; i < pngHeader.length; i++) {
        if (bytes[i] !== pngHeader[i]) {
          return {
            valid: false,
            error: `Security Violation: File header does not match declared Content-Type "image/png" (magic bytes mismatch)`,
          };
        }
      }
      return { valid: true, data: true };
    }

    case 'image/jpeg': {
      // JPEG magic number: FF D8 FF
      if (bytes.length < 3) {
        return { valid: false, error: 'File too small to be a valid JPEG' };
      }
      if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
        return {
          valid: false,
          error: `Security Violation: File header does not match declared Content-Type "image/jpeg" (magic bytes mismatch)`,
        };
      }
      return { valid: true, data: true };
    }

    case 'image/webp': {
      // WebP header: 'RIFF' at bytes 0..3 and 'WEBP' at bytes 8..11
      if (bytes.length < 12) {
        return { valid: false, error: 'File too small to be a valid WebP' };
      }
      const riff = bytes.subarray(0, 4).toString('ascii');
      const webp = bytes.subarray(8, 12).toString('ascii');
      if (riff !== 'RIFF' || webp !== 'WEBP') {
        return {
          valid: false,
          error: `Security Violation: File header does not match declared Content-Type "image/webp" (magic bytes mismatch)`,
        };
      }
      return { valid: true, data: true };
    }

    case 'application/pdf': {
      // PDF header: '%PDF'
      if (bytes.length < 4) {
        return { valid: false, error: 'File too small to be a valid PDF' };
      }
      const pdf = bytes.subarray(0, 4).toString('ascii');
      if (pdf !== '%PDF') {
        return {
          valid: false,
          error: `Security Violation: File header does not match declared Content-Type "application/pdf" (magic bytes mismatch)`,
        };
      }
      return { valid: true, data: true };
    }

    default:
      return {
        valid: false,
        error: `Unsupported content type for magic byte verification: ${declaredContentType}`,
      };
  }
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

