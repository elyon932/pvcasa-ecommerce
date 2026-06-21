import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-cookies";
import { ADMIN_SESSION_MAX_AGE, authorizeAdminCredentials } from "@/lib/auth";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { RequestBodyTooLargeError, parseJsonBody } from "@/lib/request";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
    maxAge: ADMIN_SESSION_MAX_AGE,
    expires: new Date(Date.now() + ADMIN_SESSION_MAX_AGE * 1000),
  };
}

export async function POST(request: Request) {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Autenticação não configurada." }, { status: 503 });
  }

  const rateLimit = checkRateLimit({
    key: `admin-login:${getClientIp(request)}`,
    limit: 6,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      "Muitas tentativas de login. Aguarde um pouco e tente novamente.",
      rateLimit.retryAfterSeconds,
    );
  }

  let body: unknown;

  try {
    body = await parseJsonBody(request, { maxBytes: 2 * 1024 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Credenciais invÃ¡lidas." }, { status: 413 });
    }

    throw error;
  }

  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 400 });
  }

  const admin = await authorizeAdminCredentials(parsed.data.email, parsed.data.password);

  if (!admin) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const sessionToken = await encode({
    secret,
    maxAge: ADMIN_SESSION_MAX_AGE,
    token: {
      name: admin.name,
      email: admin.email,
      sub: admin.id,
      role: "admin",
      isAdmin: true,
    },
  });
  const response = NextResponse.json({ success: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, sessionCookieOptions());

  return response;
}
