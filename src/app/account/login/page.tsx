import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function AccountLoginPage() {
  return (
    <StorefrontShell>
      <div className="container-shell py-12">
        <div className="grid overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-white shadow-[0_30px_90px_rgba(60,38,22,0.08)] lg:grid-cols-[1fr_460px]">
          <section className="hidden bg-[linear-gradient(135deg,#5a2b10_0%,#8b4513_45%,#b87333_100%)] p-10 text-white lg:block">
            <p className="text-xs uppercase tracking-[0.34em] text-[color:rgba(255,255,255,0.72)]">
              Minha conta
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-none">
              Acompanhe pedidos, histórico e dados da sua conta
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[color:rgba(255,255,255,0.84)]">
              Entre para visualizar compras anteriores, acompanhar o status dos pedidos e
              consultar as informações da sua conta.
            </p>
          </section>
          <section className="p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Cliente PV Casa
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--wood-dark)]">
              Entrar na conta
            </h2>
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              Credencial de teste disponível:{" "}
              <span className="font-semibold text-[color:var(--wood-dark)]">ana@pvcasa.com</span>{" "}
              com a senha padrão da base de demonstração.
            </p>
            <div className="mt-8">
              <CustomerLoginForm />
            </div>
          </section>
        </div>
      </div>
    </StorefrontShell>
  );
}
