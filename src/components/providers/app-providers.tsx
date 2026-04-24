"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/providers/cart-provider";

export function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
