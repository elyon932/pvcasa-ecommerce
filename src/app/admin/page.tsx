import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CreditCard,
  MousePointerClick,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardMetrics } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";

function formatPercent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function trendLabel(value: number) {
  if (value === 0) {
    return "estável";
  }

  return `${value > 0 ? "+" : ""}${formatPercent(value)}`;
}

function chartHeight(value: number, max: number) {
  if (!max) {
    return "8%";
  }

  return `${Math.max(8, Math.round((value / max) * 100))}%`;
}

function alertToneClass(tone: "success" | "warning" | "neutral") {
  switch (tone) {
    case "success":
      return "border-[color:rgba(47,122,60,0.2)] bg-[color:rgba(47,122,60,0.08)] text-[color:#2f7a3c]";
    case "warning":
      return "border-[color:rgba(184,115,51,0.22)] bg-[color:rgba(184,115,51,0.1)] text-[color:var(--wood-dark)]";
    case "neutral":
    default:
      return "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--wood-dark)]";
  }
}

function OverviewCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[1.6rem] border border-[color:var(--border)] bg-white p-5 shadow-[0_16px_36px_rgba(60,38,22,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
            {label}
          </p>
          <p className="mt-3 text-[clamp(1.65rem,3vw,2.15rem)] font-semibold leading-none text-[color:var(--wood-dark)]">
            {value}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--surface)] text-[color:var(--copper)]">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[color:var(--muted-foreground)]">{helper}</p>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const maxRevenue = Math.max(...metrics.revenueSeries.map((item) => item.revenueInCents), 1);
  const maxBestSellerQuantity = Math.max(...metrics.bestSellers.map((item) => item.quantity), 1);
  const maxStatusCount = Math.max(...metrics.orderStatusBreakdown.map((item) => item.count), 1);
  const totalStatusOrders = metrics.orderStatusBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <AdminShell
      title="Dashboard de vendas"
      description="Indicadores essenciais para acompanhar receita, conversão, operação e ritmo comercial da loja."
    >
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <OverviewCard
          label="Faturamento"
          value={formatCurrency(metrics.revenueInCents)}
          helper={`${trendLabel(metrics.revenueTrendPercent)} em relação ao período anterior`}
          icon={TrendingUp}
        />
        <OverviewCard
          label="Pedidos pagos"
          value={String(metrics.orders)}
          helper={`${trendLabel(metrics.ordersTrendPercent)} no volume de pedidos confirmados`}
          icon={ShoppingBag}
        />
        <OverviewCard
          label="Ticket médio"
          value={formatCurrency(metrics.averageTicketInCents)}
          helper="Valor médio por pedido confirmado no canal digital"
          icon={CreditCard}
        />
        <OverviewCard
          label="Conversão"
          value={formatPercent(metrics.conversionRate)}
          helper={`${metrics.visits.toLocaleString("pt-BR")} visitas estimadas no período`}
          icon={MousePointerClick}
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <article className="surface-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                Receita diária
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.65rem,3vw,2rem)] text-[color:var(--wood-dark)]">
                Últimos 7 dias
              </h2>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
              <span className="font-semibold text-[color:var(--wood-dark)]">
                {metrics.cartsAbandoned}
              </span>{" "}
              carrinhos para recuperar
            </div>
          </div>

          <div className="mt-8 grid min-h-[280px] grid-cols-7 items-end gap-3 sm:gap-4">
            {metrics.revenueSeries.map((item) => (
              <div key={item.label} className="flex h-full min-w-0 flex-col justify-end gap-3">
                <div className="flex h-56 items-end rounded-2xl bg-[color:var(--surface)] p-1.5">
                  <div
                    className="w-full rounded-xl bg-[linear-gradient(180deg,var(--copper-light),var(--wood))]"
                    style={{ height: chartHeight(item.revenueInCents, maxRevenue) }}
                    aria-label={`${item.label}: ${formatCurrency(item.revenueInCents)}`}
                  />
                </div>
                <div className="text-center">
                  <p className="truncate text-xs font-semibold text-[color:var(--wood-dark)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] text-[color:var(--muted-foreground)]">
                    {item.orders} ped.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="grid gap-4">
          <article className="surface-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                  Operação
                </p>
                <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
                  Saúde do ecommerce
                </h2>
              </div>
              <BarChart3 className="size-5 text-[color:var(--copper)]" />
            </div>
            <div className="mt-6 grid gap-3">
              {metrics.operationalAlerts.map((alert) => (
                <div
                  key={alert.label}
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${alertToneClass(
                    alert.tone,
                  )}`}
                >
                  <span className="text-sm font-medium">{alert.label}</span>
                  <span className="text-sm font-semibold">{alert.value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
              Catálogo
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[color:var(--surface)] p-4">
                <Boxes className="size-5 text-[color:var(--copper)]" />
                <p className="mt-3 text-2xl font-semibold text-[color:var(--wood-dark)]">
                  {metrics.activeProducts}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">ativos</p>
              </div>
              <div className="rounded-2xl bg-[color:var(--surface)] p-4">
                <AlertTriangle className="size-5 text-[color:var(--copper)]" />
                <p className="mt-3 text-2xl font-semibold text-[color:var(--wood-dark)]">
                  {metrics.lowStockProducts}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">baixo estoque</p>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                Produtos
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
                Mais vendidos
              </h2>
            </div>
            <PackageCheck className="size-5 text-[color:var(--copper)]" />
          </div>
          <div className="mt-6 space-y-4">
            {metrics.bestSellers.map((item, index) => (
              <div key={item.name} className="grid gap-2">
                <div className="flex items-start justify-between gap-4 text-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-xs font-semibold text-[color:var(--wood-dark)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[color:var(--wood-dark)]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                        {formatCurrency(item.revenueInCents)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold text-[color:var(--copper)]">
                    {item.quantity} un.
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--copper)]"
                    style={{
                      width: `${Math.max(8, Math.round((item.quantity / maxBestSellerQuantity) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                Funil comercial
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
                Canais e status
              </h2>
            </div>
            <Users className="size-5 text-[color:var(--copper)]" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {metrics.trafficSources.map((source) => (
                <div key={source.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[color:var(--wood-dark)]">
                      {source.label}
                    </span>
                    <span className="text-[color:var(--muted-foreground)]">{source.share}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--wood)]"
                      style={{ width: `${source.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {metrics.orderStatusBreakdown.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[color:var(--wood-dark)]">
                      {item.label}
                    </span>
                    <span className="text-[color:var(--muted-foreground)]">
                      {item.count} / {totalStatusOrders || 0}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--copper)]"
                      style={{
                        width: `${Math.max(5, Math.round((item.count / maxStatusCount) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="surface-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
              Pedidos recentes
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
              Últimas confirmações
            </h2>
          </div>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Somente pedidos pagos ou em andamento operacional
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[1.4rem] border border-[color:var(--border)]">
          <table className="min-w-[760px] bg-white text-left text-sm">
            <thead className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-4 font-semibold text-[color:var(--wood-dark)]">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-4 text-[color:var(--muted-foreground)]">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--copper)]">
                      {formatOrderStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[color:var(--wood-dark)]">
                    {formatCurrency(order.totalInCents)}
                  </td>
                  <td className="px-4 py-4 text-[color:var(--muted-foreground)]">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
