import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function ReturnsPage() {
  return (
    <StorefrontShell>
      <div className="container-shell flex flex-1 items-start py-6 sm:py-8 lg:py-10">
        <div className="surface-card w-full p-5 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)] sm:text-sm sm:tracking-[0.32em]">
            Trocas e devoluções
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2rem,4.4vw,3.2rem)] leading-tight text-[color:var(--wood-dark)]">
            Regras claras para atendimento e pós-venda profissional
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[color:var(--muted-foreground)] sm:text-lg sm:leading-8">
            A loja já possui base institucional para política de trocas, acompanhamento de pedidos
            e contato rápido pelo WhatsApp para orientar o cliente.
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
