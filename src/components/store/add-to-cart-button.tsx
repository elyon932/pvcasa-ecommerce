"use client";

import type { ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import type { Product } from "@/types/store";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  className?: string;
  children?: ReactNode;
  onAdded?: () => void;
};

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  children,
  onAdded,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url ?? "",
          priceInCents: product.priceInCents,
          stock: product.stock,
          quantity,
        });
        onAdded?.();
      }}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-[color:var(--wood)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--wood-dark)]"
      }
    >
      <ShoppingBag className="size-4" />
      {children ?? "Adicionar ao carrinho"}
    </button>
  );
}
