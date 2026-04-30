"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { markCheckoutIntent } from "@/lib/checkout-navigation";
import type { Product } from "@/types/store";

type BuyNowButtonProps = {
  product: Product;
  quantity?: number;
  className?: string;
  children?: ReactNode;
};

export function BuyNowButton({
  product,
  quantity = 1,
  className,
  children,
}: BuyNowButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        markCheckoutIntent();
        router.push(`/checkout?slug=${product.slug}&quantity=${quantity}`);
      }}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:bg-[color:var(--wood)] hover:text-white"
      }
    >
      <CreditCard className="size-4" />
      {children ?? "Comprar agora"}
    </button>
  );
}
