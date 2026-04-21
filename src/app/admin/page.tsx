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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <div className="surface-card p-5 sm:p-6">
          <h2 className="font-serif text-[clamp(1.7rem,3.8vw,2rem)] leading-tight text-[color:var(--wood-dark)]">
            Produtos mais vendidos
          </h2>
          <div className="mt-6 space-y-4">
            {metrics.bestSellers.map((item) => (
              <div
                key={item.name}
                className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <p className="font-semibold text-[color:var(--wood-dark)]">{item.name}</p>
                <div className="mt-2 flex items-center justify-between gap-4 text-sm text-[color:var(--muted-foreground)]">
                  <span>{item.quantity} unidades</span>
                  <span>{formatCurrency(item.revenueInCents)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5 sm:p-6">
          <h2 className="font-serif text-[clamp(1.7rem,3.8vw,2rem)] leading-tight text-[color:var(--wood-dark)]">
            Pedidos recentes
          </h2>
          <div className="mt-6 space-y-3">
            {metrics.recentOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-[color:var(--wood-dark)]">{order.orderNumber}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
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
                <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                  {order.customerName}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
