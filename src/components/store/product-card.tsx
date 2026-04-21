import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/store";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="interactive-lift group block h-full overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-white shadow-[0_18px_50px_rgba(60,38,22,0.07)] [transform:translateZ(0)] [backface-visibility:hidden] sm:rounded-[2rem]"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/4.2] overflow-hidden bg-[color:var(--surface-2)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[color:var(--border)] sm:aspect-[4/4.5]">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="interactive-zoom object-cover [transform:translateZ(0)] [backface-visibility:hidden]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
          {product.isFeatured ? (
            <span className="absolute left-3 top-3 rounded-full bg-[color:rgba(255,255,255,0.94)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--wood-dark)] sm:left-4 sm:top-4 sm:text-xs sm:tracking-[0.2em]">
              Destaque
            </span>
          ) : null}
        </div>
        <div className="relative flex flex-1 flex-col p-4 sm:p-5">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] sm:text-xs">
                {product.category.name}
              </p>
              <div className="mt-2 flex items-start gap-2 font-serif text-lg leading-6 text-[color:var(--wood-dark)] transition group-hover:text-[color:var(--copper)] sm:text-xl sm:leading-7">
                <span className="line-clamp-2">{product.name}</span>
                <ArrowUpRight className="mt-1 size-4 shrink-0" />
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {product.shortDescription}
            </p>
          </div>
          <div className="mt-auto pt-4">
            {product.compareAtCents ? (
              <p className="text-sm text-[color:var(--muted-foreground)] line-through">
                {formatCurrency(product.compareAtCents)}
              </p>
            ) : (
              <div className="h-[20px]" />
            )}
            <p className="text-lg font-semibold text-[color:var(--wood-dark)] sm:text-xl">
              {formatCurrency(product.priceInCents)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
