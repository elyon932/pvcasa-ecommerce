"use client";

import { useMemo, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import {
  formatBrazilPhone,
  formatPostalCode,
  registerCustomerSchema,
} from "@/lib/customer-validation";

type CustomerRegisterFormProps = {
  callbackUrl?: string;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

type RegisterFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  postalCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
};

const INITIAL_STATE: RegisterFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  postalCode: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  complement: "",
};

export function CustomerRegisterForm({
  callbackUrl = "/account",
  onSuccess,
  onSwitchToLogin,
}: CustomerRegisterFormProps) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const formFields = useMemo(
    () => [
      {
        name: "name",
        label: "Nome completo",
        placeholder: "Maria Silva",
        span: "sm:col-span-2",
      },
      { name: "email", label: "Email", placeholder: "maria@exemplo.com" },
      { name: "phone", label: "Telefone", placeholder: "(93) 99111-2233" },
      { name: "password", label: "Senha", placeholder: "Crie uma senha segura", type: "password" },
      { name: "postalCode", label: "CEP", placeholder: "68180-220" },
      { name: "street", label: "Rua", placeholder: "Rua das Flores", span: "sm:col-span-2" },
      { name: "number", label: "Número", placeholder: "125" },
      { name: "neighborhood", label: "Bairro", placeholder: "Centro" },
      { name: "city", label: "Cidade", placeholder: "Itaituba" },
      { name: "state", label: "UF", placeholder: "PA" },
      {
        name: "complement",
        label: "Complemento",
        placeholder: "Casa, apartamento ou referência",
        span: "sm:col-span-2",
      },
    ],
    [],
  );

  const updateField = (field: keyof RegisterFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        setServerError("");

        const parsed = registerCustomerSchema.safeParse(form);
        if (!parsed.success) {
          const nextErrors: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const field = String(issue.path[0] ?? "");
            if (field && !nextErrors[field]) {
              nextErrors[field] = issue.message;
            }
          }
          setErrors(nextErrors);
          return;
        }

        startTransition(async () => {
          const response = await fetch("/api/account/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parsed.data),
          });

          const data = (await response.json()) as {
            error?: string;
            errors?: Record<string, string>;
          };

          if (!response.ok) {
            setErrors(data.errors ?? {});
            setServerError(data.error ?? "Não foi possível criar sua conta.");
            return;
          }

          const signInResponse = await signIn("customer-credentials", {
            redirect: false,
            email: parsed.data.email,
            password: parsed.data.password,
            callbackUrl,
          });

          onSuccess?.();
          window.location.href = signInResponse?.url ?? callbackUrl;
        });
      }}
    >
      {formFields.map((field) => (
        <div key={field.name} className={`space-y-2 ${field.span ?? ""}`}>
          <label
            htmlFor={field.name}
            className="text-sm font-medium text-[color:var(--wood-dark)]"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            value={form[field.name as keyof RegisterFormState]}
            onChange={(event) => {
              const { value } = event.target;

              if (field.name === "name") {
                updateField("name", value.replace(/[^\p{L}\s]/gu, ""));
                return;
              }

              if (field.name === "phone") {
                updateField("phone", formatBrazilPhone(value));
                return;
              }

              if (field.name === "postalCode") {
                updateField("postalCode", formatPostalCode(value));
                return;
              }

              if (field.name === "state") {
                updateField("state", value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2));
                return;
              }

              updateField(field.name as keyof RegisterFormState, value);
            }}
            placeholder={field.placeholder}
            autoComplete={
              field.name === "name"
                ? "name"
                : field.name === "email"
                  ? "email"
                  : field.name === "phone"
                    ? "tel"
                    : field.name === "password"
                      ? "new-password"
                      : field.name === "postalCode"
                        ? "postal-code"
                        : "off"
            }
            className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
            aria-invalid={Boolean(errors[field.name])}
          />
          {errors[field.name] ? (
            <p className="text-sm text-[color:#b1412c]">{errors[field.name]}</p>
          ) : null}
        </div>
      ))}

      {serverError ? <p className="text-sm text-[color:#b1412c] sm:col-span-2">{serverError}</p> : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60"
        >
          {isPending ? "Criando conta..." : "Criar conta"}
        </button>
      </div>
      {onSwitchToLogin ? (
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
          >
            Entrar na conta
          </button>
        </div>
      ) : null}
    </form>
  );
}
