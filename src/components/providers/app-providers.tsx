"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/providers/cart-provider";
import { TrafficTracker } from "@/components/providers/traffic-tracker";

export function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CartProvider>
      <TrafficTracker />
      {children}
    </CartProvider>
  );
}
