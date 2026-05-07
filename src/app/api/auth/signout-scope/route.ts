import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/auth-cookies";

const signOutScopeSchema = z.object({
  scope: z.enum(["admin", "customer"]),
});

export async function POST(request: Request) {
  const parsed = signOutScopeSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Escopo de sessão inválido." }, { status: 400 });
  }

  const response = new NextResponse(null, { status: 204 });

  response.cookies.delete(
    parsed.data.scope === "admin" ? ADMIN_SESSION_COOKIE : CLIENT_SESSION_COOKIE,
  );

  return response;
}
