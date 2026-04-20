import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function ReturnsPage() {
  return (
    <StorefrontShell>
      <div className="container-shell flex flex-1 items-start py-8 lg:py-10">
        <div className="surface-card w-full p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
            Trocas e devoluções
          </p>
          <h1 className="mt-4 font-serif text-5xl text-[color:var(--wood-dark)]">
            Regras claras para atendimento e pós-venda profissional
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            A loja já possui base institucional para política de trocas, acompanhamento de pedidos
            e contato rápido pelo WhatsApp para orientar o cliente.
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
