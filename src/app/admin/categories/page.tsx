import { createCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCategories } from "@/lib/storefront";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <AdminShell
      title="Gestão de categorias"
      description="Mantenha a taxonomia simples, clara e organizada para o catálogo da loja."
    >
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form action={createCategoryAction} className="surface-card h-fit space-y-4 p-6">
          <h2 className="font-serif text-3xl text-[color:var(--wood-dark)]">Nova categoria</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--wood-dark)]">Nome</label>
            <input
              name="name"
              required
              className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--wood-dark)]">Descrição</label>
            <textarea
              name="description"
              rows={4}
              required
              className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none focus:border-[color:var(--copper)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white hover:bg-[color:var(--wood-dark)]"
          >
            Criar categoria
          </button>
        </form>

        <div className="surface-card p-6">
          <h2 className="font-serif text-3xl text-[color:var(--wood-dark)]">Estrutura atual</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
              >
                <p className="font-semibold text-[color:var(--wood-dark)]">{category.name}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {category.description}
                </p>
                <form action={deleteCategoryAction} className="mt-4">
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="text-sm font-medium text-[color:var(--copper)]">
                    Excluir
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
