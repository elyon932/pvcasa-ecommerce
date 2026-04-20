import Link from "next/link";
import { LayoutDashboard, Package, Shapes, ShoppingCart, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/common/sign-out-button";
import { authOptions } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/categories", label: "Categorias", icon: Shapes },
  { href: "/admin/content", label: "Banners", icon: Sparkles },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
];

export async function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[color:var(--surface)]">
      <div className="container-shell grid min-h-screen gap-8 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--wood-dark)] p-6 text-white">
          <div>
            <p className="font-serif text-3xl">PV Casa</p>
            <p className="mt-2 text-sm text-[color:rgba(255,255,255,0.72)]">
              Painel administrativo da operação digital
            </p>
          </div>
          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[color:rgba(255,255,255,0.82)] transition hover:bg-[color:rgba(255,255,255,0.08)] hover:text-white"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="space-y-8">
          <header className="rounded-[2rem] border border-[color:var(--border)] bg-white p-8 shadow-[0_12px_30px_rgba(60,38,22,0.05)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
                  Administração
                </p>
                <h1 className="mt-3 font-serif text-4xl text-[color:var(--wood-dark)]">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)]">
                  {description}
                </p>
              </div>
              <SignOutButton />
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
