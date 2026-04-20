import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail,
    })),
  },
}));

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMail.mockReset();
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "mailer@example.com";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM = "contato@example.com";
    process.env.CONTACT_EMAIL_TO = "loja@example.com";
  });

  it("returns validation errors for invalid payloads", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "A",
          email: "email-invalido",
          whatsapp: "99999",
          message: "curta",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Revise os campos do formulário e tente novamente.",
      errors: expect.objectContaining({
        name: "Informe seu nome.",
        email: "Informe um email válido.",
      }),
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("fails fast when SMTP is not configured", async () => {
    delete process.env.SMTP_HOST;
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Maria Silva",
          email: "maria@exemplo.com",
          whatsapp: "(93) 99999-9999",
          message: "Gostaria de saber mais sobre a entrega em Itaituba.",
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "O envio de email não está configurado no servidor.",
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("sends the email through Nodemailer when the payload is valid", async () => {
    sendMail.mockResolvedValue({ messageId: "test-id" });
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Maria Silva",
          email: "maria@exemplo.com",
          whatsapp: "(93) 99999-9999",
          message: "Gostaria de confirmar o prazo de entrega do meu pedido.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "contato@example.com",
        to: "loja@example.com",
        replyTo: "maria@exemplo.com",
        subject: "Novo contato PV Casa - Maria Silva",
      }),
    );
  });
});
