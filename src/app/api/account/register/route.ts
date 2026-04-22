import { NextResponse } from "next/server";
import { createCustomerAccount } from "@/lib/accounts";
import { registerCustomerSchema } from "@/lib/customer-validation";

export async function POST(request: Request) {
  const body = await request.json();
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
