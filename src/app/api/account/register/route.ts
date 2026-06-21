import { NextResponse } from "next/server";
import { createCustomerAccount } from "@/lib/accounts";
import { registerCustomerSchema } from "@/lib/customer-validation";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { RequestBodyTooLargeError, parseJsonBody } from "@/lib/request";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `register:${getClientIp(request)}`,
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      "Muitas tentativas de cadastro. Aguarde um pouco e tente novamente.",
      rateLimit.retryAfterSeconds,
    );
  }

  let body: unknown;

  try {
    body = await parseJsonBody(request, { maxBytes: 16 * 1024 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { error: "Os dados enviados excedem o tamanho permitido." },
        { status: 413 },
      );
    }

    throw error;
  }

  const parsed = registerCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Revise os campos do cadastro.",
        errors: Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
        ),
      },
      { status: 400 },
    );
  }

  try {
    await createCustomerAccount(parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return NextResponse.json(
        {
          error: "Já existe uma conta cadastrada com este e-mail.",
          errors: { email: "Este e-mail já está em uso." },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "DATABASE_REQUIRED"
            ? "Configure o banco de dados para habilitar o cadastro."
            : "Não foi possível concluir o cadastro agora.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
