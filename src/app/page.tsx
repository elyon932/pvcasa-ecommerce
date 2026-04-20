import Image from "next/image";
import Link from "next/link";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { ProductCard } from "@/components/store/product-card";
import {
  getCategories,
  getFeaturedProducts,
  getHeroSlides,
  getNewProducts,
  getSaleProducts,
} from "@/lib/storefront";

export default async function HomePage() {
  const [slides, categories, featuredProducts, saleProducts, newProducts] = await Promise.all([
    getHeroSlides(),
    getCategories(),
    getFeaturedProducts(),
    getSaleProducts(),
    getNewProducts(),
  ]);

  const orderedCategories = ["bed", "table", "bath", "decor", "kids"]
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is (typeof categories)[number] => Boolean(category));

  return (
    <StorefrontShell>
      <div className="container-shell space-y-10 py-8 lg:space-y-14 lg:py-10">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
            Vitrine
          </p>
          <HeroCarousel slides={slides} />
        </section>

        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
            Categorias
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {orderedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="interactive-lift group relative block overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-white shadow-[0_18px_40px_rgba(60,38,22,0.06)]"
              >
                <div className="relative aspect-[4/4.5] overflow-hidden">
                  <Image
                    src={category.imageUrl ?? slides[0].imageUrl}
                    alt={category.name}
                    fill
                    className="interactive-zoom object-cover"
                    sizes="(max-width: 1280px) 100vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,22,15,0.08)_0%,rgba(34,22,15,0.68)_100%)]" />
                  <div className="absolute bottom-4 left-4">
                    <h2 className="font-serif text-3xl text-[color:var(--copper-light)] sm:text-[2rem]">
                      {category.name}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
                Destaques
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.75rem,2.4vw,2.2rem)] leading-none text-[color:var(--wood-dark)]">
                Os itens mais procurados da semana
              </h2>
            </div>
            <Link
              href="/shop?featured=1"
              className="whitespace-nowrap rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] hover:border-[color:var(--copper)]"
            >
              Ver tudo
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="grid gap-10 xl:grid-cols-2">
          <div className="space-y-6">
            <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
                  Promoções
                </p>
                <h2 className="mt-2 font-serif text-[clamp(1.3rem,2.05vw,1.95rem)] leading-none text-[color:var(--wood-dark)]">
                  Preços especiais para comprar agora
                </h2>
              </div>
              <Link
                href="/shop?sale=1"
                className="whitespace-nowrap rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] hover:border-[color:var(--copper)]"
              >
                Ver tudo
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {saleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
                  Novidades
                </p>
                <h2 className="mt-2 font-serif text-[clamp(1.3rem,2.05vw,1.95rem)] leading-none text-[color:var(--wood-dark)]">
                  Novos produtos para você
                </h2>
              </div>
              <Link
                href="/shop?sort=newest"
                className="whitespace-nowrap rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] hover:border-[color:var(--copper)]"
              >
                Ver tudo
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {newProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </StorefrontShell>
  );
}
