import { NextResponse } from "next/server";

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("REQUEST_BODY_TOO_LARGE");
  }
}

export async function parseJsonBody(
  request: Request,
  options: { maxBytes?: number } = {},
) {
  const maxBytes = options.maxBytes ?? 64 * 1024;
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > maxBytes) {
    throw new RequestBodyTooLargeError();
  }

  const body = await request.text().catch(() => null);

  if (body === null) {
    return null;
  }

  if (new TextEncoder().encode(body).length > maxBytes) {
    throw new RequestBodyTooLargeError();
  }

  try {
    return body.trim() ? JSON.parse(body) : null;
  } catch {
    return null;
  }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
