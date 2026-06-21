import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/auth-cookies";
import { RequestBodyTooLargeError, parseJsonBody } from "@/lib/request";

const signOutScopeSchema = z.object({
  scope: z.enum(["admin", "customer"]),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await parseJsonBody(request, { maxBytes: 1024 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Escopo de sessÃ£o invÃ¡lido." }, { status: 413 });
    }

    throw error;
  }

  const parsed = signOutScopeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Escopo de sessão inválido." }, { status: 400 });
  }

  const response = new NextResponse(null, { status: 204 });

  response.cookies.delete(
    parsed.data.scope === "admin" ? ADMIN_SESSION_COOKIE : CLIENT_SESSION_COOKIE,
  );

  return response;
}
