import { updateOrderStatusAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminOrders } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
] as const;

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <AdminShell
      title="Gestão de pedidos"
      description="Acompanhe o fluxo dos pedidos, os dados do cliente e a atualização de status em um único lugar."
    >
      <section className="space-y-5">
        {orders.map((order) => (
          <article key={order.id} className="surface-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-semibold text-[color:var(--wood-dark)]">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  {order.customerName} • {order.city}/{order.state} • {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
                <p className="text-sm font-medium text-[color:var(--copper)]">
                  {formatOrderStatus(order.status)}
                </p>
                <p className="text-lg font-semibold text-[color:var(--wood-dark)]">
                  {formatCurrency(order.totalInCents)}
                </p>
                <form
                  action={updateOrderStatusAction}
                  className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
                >
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatOrderStatus(status)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-[color:var(--wood)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--wood-dark)]"
                  >
                    Atualizar
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
                >
                  <p className="font-medium text-[color:var(--wood-dark)]">{item.name}</p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                    {item.quantity} unidade(s) • {formatCurrency(item.unitPriceInCents)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
