import Link from "next/link";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { ProductCard } from "@/components/store/product-card";
import { getCatalog, getCatalogFilters, getCategories } from "@/lib/storefront";

const PRODUCTS_PER_PAGE = 9;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  color?: string;
  material?: string;
  audience?: string;
  price?: string;
  sale?: string;
  featured?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  page?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [catalog, categories, filters] = await Promise.all([
    getCatalog({
      query: params.q,
      category: params.category,
      color: params.color,
      material: params.material,
      audience: params.audience,
      price: params.price,
      sale: params.sale === "1",
      featured: params.featured === "1",
      sort: params.sort ?? "featured",
    }),
    getCategories(),
    Promise.resolve(getCatalogFilters()),
  ]);

  const totalPages = Math.max(1, Math.ceil(catalog.length / PRODUCTS_PER_PAGE));
  const requestedPage = Number(params.page ?? "1");
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(Math.floor(requestedPage), totalPages)
      : 1;
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedCatalog = catalog.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const pageWindowStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => pageWindowStart + index,
  ).filter((page) => page <= totalPages);

  const buildPageHref = (page: number) => {
    const search = new URLSearchParams();

    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    if (params.color) search.set("color", params.color);
    if (params.material) search.set("material", params.material);
    if (params.audience) search.set("audience", params.audience);
    if (params.price) search.set("price", params.price);
    if (params.sale === "1") search.set("sale", "1");
    if (params.featured === "1") search.set("featured", "1");
    if (params.sort) search.set("sort", params.sort);
    if (page > 1) search.set("page", String(page));

    const query = search.toString();
    return `/shop${query ? `?${query}` : ""}`;
  };

  return (
    <StorefrontShell>
      <div className="container-shell py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 xl:grid-cols-[320px_1fr] xl:items-start">
          <aside className="surface-card p-5 sm:p-6 xl:sticky xl:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)] sm:text-sm sm:tracking-[0.32em]">
              Filtros
            </p>
            {params.q ? (
              <p className="mt-4 flex items-baseline gap-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                <span className="shrink-0">Resultado para</span>
                <strong className="min-w-0 flex-1 truncate">{params.q}</strong>
                <span className="shrink-0">.</span>
              </p>
            ) : null}
            <CatalogFilters categories={categories} filters={filters} />
          </aside>

          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-[clamp(1.8rem,4vw,2.4rem)] leading-tight text-[color:var(--wood-dark)]">
                  {catalog.length} produtos encontrados
                </h2>
              </div>
            </div>

            {catalog.length ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                  {paginatedCatalog.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="flex justify-center pt-2 sm:justify-end">
                    <nav
                      className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[1.5rem] border border-[color:var(--border)] bg-white px-2 py-2 shadow-[0_10px_24px_rgba(60,38,22,0.06)] sm:rounded-full"
                      aria-label="Paginação do catálogo"
                    >
                      {currentPage > 1 ? (
                        <Link
                          href={buildPageHref(currentPage - 1)}
                          className="flex size-10 items-center justify-center rounded-full border border-transparent text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:bg-[color:var(--surface)]"
                          aria-label="Página anterior"
                        >
                          <span aria-hidden="true">‹</span>
                        </Link>
                      ) : (
                        <span
                          className="flex size-10 items-center justify-center rounded-full text-[color:var(--muted-foreground)] opacity-45"
                          aria-hidden="true"
                        >
                          ‹
                        </span>
                      )}

                      {visiblePages.map((page) => (
                        <Link
                          key={page}
                          href={buildPageHref(page)}
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                            page === currentPage
                              ? "bg-[color:var(--wood)] text-white"
                              : "text-[color:var(--wood-dark)] hover:bg-[color:var(--surface)] hover:text-[color:var(--copper)]"
                          }`}
                        >
                          {page}
                        </Link>
                      ))}

                      {currentPage < totalPages ? (
                        <Link
                          href={buildPageHref(currentPage + 1)}
                          className="flex size-10 items-center justify-center rounded-full border border-transparent text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:bg-[color:var(--surface)]"
                          aria-label="Próxima página"
                        >
                          <span aria-hidden="true">›</span>
                        </Link>
                      ) : (
                        <span
                          className="flex size-10 items-center justify-center rounded-full text-[color:var(--muted-foreground)] opacity-45"
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      )}
                    </nav>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="surface-card p-8 text-center sm:p-10">
                <h3 className="font-serif text-3xl text-[color:var(--wood-dark)]">
                  Nenhum produto encontrado
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  Ajuste os filtros ou faça uma nova busca para encontrar outros itens.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </StorefrontShell>
  );
}
