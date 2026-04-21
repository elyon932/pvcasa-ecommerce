"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = {
  value: string;
  label: string;
};

type Props = {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  filters: {
    colors: Option[];
    audiences: Option[];
    materials: string[];
    prices: Option[];
  };
};

export function CatalogFilters({ categories, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (name: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(name);
    } else {
      params.set(name, typeof value === "boolean" ? "1" : value);
    }

    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]">Categoria</label>
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(event) => updateParam("category", event.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]">Cor</label>
        <select
          value={searchParams.get("color") ?? ""}
          onChange={(event) => updateParam("color", event.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
        >
          <option value="">Todas</option>
          {filters.colors.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]">Material</label>
        <select
          value={searchParams.get("material") ?? ""}
          onChange={(event) => updateParam("material", event.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
        >
          <option value="">Todos</option>
          {filters.materials.map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]">Público</label>
        <select
          value={searchParams.get("audience") ?? ""}
          onChange={(event) => updateParam("audience", event.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
        >
          <option value="">Todos</option>
          {filters.audiences.map((audience) => (
            <option key={audience.value} value={audience.value}>
              {audience.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]">Faixa de preço</label>
        <select
          value={searchParams.get("price") ?? ""}
          onChange={(event) => updateParam("price", event.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
        >
          <option value="">Todas</option>
          {filters.prices.map((price) => (
            <option key={price.value} value={price.value}>
              {price.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]">Ordenar por</label>
        <select
          value={searchParams.get("sort") ?? "featured"}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
        >
          <option value="featured">Destaques</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="newest">Novidades</option>
        </select>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm xl:col-span-1">
        <input
          type="checkbox"
          checked={searchParams.get("sale") === "1"}
          onChange={(event) => updateParam("sale", event.target.checked)}
        />
        Apenas promoções
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm xl:col-span-1">
        <input
          type="checkbox"
          checked={searchParams.get("featured") === "1"}
          onChange={(event) => updateParam("featured", event.target.checked)}
        />
        Apenas destaques
      </label>

      <div className="sm:col-span-2 xl:col-span-1">
        <button
          type="button"
          onClick={() => router.push("/shop")}
          className="w-full rounded-full border border-[color:var(--copper)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--copper)] shadow-[0_10px_24px_rgba(60,38,22,0.06)] transition hover:bg-[color:var(--wood)] hover:text-white"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
