import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function ShippingPage() {
  return (
    <StorefrontShell>
      <div className="container-shell flex flex-1 items-start py-6 sm:py-8 lg:py-10">
        <div className="surface-card w-full p-5 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)] sm:text-sm sm:tracking-[0.32em]">
            Frete e entrega
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2rem,4.4vw,3.2rem)] leading-tight text-[color:var(--wood-dark)]">
            Fluxo preparado para integrar frete real sem travar a operação
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[color:var(--muted-foreground)] sm:text-lg sm:leading-8">
            A finalização da compra já aceita evolução para cálculo automático, tabela regional,
            integrações logísticas e atendimento consultivo quando necessário.
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
