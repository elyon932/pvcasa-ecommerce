import Link from "next/link";
import { StorefrontShell } from "@/components/layout/storefront-shell";

type SearchParams = Promise<{
  order?: string;
  demo?: string;
}>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <StorefrontShell>
      <div className="container-shell py-20">
        <div className="surface-card mx-auto max-w-3xl p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[color:var(--copper)]">
            Pedido confirmado
          </p>
          <h1 className="mt-4 font-serif text-5xl text-[color:var(--wood-dark)]">
            Compra registrada com sucesso
          </h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--muted-foreground)]">
            Número do pedido: <strong>{params.order ?? "PVC-DEMO"}</strong>.{" "}
            {params.demo === "1"
              ? "O projeto está em modo de demonstração porque as credenciais do Stripe ainda não foram configuradas."
              : "A operação pode seguir com confirmação, faturamento e despacho pelo painel administrativo."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-full bg-[color:var(--wood)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--wood-dark)]"
            >
              Voltar ao catálogo
            </Link>
            <Link
              href="/account"
              className="rounded-full border border-[color:var(--border-strong)] px-6 py-3 text-sm font-semibold text-[color:var(--wood-dark)] hover:border-[color:var(--copper)]"
            >
              Ver minha conta
            </Link>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
