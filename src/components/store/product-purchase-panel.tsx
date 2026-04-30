"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { BuyNowButton } from "@/components/store/buy-now-button";
import { markCheckoutIntent } from "@/lib/checkout-navigation";
import { formatCurrency } from "@/lib/format";
import { clampQuantityToStock, getMaxSelectableQuantity } from "@/lib/quantity";
import type { Product } from "@/types/store";

type ProductPurchasePanelProps = {
  product: Product;
};

type HoldDirection = "increment" | "decrement";

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const maxQuantity = getMaxSelectableQuantity(product.stock);
  const holdTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const holdStepRef = useRef(0);
  const suppressClickRef = useRef(false);

  const clearHold = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    holdStepRef.current = 0;
  };

  useEffect(() => clearHold, []);

  const startHold = (direction: HoldDirection) => {
    if (
      (direction === "increment" && quantity >= maxQuantity) ||
      (direction === "decrement" && quantity <= 1)
    ) {
      return;
    }

    clearHold();
    holdTimeoutRef.current = window.setTimeout(() => {
      suppressClickRef.current = true;
      holdIntervalRef.current = window.setInterval(() => {
        holdStepRef.current += 1;
        const repeats = holdStepRef.current >= 12 ? 2 : 1;

        setQuantity((current) => {
          const delta = direction === "increment" ? repeats : -repeats;
          return clampQuantityToStock(current + delta, product.stock);
        });
      }, 90);
    }, 280);
  };

  const decrementQuantity = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setQuantity((current) => clampQuantityToStock(current - 1, product.stock));
  };

  const incrementQuantity = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setQuantity((current) => clampQuantityToStock(current + 1, product.stock));
  };

  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex min-h-12 items-center justify-between rounded-full border border-[color:var(--border-strong)] bg-white px-3 text-sm font-semibold text-[color:var(--wood-dark)] shadow-[0_10px_24px_rgba(60,38,22,0.06)] sm:col-span-2 xl:col-span-1">
          <button
            type="button"
            onClick={decrementQuantity}
            onPointerDown={() => startHold("decrement")}
            onPointerUp={clearHold}
            onPointerLeave={clearHold}
            onPointerCancel={clearHold}
            className="flex size-8 items-center justify-center rounded-full transition hover:bg-[color:var(--surface)] disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-0 px-3 text-center">
            <span className="hidden sm:inline">Quantidade: {quantity}</span>
            <span className="sm:hidden">Qtd. {quantity}</span>
          </span>
          <button
            type="button"
            onClick={incrementQuantity}
            onPointerDown={() => startHold("increment")}
            onPointerUp={clearHold}
            onPointerLeave={clearHold}
            onPointerCancel={clearHold}
            className="flex size-8 items-center justify-center rounded-full transition hover:bg-[color:var(--surface)] disabled:opacity-40"
            disabled={quantity >= maxQuantity}
            aria-label="Aumentar quantidade"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <AddToCartButton
          product={product}
          quantity={quantity}
          onAdded={() => setIsModalOpen(true)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--wood)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] sm:col-span-2 xl:col-span-1"
        />

        <BuyNowButton
          product={product}
          quantity={quantity}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--copper)] bg-white px-5 py-3 text-center text-sm font-semibold text-[color:var(--copper)] transition hover:bg-[color:var(--wood)] hover:text-white sm:col-span-2 xl:col-span-1"
        />
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[color:rgba(34,22,15,0.42)] px-4 py-6">
          <div className="surface-card relative w-full max-w-xl p-5 sm:p-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] sm:right-4 sm:top-4"
              aria-label="Fechar modal"
            >
              <X className="size-4" />
            </button>

            <p className="pr-10 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Produto adicionado
            </p>
            <div className="mt-5 flex flex-col gap-4 rounded-[1.75rem] bg-[color:var(--surface)] p-4 sm:flex-row">
              <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] sm:size-24 sm:shrink-0">
                <Image
                  src={product.images[0]?.url ?? ""}
                  alt={product.images[0]?.alt ?? product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 96px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                  {product.category.name}
                </p>
                <h2 className="mt-2 font-serif text-xl leading-tight text-[color:var(--wood-dark)] sm:text-2xl">
                  {product.name}
                </h2>
                <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                  Quantidade adicionada: <strong>{quantity}</strong>
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--wood-dark)]">
                  {formatCurrency(product.priceInCents * quantity)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/checkout"
                onClick={markCheckoutIntent}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--copper)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--copper)] transition hover:bg-[color:var(--wood)] hover:text-white"
              >
                Fechar pedido
              </Link>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)]"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
