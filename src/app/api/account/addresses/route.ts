import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { updateCustomerAddress } from "@/lib/accounts";
import { clientAuthOptions } from "@/lib/auth";
import { addressFormSchema } from "@/lib/customer-validation";
import { RequestBodyTooLargeError, parseJsonBody } from "@/lib/request";

export async function POST(request: Request) {
  const session = await getServerSession(clientAuthOptions);
  if (!session?.user.customerId) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await parseJsonBody(request, { maxBytes: 12 * 1024 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { error: "Os dados enviados excedem o tamanho permitido." },
        { status: 413 },
      );
    }

    throw error;
  }

  const parsed = addressFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Revise os dados do endereço.",
        errors: Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
        ),
      },
      { status: 400 },
    );
  }

  try {
    await updateCustomerAddress(
      session.user.customerId,
      body &&
        typeof body === "object" &&
        "addressId" in body &&
        typeof body.addressId === "string" &&
        body.addressId
        ? body.addressId
        : null,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json(
        { error: "Endereço não encontrado para este usuário." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível salvar o endereço agora." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
