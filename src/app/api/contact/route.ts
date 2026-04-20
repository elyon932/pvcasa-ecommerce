import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .regex(/^[\p{L}\s]+$/u, "O nome deve conter apenas letras."),
  email: z.string().trim().email("Informe um email válido."),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, "Informe o Whatsapp no formato (DDD) XXXXX-XXXX."),
  message: z.string().trim().min(10, "Escreva uma mensagem com pelo menos 10 caracteres."),
});

const DEFAULT_STORE_EMAIL = "pvcasaoficial@gmail.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return NextResponse.json(
      {
        error: "Revise os campos do formulário e tente novamente.",
        errors: {
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          whatsapp: fieldErrors.whatsapp?.[0],
          message: fieldErrors.message?.[0],
        },
      },
      { status: 400 },
    );
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? DEFAULT_STORE_EMAIL;
  const to = process.env.CONTACT_EMAIL_TO ?? DEFAULT_STORE_EMAIL;

  if (!host || !user || !pass || !Number.isFinite(port)) {
    return NextResponse.json(
      {
        error: "O envio de email não está configurado no servidor.",
      },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: parsed.data.email,
      subject: `Novo contato PV Casa - ${parsed.data.name}`,
      text: [
        `Nome: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Whatsapp: ${parsed.data.whatsapp}`,
        "",
        "Mensagem:",
        parsed.data.message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #22160f; line-height: 1.6;">
          <h2 style="margin-bottom: 16px;">Novo contato recebido pelo site</h2>
          <p><strong>Nome:</strong> ${escapeHtml(parsed.data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
          <p><strong>Whatsapp:</strong> ${escapeHtml(parsed.data.whatsapp)}</p>
          <p style="margin-top: 20px;"><strong>Mensagem:</strong></p>
          <p>${escapeHtml(parsed.data.message).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível enviar a mensagem no momento.",
      },
      { status: 500 },
    );
  }
}
