"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { CartIndicator } from "@/components/store/cart-indicator";

const navItems = [
  { href: "/shop?category=bed", label: "Cama" },
  { href: "/shop?category=table", label: "Mesa" },
  { href: "/shop?category=bath", label: "Banho" },
  { href: "/about", label: "Sobre" },
  { href: "/contact", label: "Contato" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:rgba(248,244,239,0.94)] backdrop-blur-xl">
      <div className="container-shell">
        <div className="flex min-h-16 items-center gap-2 py-3 sm:min-h-20 sm:gap-3 lg:flex-nowrap lg:gap-6">
          <BrandLogo className="flex-1 lg:flex-none" />

          <nav className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[color:var(--foreground)] transition hover:text-[color:var(--copper)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action="/shop"
            className="hidden flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-3 shadow-sm lg:flex"
          >
            <Search className="size-4 shrink-0 text-[color:var(--copper)]" />
            <input
              type="search"
              name="q"
              placeholder="Buscar produtos"
              className="search-input w-full bg-transparent text-sm outline-none"
            />
          </form>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/cart"
              className="relative flex size-10 items-center justify-center rounded-full bg-[color:var(--wood)] text-white transition hover:bg-[color:var(--wood-dark)] sm:size-11"
              aria-label="Carrinho"
            >
              <ShoppingBag className="size-4" />
              <CartIndicator />
            </Link>
            <Link
              href="/account"
              className="flex size-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--foreground)] shadow-sm transition hover:border-[color:var(--copper)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)] sm:size-11"
              aria-label="Minha conta"
            >
              <UserRound className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex size-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--foreground)] transition hover:border-[color:var(--copper)] lg:hidden sm:size-11"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <form
            action="/shop"
            className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-3 shadow-sm"
          >
            <Search className="size-4 shrink-0 text-[color:var(--copper)]" />
            <input
              type="search"
              name="q"
              placeholder="Buscar produtos"
              className="search-input w-full bg-transparent text-sm outline-none"
            />
          </form>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-[color:var(--border)] py-3 lg:hidden">
            <nav className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[color:var(--wood-dark)] transition hover:bg-[color:var(--surface)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
