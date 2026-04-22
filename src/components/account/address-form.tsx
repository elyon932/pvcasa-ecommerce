"use client";

import { useState, useTransition } from "react";
import { addressFormSchema, formatBrazilPhone, formatPostalCode } from "@/lib/customer-validation";
import type { CustomerAddress } from "@/types/store";

type AddressFormProps = {
  primaryAddress: CustomerAddress | null;
  secondaryAddress: CustomerAddress | null;
};

type FormState = {
  label: string;
  recipientName: string;
  phone: string;
  postalCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  type: "PRIMARY" | "SECONDARY";
};

function toInitialState(address: CustomerAddress | null, type: "PRIMARY" | "SECONDARY"): FormState {
  return {
    label: address?.label ?? (type === "PRIMARY" ? "Endereço principal" : "Endereço secundário"),
    recipientName: address?.recipientName ?? "",
    phone: address?.phone ?? "",
    postalCode: address?.postalCode ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    neighborhood: address?.neighborhood ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    complement: address?.complement ?? "",
    type,
  };
}

function AddressSection({
  title,
  address,
  type,
}: {
  title: string;
  address: CustomerAddress | null;
  type: "PRIMARY" | "SECONDARY";
}) {
  const [form, setForm] = useState<FormState>(() => toInitialState(address, type));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  return (
    <section className="surface-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-[color:var(--wood-dark)]">{title}</h2>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback("");

          const parsed = addressFormSchema.safeParse(form);
          if (!parsed.success) {
            const nextErrors: Record<string, string> = {};
            for (const issue of parsed.error.issues) {
              const key = String(issue.path[0] ?? "");
              if (key && !nextErrors[key]) {
                nextErrors[key] = issue.message;
              }
            }
            setErrors(nextErrors);
            return;
          }

          startTransition(async () => {
            const response = await fetch("/api/account/addresses", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                addressId: address?.id ?? null,
                ...parsed.data,
              }),
            });

            const data = (await response.json()) as {
              error?: string;
              errors?: Record<string, string>;
            };

            if (!response.ok) {
              setErrors(data.errors ?? {});
              setFeedback(data.error ?? "Não foi possível salvar o endereço.");
              return;
            }

            window.location.href = "/account";
          });
        }}
      >
        {[
          { name: "label", label: "Rótulo", placeholder: "Endereço principal" },
          { name: "recipientName", label: "Destinatário", placeholder: "Maria Silva" },
          { name: "phone", label: "Telefone", placeholder: "(93) 99111-2233" },
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
        ].map((field) => (
          <div key={field.name} className={`space-y-2 ${field.span ?? ""}`}>
            <label className="text-sm font-medium text-[color:var(--wood-dark)]">
              {field.label}
            </label>
            <input
              value={form[field.name as keyof FormState]}
              onChange={(event) => {
                const { value } = event.target;
                if (field.name === "recipientName") {
                  updateField("recipientName", value.replace(/[^\p{L}\s]/gu, ""));
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
                updateField(field.name as keyof FormState, value);
              }}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
              aria-invalid={Boolean(errors[field.name])}
            />
            {errors[field.name] ? (
              <p className="text-sm text-[color:#b1412c]">{errors[field.name]}</p>
            ) : null}
          </div>
        ))}
        {feedback ? <p className="text-sm text-[color:#b1412c] sm:col-span-2">{feedback}</p> : null}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60"
          >
            {isPending ? "Salvando..." : "Salvar endereço"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AddressForm({ primaryAddress, secondaryAddress }: AddressFormProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <AddressSection title="Editar o endereço principal" address={primaryAddress} type="PRIMARY" />
      <AddressSection
        title="Adicionar um endereço secundário"
        address={secondaryAddress}
        type="SECONDARY"
      />
    </div>
  );
}
