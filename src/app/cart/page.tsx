"use client";

import Image from "next/image";
import Link from "next/link";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { useCart } from "@/components/providers/cart-provider";
import { getCheckoutShippingInCents } from "@/lib/checkout";
import { markCheckoutIntent } from "@/lib/checkout-navigation";
import { formatCurrency } from "@/lib/format";
import { clampQuantityToStock, getMaxSelectableQuantity } from "@/lib/quantity";

export default function CartPage() {
  const { items, subtotalInCents, updateQuantity, removeItem } = useCart();
  const shippingInCents = getCheckoutShippingInCents(items.length);
  const totalInCents = subtotalInCents + shippingInCents;

  return (
    <StorefrontShell>
      <div className="container-shell py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className={`surface-card p-5 sm:p-8 ${items.length ? "" : "flex h-full flex-col"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
                  Carrinho
                </p>
                <h1 className="mt-2 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
                  Seus itens selecionados
                </h1>
              </div>
              <Link
                href="/shop"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] hover:bg-[var(--surface)] hover:border-[color:var(--copper)] sm:w-auto"
              >
                Continuar comprando
              </Link>
            </div>

            <div className={`mt-8 space-y-5 ${items.length ? "" : "flex flex-1 items-center"}`}>
              {items.length ? (
                items.map((item) => {
                  const maxQuantity = getMaxSelectableQuantity(item.stock);

                  return (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[100px_minmax(0,1fr)_auto]"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[1.25rem]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-semibold text-[color:var(--wood-dark)] transition hover:text-[color:var(--copper)]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                          {formatCurrency(item.priceInCents)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end">
                        <input
                          type="number"
                          min={1}
                          max={maxQuantity}
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(
                              item.id,
                              clampQuantityToStock(Number(event.target.value), item.stock),
                            )
                          }
                          className="w-24 rounded-xl border border-[color:var(--border-strong)] bg-white px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-sm font-medium text-[color:var(--copper)]"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full rounded-[1.75rem] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] p-8 text-center sm:p-10">
                  <p className="font-serif text-3xl text-[color:var(--wood-dark)]">
                    Seu carrinho está vazio
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    Explore o catálogo para montar uma compra com a curadoria PV Casa.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className={`surface-card p-5 sm:p-6 ${items.length ? "lg:sticky lg:top-28" : "flex h-full flex-col"}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Resumo
            </p>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotalInCents)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Frete</span>
                <span>{formatCurrency(shippingInCents)}</span>
              </div>
            </div>
            <div className={`mt-6 border-t border-[color:var(--border)] pt-6 ${items.length ? "" : "mt-auto"}`}>
              <div className="flex items-center justify-between gap-4 text-lg font-semibold text-[color:var(--wood-dark)]">
                <span>Total</span>
                <span>{formatCurrency(totalInCents)}</span>
              </div>
              {items.length ? (
                <Link
                  href="/checkout"
                  onClick={markCheckoutIntent}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white hover:bg-[color:var(--wood-dark)]"
                >
                  Ir para o pagamento
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white opacity-45"
                >
                  Ir para o pagamento
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </StorefrontShell>
  );
}
