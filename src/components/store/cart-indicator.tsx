"use client";

import { useCart } from "@/components/providers/cart-provider";

export function CartIndicator() {
  const { itemCount } = useCart();

  if (!itemCount) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[color:var(--copper)] text-[10px] font-semibold text-white">
      {itemCount}
    </span>
  );
}
