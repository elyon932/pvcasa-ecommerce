import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { adminAuthOptions } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(adminAuthOptions);

  if (session?.user.isAdmin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_18%_18%,rgba(214,157,99,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(90,43,16,0.18),transparent_26%),linear-gradient(135deg,#fbf7f1_0%,#f1e3d2_44%,#dfc3a5_100%)] px-4 sm:px-5 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.9rem] border border-[color:var(--border)] bg-white shadow-[0_30px_90px_rgba(60,38,22,0.08)] lg:grid-cols-[1fr_440px] lg:rounded-[2.5rem]">
        <section className="hidden bg-[linear-gradient(135deg,#5a2b10_0%,#8b4513_45%,#b87333_100%)] p-8 text-white lg:block xl:p-10">
          <p className="text-xs uppercase tracking-[0.34em] text-[color:rgba(255,255,255,0.72)]">
            Painel PV Casa
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw,3.2rem)] leading-none">
            Gestão prática para uma operação elegante
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[color:rgba(255,255,255,0.84)]">
            Produtos, pedidos, categorias e conteúdo da home em uma área separada da vitrine
            pública, com autenticação apropriada para o porte da loja.
          </p>
        </section>
        <section className="p-5 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
            Acesso restrito
          </p>
          <h2 className="mt-3 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
            Entrar no painel
          </h2>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
