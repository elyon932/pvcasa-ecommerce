import "server-only";

import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var pvcasaRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = globalThis.pvcasaRateLimitStore ?? new Map<string, RateLimitEntry>();
let lastCleanupAt = 0;

globalThis.pvcasaRateLimitStore = store;

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();

  if (now - lastCleanupAt > 5 * 60 * 1000) {
    for (const [entryKey, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(entryKey);
      }
    }

    lastCleanupAt = now;
  }

  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(message: string, retryAfterSeconds: number) {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
      },
    },
  );
}
