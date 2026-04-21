import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/common/sign-out-button";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getCustomerById } from "@/lib/accounts";
import { authOptions } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { getCustomerOrders } from "@/lib/storefront";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "customer" || !session.user.customerId) {
    redirect("/account/login");
  }

  const customer = getCustomerById(session.user.customerId);
  if (!customer) {
    redirect("/account/login");
  }

  const orders = getCustomerOrders(customer.id);

  return (
    <StorefrontShell>
      <div className="container-shell space-y-6 py-6 sm:space-y-8 sm:py-8 lg:py-10">
        <div className="surface-card flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Minha conta
            </p>
            <h1 className="mt-3 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
              {customer.name}
            </h1>
            <p className="mt-2 break-words text-base text-[color:var(--muted-foreground)]">
              {customer.email} • {customer.phone}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="surface-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Perfil
            </p>
            <div className="mt-6 space-y-4 text-sm text-[color:var(--muted-foreground)]">
              <div>
                <p className="font-semibold text-[color:var(--wood-dark)]">Endereço principal</p>
                <p className="mt-1">
                  {customer.addressLine}, {customer.city}/{customer.state}
                </p>
                <p>{customer.postalCode}</p>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--wood-dark)]">Resumo</p>
                <p className="mt-1">{orders.length} pedidos registrados na conta.</p>
              </div>
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Histórico de pedidos
            </p>
            <div className="mt-6 space-y-4">
              {orders.length ? (
                orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[color:var(--wood-dark)]">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-[color:var(--copper)]">
                          {formatOrderStatus(order.status)}
                        </p>
                        <p className="font-semibold text-[color:var(--wood-dark)]">
                          {formatCurrency(order.totalInCents)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[1.25rem] bg-white px-4 py-3 text-sm text-[color:var(--muted-foreground)]"
                        >
                          <p className="font-medium text-[color:var(--wood-dark)]">{item.name}</p>
                          <p className="mt-1">
                            {item.quantity} unidade(s) • {formatCurrency(item.unitPriceInCents)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Você ainda não possui pedidos registrados.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </StorefrontShell>
  );
}
