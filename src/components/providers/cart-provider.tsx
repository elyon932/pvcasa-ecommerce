"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { clampQuantityToStock, getMaxSelectableQuantity } from "@/lib/quantity";
import type { CartItem } from "@/types/store";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalInCents: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pvcasa-cart";
const CART_EVENT = "pv-cart-change";
const EMPTY_CART: CartItem[] = [];

let cachedCartRaw: string | null | undefined;
let cachedCartItems: CartItem[] = EMPTY_CART;

function normalizeStoredCartItem(item: CartItem) {
  const stock = getMaxSelectableQuantity(
    typeof item.stock === "number" ? item.stock : item.quantity,
  );

  return {
    ...item,
    stock,
    quantity: clampQuantityToStock(item.quantity, stock),
  };
}

function getCartSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedCartRaw) {
    return cachedCartItems;
  }

  cachedCartRaw = raw;
  if (!raw) {
    cachedCartItems = EMPTY_CART;
    return cachedCartItems;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    cachedCartItems = Array.isArray(parsed)
      ? (parsed as CartItem[]).map(normalizeStoredCartItem)
      : EMPTY_CART;
    return cachedCartItems;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedCartRaw = null;
    cachedCartItems = EMPTY_CART;
    return cachedCartItems;
  }
}

function writeCart(items: CartItem[]) {
  cachedCartItems = items;
  cachedCartRaw = JSON.stringify(items);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = () => onStoreChange();
  window.addEventListener("storage", listener);
  window.addEventListener(CART_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CART_EVENT, listener);
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getCartSnapshot, () => EMPTY_CART);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalInCents = items.reduce(
      (sum, item) => sum + item.quantity * item.priceInCents,
      0,
    );

    return {
      items,
      itemCount,
      subtotalInCents,
      addItem(item: CartItem) {
        const current = getCartSnapshot();
        const stock = getMaxSelectableQuantity(item.stock);
        const incomingQuantity = clampQuantityToStock(item.quantity, stock);
        const existing = current.find((entry) => entry.id === item.id);

        if (!existing) {
          writeCart([
            ...current,
            {
              ...item,
              stock,
              quantity: incomingQuantity,
            },
          ]);
          return;
        }

        const mergedStock = getMaxSelectableQuantity(item.stock || existing.stock);
        writeCart(
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  stock: mergedStock,
                  quantity: clampQuantityToStock(
                    entry.quantity + Math.max(1, item.quantity),
                    mergedStock,
                  ),
                }
              : entry,
          ),
        );
      },
      removeItem(id: string) {
        writeCart(getCartSnapshot().filter((item) => item.id !== id));
      },
      updateQuantity(id: string, quantity: number) {
        writeCart(
          getCartSnapshot()
            .map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: clampQuantityToStock(quantity, item.stock),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      clearCart() {
        writeCart([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
