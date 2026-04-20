import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function ShippingPage() {
  return (
    <StorefrontShell>
      <div className="container-shell flex flex-1 items-start py-8 lg:py-10">
        <div className="surface-card w-full p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
            Frete e entrega
          </p>
          <h1 className="mt-4 font-serif text-5xl text-[color:var(--wood-dark)]">
            Fluxo preparado para integrar frete real sem travar a operação
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            A finalização da compra já aceita evolução para cálculo automático, tabela regional,
            integrações logísticas e atendimento consultivo quando necessário.
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
