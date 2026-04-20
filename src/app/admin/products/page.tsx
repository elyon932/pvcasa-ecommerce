import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardMetrics, getAdminProducts } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";
import { getCategories } from "@/lib/storefront";

export default async function AdminProductsPage() {
  const [products, categories, metrics] = await Promise.all([
    getAdminProducts(),
    getCategories(),
    getDashboardMetrics(),
  ]);

  return (
    <AdminShell
      title="Gestão de produtos"
      description={`Catálogo atual com ${products.length} itens disponíveis nesta visualização e ${metrics.orders} pedidos acompanhados no painel.`}
    >
      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={saveProductAction} className="surface-card h-fit space-y-4 p-6">
          <h2 className="font-serif text-3xl text-[color:var(--wood-dark)]">Novo produto</h2>
          {[
            { name: "name", label: "Nome" },
            { name: "sku", label: "SKU" },
            { name: "shortDescription", label: "Descrição curta" },
            { name: "description", label: "Descrição" },
            { name: "brand", label: "Marca" },
            { name: "material", label: "Material" },
            { name: "imageUrl", label: "URL da imagem" },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--wood-dark)]">
                {field.label}
              </label>
              {field.name === "description" ? (
                <textarea
                  name={field.name}
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
                />
              ) : (
                <input
                  name={field.name}
                  required
                  className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
                />
              )}
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--wood-dark)]">
                Preço em centavos
              </label>
              <input
                name="priceInCents"
                type="number"
                required
                className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--wood-dark)]">
                Estoque
              </label>
              <input
                name="stock"
                type="number"
                required
                className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--wood-dark)]">Categoria</label>
            <select
              name="categoryId"
              required
              className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white hover:bg-[color:var(--wood-dark)]"
          >
            Salvar produto
          </button>
        </form>

        <div className="surface-card overflow-hidden p-6">
          <h2 className="font-serif text-3xl text-[color:var(--wood-dark)]">Catálogo atual</h2>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[color:var(--border)]">
            <table className="min-w-full bg-white text-left text-sm">
              <thead className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <p className="font-medium text-[color:var(--wood-dark)]">{product.name}</p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">{product.sku}</p>
                    </td>
                    <td className="px-4 py-4">{product.category.name}</td>
                    <td className="px-4 py-4">{formatCurrency(product.priceInCents)}</td>
                    <td className="px-4 py-4">{product.stock}</td>
                    <td className="px-4 py-4">
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="text-sm font-medium text-[color:var(--copper)]">
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
