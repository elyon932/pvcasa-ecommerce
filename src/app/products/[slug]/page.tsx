import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ProductPreviewCarousel } from "@/components/store/product-preview-carousel";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { formatCurrency } from "@/lib/format";
import { getCatalog, getProductBySlug } from "@/lib/storefront";

const colorLabels: Record<string, string> = {
  white: "Branco",
  sand: "Areia",
  copper: "Cobre",
  caramel: "Caramelo",
  terracotta: "Terracota",
  sage: "Sálvia",
  blue: "Azul",
  green: "Verde",
  pink: "Rosa",
  graphite: "Grafite",
};

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <StorefrontShell>
      <div className="container-shell py-6 sm:py-8 lg:py-10">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="h-full">
            <ProductPreviewCarousel images={product.images} productName={product.name} />
          </div>

          <section className="surface-card h-full p-5 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
                {product.category.name}
              </p>
              <span className="w-fit rounded-full bg-[color:var(--surface-2)] px-4 py-2 text-sm font-medium text-[color:var(--wood)]">
                {product.stock} unidade(s)
              </span>
            </div>
            <h1 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-tight text-[color:var(--wood-dark)]">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-7 text-[color:var(--muted-foreground)] sm:text-lg sm:leading-8">
              {product.description}
            </p>

            <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-end">
              <div>
                {product.compareAtCents ? (
                  <p className="text-base text-[color:var(--muted-foreground)] line-through">
                    {formatCurrency(product.compareAtCents)}
                  </p>
                ) : null}
                <p className="text-[clamp(2rem,4vw,2.5rem)] font-semibold leading-none text-[color:var(--wood-dark)]">
                  {formatCurrency(product.priceInCents)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm text-[color:var(--wood-dark)]"
                  >
                    {colorLabels[color] ?? color}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[color:var(--surface)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  Marca
                </p>
                <p className="mt-2 font-semibold text-[color:var(--wood-dark)]">{product.brand}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[color:var(--surface)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  Material
                </p>
                <p className="mt-2 font-semibold text-[color:var(--wood-dark)]">
                  {product.material}
                </p>
              </div>
            </div>

            <p className="mt-8 text-base leading-7 text-[color:var(--muted-foreground)] sm:text-lg sm:leading-8">
              Frete a partir de:{" "}
              <span className="font-semibold text-[color:#2f7a3c]">
                {formatCurrency(product.shippingInCents)}
              </span>
            </p>

            <ProductPurchasePanel product={product} />
          </section>
        </div>
      </div>
    </StorefrontShell>
  );
}
