"use client";

import { useEffect, useId, useState } from "react";

type ContactFormState = {
  name: string;
  email: string;
  whatsapp: string;
  message: string;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

const INITIAL_FORM_STATE: ContactFormState = {
  name: "",
  email: "",
  whatsapp: "",
  message: "",
};

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = useId();

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 4000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateField = <Field extends keyof ContactFormState>(
    field: Field,
    value: ContactFormState[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleNameChange = (value: string) => {
    updateField("name", value.replace(/[^\p{L}\s]/gu, ""));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        errors?: Partial<Record<keyof ContactFormState, string>>;
        error?: string;
      };

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setToast({
          tone: "error",
          message: data.error ?? "Não foi possível enviar sua mensagem agora.",
        });
        return;
      }

      setForm(INITIAL_FORM_STATE);
      setErrors({});
      setToast({
        tone: "success",
        message: "Mensagem enviada com sucesso. Agradecemos o seu contato.",
      });
    } catch {
      setToast({
        tone: "error",
        message: "Não foi possível enviar sua mensagem agora.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label
            htmlFor={`${formId}-name`}
            className="text-sm font-medium text-[color:var(--wood-dark)]"
          >
            Nome
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={form.name}
            onChange={(event) => handleNameChange(event.target.value)}
            autoComplete="name"
            placeholder="Maria"
            className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="text-sm text-[color:#b1412c]">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${formId}-email`}
            className="text-sm font-medium text-[color:var(--wood-dark)]"
          >
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            placeholder="maria@exemplo.com"
            className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="text-sm text-[color:#b1412c]">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${formId}-whatsapp`}
            className="text-sm font-medium text-[color:var(--wood-dark)]"
          >
            Whatsapp
          </label>
          <input
            id={`${formId}-whatsapp`}
            type="tel"
            value={form.whatsapp}
            onChange={(event) => updateField("whatsapp", formatWhatsapp(event.target.value))}
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
            aria-invalid={Boolean(errors.whatsapp)}
          />
          {errors.whatsapp ? (
            <p className="text-sm text-[color:#b1412c]">{errors.whatsapp}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${formId}-message`}
            className="text-sm font-medium text-[color:var(--wood-dark)]"
          >
            Mensagem
          </label>
          <textarea
            id={`${formId}-message`}
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={6}
            placeholder="Conte como podemos ajudar com seu pedido, produto ou entrega."
            className="w-full resize-none rounded-[1.5rem] border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message ? (
            <p className="text-sm text-[color:#b1412c]">{errors.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Entrar em contato"}
        </button>
      </form>

      {toast ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[70] max-w-sm">
          <div
            className={`rounded-[1.5rem] border px-5 py-4 shadow-[0_18px_40px_rgba(60,38,22,0.14)] ${
              toast.tone === "success"
                ? "border-[color:rgba(47,122,60,0.16)] bg-white text-[color:var(--wood-dark)]"
                : "border-[color:rgba(177,65,44,0.16)] bg-white text-[color:var(--wood-dark)]"
            }`}
            role="status"
            aria-live="polite"
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.28em] ${
                toast.tone === "success" ? "text-[color:#2f7a3c]" : "text-[color:#b1412c]"
              }`}
            >
              {toast.tone === "success" ? "Mensagem enviada" : "Falha no envio"}
            </p>
            <p className="mt-2 text-sm leading-6">{toast.message}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
