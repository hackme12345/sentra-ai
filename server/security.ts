import type { Request, Response, NextFunction } from 'express';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

interface RateRecord {
  timestamps: number[];
}

const rateBuckets = new Map<string, RateRecord>();

/**
 * In-memory sliding-window rate limiter per client IP.
 * Keeps no persistent logs or user content.
 */
export function createRateLimiter(options: { windowMs: number; maxRequests: number }) {
  const { windowMs, maxRequests } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()) ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const record = rateBuckets.get(clientIp) || { timestamps: [] };
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many scan requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
        retryAfterSeconds,
      });
      return;
    }

    record.timestamps.push(now);
    rateBuckets.set(clientIp, record);

    // Prevent unbounded map growth in long-running instances
    if (rateBuckets.size > 2000) {
      for (const [key, value] of rateBuckets.entries()) {
        if (value.timestamps.every((ts) => now - ts >= windowMs)) {
          rateBuckets.delete(key);
        }
      }
    }

    next();
  };
}

/**
 * Validates base64 image payload size (<= 5 MB) and verifies magic bytes match declared MIME type.
 */
export function validateImageUpload(
  base64Input: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): { valid: true; cleanBase64: string; byteLength: number } | { valid: false; reason: string } {
  const cleaned = base64Input.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();

  if (!cleaned || !/^[A-Za-z0-9+/=\r\n]+$/.test(cleaned)) {
    return { valid: false, reason: 'Invalid image encoding.' };
  }

  const buffer = Buffer.from(cleaned, 'base64');
  if (buffer.length === 0) {
    return { valid: false, reason: 'Uploaded image file is empty.' };
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    return { valid: false, reason: 'Image exceeds the 5 MB upload size limit.' };
  }

  if (buffer.length < 12) {
    return { valid: false, reason: 'File is too small to be a valid image.' };
  }

  // Magic-byte verification
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  const isWebp =
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  if (mimeType === 'image/jpeg' && !isJpeg) {
    return { valid: false, reason: 'File signature does not match JPEG format.' };
  }
  if (mimeType === 'image/png' && !isPng) {
    return { valid: false, reason: 'File signature does not match PNG format.' };
  }
  if (mimeType === 'image/webp' && !isWebp) {
    return { valid: false, reason: 'File signature does not match WEBP format.' };
  }

  return { valid: true, cleanBase64: cleaned, byteLength: buffer.length };
}

/**
 * Strips control characters (except newlines and tabs) from untrusted text inputs.
 */
export function sanitizeUntrustedText(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}
