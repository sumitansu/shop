import type { Request, Response, NextFunction } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Determine if Upstash Redis credentials are provided (from Upstash direct or Vercel KV integration)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let upstashRedis: Redis | null = null;
if (redisUrl && redisToken) {
  upstashRedis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

/**
 * Extracts the real client IP address from the request.
 * Relies on Express 'trust proxy' being configured so req.ip and X-Forwarded-For are parsed accurately.
 */
export function getClientIp(req: Request): string {
  if (req.ip) return req.ip;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

interface MemoryRateLimitRecord {
  timestamps: number[];
}

/**
 * Creates an Express middleware rate limiter.
 * Uses Upstash Redis when configured (shared distributed state across all Vercel serverless lambdas),
 * falling back seamlessly to an in-memory sliding window when credentials are not present (local dev / tests).
 */
export function createRateLimiter({
  limit,
  window,
  windowMs,
  prefix,
  errorMessage,
}: {
  limit: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
  windowMs: number;
  prefix: string;
  errorMessage: string;
}) {
  let upstashLimiter: Ratelimit | null = null;
  if (upstashRedis) {
    upstashLimiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `@upstash/ratelimit/${prefix}`,
      analytics: true,
    });
  }

  // In-memory sliding window store for local dev / offline fallback
  const memoryStore = new Map<string, MemoryRateLimitRecord>();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = getClientIp(req);
    const identifier = `${prefix}:${ip}`;

    if (upstashLimiter) {
      try {
        const { success, limit: maxLimit, remaining, reset } = await upstashLimiter.limit(identifier);

        res.setHeader('X-RateLimit-Limit', maxLimit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);

        if (!success) {
          const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
          res.setHeader('Retry-After', retryAfterSeconds);
          res.status(429).json({ error: errorMessage });
          return;
        }

        next();
        return;
      } catch (err: unknown) {
        console.error(`[RateLimit:${prefix}] Upstash check error, falling back to memory window:`, err);
        // Fall through to memory check on transient Upstash network failure
      }
    }

    // Memory sliding-window fallback
    const now = Date.now();
    const windowStart = now - windowMs;
    const record = memoryStore.get(identifier) || { timestamps: [] };

    // Prune timestamps older than sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0];
      const resetTime = oldest + windowMs;
      const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', resetTime);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({ error: errorMessage });
      return;
    }

    record.timestamps.push(now);
    memoryStore.set(identifier, record);

    // Periodically clean up stale map keys to avoid memory leaks
    if (memoryStore.size > 10000) {
      for (const [key, val] of memoryStore.entries()) {
        if (val.timestamps.length === 0 || val.timestamps[val.timestamps.length - 1] < windowStart) {
          memoryStore.delete(key);
        }
      }
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - record.timestamps.length));
    res.setHeader('X-RateLimit-Reset', now + windowMs);
    next();
  };
}

export const apiLimiter = createRateLimiter({
  limit: 100,
  window: '15 m',
  windowMs: 15 * 60 * 1000,
  prefix: 'api',
  errorMessage: 'Too many requests, please try again later.',
});

export const mutationLimiter = createRateLimiter({
  limit: 30,
  window: '15 m',
  windowMs: 15 * 60 * 1000,
  prefix: 'mutation',
  errorMessage: 'Rate limit exceeded for write operations, please try again later.',
});

export const publicShopLimiter = createRateLimiter({
  limit: 20,
  window: '15 m',
  windowMs: 15 * 60 * 1000,
  prefix: 'shop-public',
  errorMessage: 'Too many shop requests from this IP, please try again later.',
});
