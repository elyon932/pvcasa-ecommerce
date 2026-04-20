import { AdminShell } from "@/components/admin/admin-shell";
import { MetricCard } from "@/components/admin/metric-card";
import { getDashboardMetrics } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <AdminShell
      title="Painel operacional"
      description="Uma visão compacta com as métricas mais úteis para a operação diária do ecommerce."
    >
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Faturamento"
          value={formatCurrency(metrics.revenueInCents)}
          helper="Receita total da visão atual da loja"
        />
        <MetricCard
          label="Pedidos"
          value={String(metrics.orders)}
          helper="Pedidos passando pelo canal digital"
        />
        <MetricCard
          label="Ticket médio"
          value={formatCurrency(metrics.averageTicketInCents)}
          helper="Valor médio por pedido"
        />
        <MetricCard
          label="Clientes recorrentes"
          value={String(metrics.returningCustomers)}
          helper="Clientes com compras repetidas"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-6">
          <h2 className="font-serif text-3xl text-[color:var(--wood-dark)]">
            Produtos mais vendidos
          </h2>
          <div className="mt-6 space-y-4">
            {metrics.bestSellers.map((item) => (
              <div
                key={item.name}
                className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <p className="font-semibold text-[color:var(--wood-dark)]">{item.name}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                  <span>{item.quantity} unidades</span>
                  <span>{formatCurrency(item.revenueInCents)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="font-serif text-3xl text-[color:var(--wood-dark)]">Pedidos recentes</h2>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[color:var(--border)]">
            <table className="min-w-full bg-white text-left text-sm">
              <thead className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <p className="font-medium text-[color:var(--wood-dark)]">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">{order.customerName}</td>
                    <td className="px-4 py-4">{formatOrderStatus(order.status)}</td>
                    <td className="px-4 py-4">{formatCurrency(order.totalInCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
