"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalInCents, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const shippingInCents = useMemo(() => (items.length ? 999 : 0), [items.length]);
  const totalInCents = subtotalInCents + shippingInCents;

  return (
    <StorefrontShell>
      <div className="container-shell py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="surface-card p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Pagamento seguro
            </p>
            <h1 className="mt-3 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
              Finalização da compra
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)]">
              Pagamento preparado para Stripe, com estrutura enxuta e pronta para integrar frete
              real quando a operação definir parceiros logísticos.
            </p>
            <form
              className="mt-8 grid gap-5 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!items.length) {
                  setError("Adicione itens ao carrinho antes de finalizar.");
                  return;
                }

                const formData = new FormData(event.currentTarget);
                setError("");

                startTransition(async () => {
                  const response = await fetch("/api/checkout", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      customer: {
                        name: String(formData.get("name") ?? ""),
                        email: String(formData.get("email") ?? ""),
                        phone: String(formData.get("phone") ?? ""),
                        address: String(formData.get("address") ?? ""),
                        city: String(formData.get("city") ?? ""),
                        state: String(formData.get("state") ?? ""),
                        notes: String(formData.get("notes") ?? ""),
                      },
                      items: items.map((item) => ({
                        id: item.id,
                        quantity: item.quantity,
                      })),
                    }),
                  });

                  const data = (await response.json()) as {
                    error?: string;
                    checkoutUrl?: string;
                  };

                  if (!response.ok || !data.checkoutUrl) {
                    setError(data.error ?? "Não foi possível iniciar o pagamento.");
                    return;
                  }

                  clearCart();
                  router.push(data.checkoutUrl);
                });
              }}
            >
              {[
                { name: "name", label: "Nome completo", span: "sm:col-span-2" },
                { name: "email", label: "E-mail" },
                { name: "phone", label: "Telefone" },
                { name: "address", label: "Endereço", span: "sm:col-span-2" },
                { name: "city", label: "Cidade" },
                { name: "state", label: "UF" },
              ].map((field) => (
                <div key={field.name} className={`space-y-2 ${field.span ?? ""}`}>
                  <label className="text-sm font-medium text-[color:var(--wood-dark)]">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    required
                    className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--wood-dark)]">
                  Observações de entrega
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
                />
              </div>
              {error ? <p className="text-sm text-red-700 sm:col-span-2">{error}</p> : null}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--wood-dark)] disabled:opacity-60 sm:w-auto"
                >
                  {isPending ? "Iniciando pagamento..." : "Pagar com segurança"}
                </button>
              </div>
            </form>
          </section>

          <aside className="surface-card p-5 sm:p-6 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Resumo do pedido
            </p>
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                  <span className="min-w-0">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="shrink-0">{formatCurrency(item.priceInCents * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-[color:var(--border)] pt-6 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotalInCents)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Frete</span>
                <span>{formatCurrency(shippingInCents)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-lg font-semibold text-[color:var(--wood-dark)]">
                <span>Total</span>
                <span>{formatCurrency(totalInCents)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StorefrontShell>
  );
}
