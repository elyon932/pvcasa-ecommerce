import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getCustomerById } from "@/lib/accounts";
import { clientAuthOptions } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { getCustomerOrders } from "@/lib/storefront";

export default async function AccountOrdersPage() {
  const session = await getServerSession(clientAuthOptions);

  if (!session?.user.customerId) {
    redirect("/account/login");
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer) {
    redirect("/account/login");
  }

  const orders = await getCustomerOrders(customer.id, customer.email);
  const sortedOrders = orders
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return (
    <StorefrontShell>
      <div className="container-shell space-y-6 py-6 sm:space-y-8 sm:py-8 lg:py-10">
        <div className="surface-card p-5 sm:p-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--copper)] transition hover:text-[color:var(--wood-dark)]"
          >
            <ArrowLeft className="size-4" />
            Voltar para a conta
          </Link>
          <h1 className="mt-4 font-serif text-[clamp(1.9rem,4vw,2.5rem)] text-[color:var(--wood-dark)]">
            Histórico detalhado de pedidos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
            Consulte status, datas e os itens de cada compra realizada com sua conta.
          </p>
        </div>

        {orders.length ? (
          <div className="grid gap-4">
            {sortedOrders.map((order) => (
              <article key={order.id} className="surface-card p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
                      {order.orderNumber}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[color:var(--wood-dark)]">
                      {formatOrderStatus(order.status)}
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-[color:var(--wood-dark)]">
                    {formatCurrency(order.totalInCents)}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-0 rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]"
                    >
                      <p
                        className="truncate font-semibold text-[color:var(--wood-dark)]"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="mt-1 whitespace-nowrap">
                        Quantidade: {item.quantity}{" "}
                        <span aria-hidden="true">
                          •
                        </span>{" "}
                        {formatCurrency(item.unitPriceInCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface-card p-6 text-sm text-[color:var(--muted-foreground)]">
            <div className="flex items-start gap-3">
              <ReceiptText className="mt-0.5 size-4 text-[color:var(--copper)]" />
              <div>
                <p className="font-semibold text-[color:var(--wood-dark)]">Histórico vazio</p>
                <p className="mt-1">Nenhum pedido foi registrado para esta conta até o momento.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
