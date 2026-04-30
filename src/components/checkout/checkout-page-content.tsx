"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { getCheckoutShippingInCents } from "@/lib/checkout";
import { consumeCheckoutIntent } from "@/lib/checkout-navigation";
import { formatCurrency } from "@/lib/format";

type CheckoutCustomerSummary = {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  addressLabel: string;
  postalCode: string;
};

type CheckoutBuyNowItem = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  unitPriceInCents: number;
};

type CheckoutPageContentProps = {
  customer: CheckoutCustomerSummary;
  buyNowItem: CheckoutBuyNowItem | null;
};

export function CheckoutPageContent({
  customer,
  buyNowItem,
}: CheckoutPageContentProps) {
  const router = useRouter();
  const { items, subtotalInCents, clearCart } = useCart();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasStartedRef = useRef(false);
  const hasValidEntryRef = useRef<boolean | null>(null);

  const checkoutItems = useMemo(
    () =>
      buyNowItem
        ? [
            {
              id: buyNowItem.id,
              quantity: buyNowItem.quantity,
              name: buyNowItem.name,
              totalInCents: buyNowItem.unitPriceInCents * buyNowItem.quantity,
            },
          ]
        : items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            name: item.name,
            totalInCents: item.priceInCents * item.quantity,
          })),
    [buyNowItem, items],
  );

  const subtotal = useMemo(
    () =>
      buyNowItem
        ? buyNowItem.unitPriceInCents * buyNowItem.quantity
        : subtotalInCents,
    [buyNowItem, subtotalInCents],
  );
  const shippingInCents = getCheckoutShippingInCents(checkoutItems.length);
  const totalInCents = subtotal + shippingInCents;

  const startCheckout = useCallback(() => {
    if (!checkoutItems.length) {
      setError("Adicione itens ao carrinho antes de seguir para o pagamento.");
      return;
    }

    startTransition(async () => {
      setError("");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: checkoutItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          source: buyNowItem ? "buy-now" : "cart",
          cancelPath: buyNowItem ? `/products/${buyNowItem.slug}` : "/checkout",
        }),
      });

        const data = (await response.json()) as {
          error?: string;
          checkoutUrl?: string;
        };

        if (!response.ok || !data.checkoutUrl) {
          if (response.status === 401 || response.status === 409) {
            const callbackUrl = window.location.pathname + window.location.search;
            router.push(`/account/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            return;
          }

        setError(data.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }

      if (!buyNowItem) {
        clearCart();
      }

      window.location.replace(data.checkoutUrl);
    });
  }, [buyNowItem, checkoutItems, clearCart, router]);

  useEffect(() => {
    if (hasValidEntryRef.current === null) {
      hasValidEntryRef.current = consumeCheckoutIntent();
    }

    if (!hasValidEntryRef.current) {
      router.replace(checkoutItems.length ? "/cart" : "/shop");
      return;
    }

    if (hasStartedRef.current || !checkoutItems.length) {
      if (!buyNowItem && !checkoutItems.length) {
        router.replace("/cart");
      }
      return;
    }

    hasStartedRef.current = true;
    startCheckout();
  }, [buyNowItem, checkoutItems.length, router, startCheckout]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <section className="surface-card p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
          Pagamento seguro
        </p>
        <h1 className="mt-3 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
          Checkout da sua compra
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)]">
          Seus dados já foram preenchidos com base na conta cadastrada. Assim que o Stripe estiver
          pronto, você será direcionado para a etapa de pagamento.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[color:var(--surface)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
              Cliente
            </p>
            <p className="mt-2 font-semibold text-[color:var(--wood-dark)]">{customer.name}</p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{customer.email}</p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{customer.phone}</p>
          </div>
          <div className="rounded-[1.5rem] bg-[color:var(--surface)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
              Entrega
            </p>
            <p className="mt-2 font-semibold text-[color:var(--wood-dark)]">{customer.addressLabel}</p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">CEP {customer.postalCode}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[color:var(--wood-dark)]">
                {isPending ? "Redirecionando para o Stripe..." : "Pronto para prosseguir"}
              </p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                Se o redirecionamento não acontecer automaticamente, use o botão abaixo.
              </p>
            </div>
            <button
              type="button"
              onClick={startCheckout}
              disabled={isPending || !checkoutItems.length}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--wood)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60 sm:w-auto"
            >
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isPending ? "Iniciando pagamento..." : "Seguir para o Stripe"}
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-[color:#b1412c]">{error}</p> : null}
          {!checkoutItems.length ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Seu checkout está vazio no momento.
              </p>
              <Link
                href="/shop"
                className="text-sm font-semibold text-[color:var(--copper)] transition hover:text-[color:var(--wood-dark)]"
              >
                Voltar ao catálogo
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="surface-card p-5 sm:p-6 lg:sticky lg:top-28">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
          Resumo do pedido
        </p>
        <div className="mt-6 space-y-3">
          {checkoutItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
              <span className="min-w-0">
                {item.name} x{item.quantity}
              </span>
              <span className="shrink-0">{formatCurrency(item.totalInCents)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-[color:var(--border)] pt-6 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
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
  );
}
