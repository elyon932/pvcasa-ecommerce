import {
  CreditCard,
  MousePointerClick,
  PackageCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { RevenueLineChart } from "@/components/admin/revenue-line-chart";
import { getDashboardMetrics } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";

export const dynamic = "force-dynamic";

const defaultCategorySales = ["Cama", "Mesa", "Banho", "Decor", "Infantil"].map((label) => ({
  label,
  quantity: 0,
  share: 0,
}));

function formatPercent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function buildWholePercentages(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);

  if (!total) {
    return values.map(() => 0);
  }

  const rawPercentages = values.map((value) => (value / total) * 100);
  const floors = rawPercentages.map(Math.floor);
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = rawPercentages
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (const item of order) {
    if (remainder <= 0) {
      break;
    }

    floors[item.index] += 1;
    remainder -= 1;
  }

  return floors;
}

function parseRange(value?: string | string[]) {
  const range = Number(Array.isArray(value) ? value[0] : value);
  return [7, 15, 30, 365].includes(range) ? (range as 7 | 15 | 30 | 365) : 7;
}

function getCategoryColor(label: string) {
  switch (label) {
    case "Cama":
      return "#8b4513";
    case "Mesa":
      return "#b87333";
    case "Banho":
      return "#d69d63";
    case "Decor":
      return "#d4af37";
    case "Infantil":
      return "#5a2b10";
    default:
      return "#efe4d7";
  }
}

function buildDonutGradient(categories: Array<{ label: string; share: number }>) {
  const totalShare = categories.reduce((sum, category) => sum + category.share, 0);

  if (!totalShare) {
    return "conic-gradient(var(--surface-2) 0% 100%)";
  }

  let current = 0;
  const segments = categories.map((category) => {
    const next = current + category.share;
    const segment = `${getCategoryColor(category.label)} ${current}% ${next}%`;
    current = next;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function completeCategorySales(categories: typeof defaultCategorySales) {
  const usedLabels = new Set(categories.map((category) => category.label));
  return [
    ...categories,
    ...defaultCategorySales.filter((category) => !usedLabels.has(category.label)),
  ].slice(0, 5);
}

function OverviewCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[1.6rem] border border-[color:var(--border)] bg-white p-5 shadow-[0_16px_36px_rgba(60,38,22,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--copper)]">
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
    </article>
  );
}

function DashboardProgressItem({
  index,
  label,
  detail,
  rightValue,
  barClassName,
  width,
}: {
  index: number;
  label: string;
  detail: string;
  rightValue?: string;
  barClassName: string;
  width: string;
}) {
  return (
    <div className="grid w-full gap-2">
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-xs font-semibold text-[color:var(--wood-dark)]">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[color:var(--wood-dark)]">{label}</p>
            <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{detail}</p>
          </div>
        </div>
        {rightValue ? (
          <span className="shrink-0 font-semibold text-[color:var(--copper)]">{rightValue}</span>
        ) : null}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width }} />
      </div>
    </div>
  );
}

function displayOrderStatus(status: string, orderNumber: string) {
  return orderNumber === "Sem dados" ? "Sem dados" : formatOrderStatus(status);
}

function displayOrderDate(value: string, orderNumber: string) {
  return orderNumber === "Sem dados" ? "Sem dados" : formatDate(value);
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedRange = parseRange(resolvedSearchParams.range);
  const metrics = await getDashboardMetrics(selectedRange);
  const maxBestSellerQuantity = Math.max(...metrics.bestSellers.map((item) => item.quantity), 1);
  const totalStatusOrders = metrics.orderStatusBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const statusRows = metrics.orderStatusBreakdown.slice(0, 5);
  const statusPercentages = buildWholePercentages(statusRows.map((item) => item.count));
  const categorySales =
    metrics.categorySales.length > 0
      ? completeCategorySales(metrics.categorySales.slice(0, 5))
      : defaultCategorySales;

  return (
    <AdminShell
      title="Dashboard de vendas"
      description="Indicadores essenciais para acompanhar receita, conversão, operação e ritmo comercial da loja."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          label="Faturamento"
          value={formatCurrency(metrics.revenueInCents)}
          icon={TrendingUp}
        />
        <OverviewCard
          label="Ticket médio"
          value={formatCurrency(metrics.averageTicketInCents)}
          icon={CreditCard}
        />
        <OverviewCard
          label="Conversão"
          value={formatPercent(metrics.conversionRate)}
          icon={MousePointerClick}
        />
        <OverviewCard
          label="Contas criadas"
          value={metrics.customerAccounts.toLocaleString("pt-BR")}
          icon={Users}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <article className="surface-card flex min-h-[430px] flex-col p-5 sm:p-6">
          <RevenueLineChart
            scales={
              metrics.revenueScales ?? [
                { range: selectedRange, label: "7 dias", series: metrics.revenueSeries },
              ]
            }
            initialRange={selectedRange}
          />
        </article>

        <article className="surface-card flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                Categorias
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
                Participação nas vendas
              </h2>
            </div>
            <PackageCheck className="size-5 text-[color:var(--copper)]" />
          </div>

          <div className="mt-8 flex flex-1 flex-col justify-center gap-8">
            <div className="mx-auto grid size-48 place-items-center rounded-full p-6 sm:size-56">
              <div
                className="grid size-full place-items-center rounded-full"
                style={{ background: buildDonutGradient(categorySales) }}
              >
                <div className="grid size-[58%] place-items-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_var(--border)]">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--copper)]">
                    Top 5
                  </span>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {categorySales.map((category) => (
                <div key={category.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-[color:var(--wood-dark)]">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category.label) }}
                    />
                    <span className="truncate">{category.label}</span>
                  </span>
                  <span className="shrink-0 text-[color:var(--muted-foreground)]">
                    {category.quantity} un. · {formatPercent(category.share)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
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
            {metrics.bestSellers.slice(0, 5).map((item, index) => (
              <DashboardProgressItem
                key={`${item.name}-${index}`}
                index={index}
                label={item.name}
                detail={formatCurrency(item.revenueInCents)}
                rightValue={`${item.quantity} un.`}
                barClassName="bg-[color:var(--copper)]"
                width={
                  item.quantity > 0
                    ? `${Math.round((item.quantity / maxBestSellerQuantity) * 100)}%`
                    : "0%"
                }
              />
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
                Canais
              </h2>
            </div>
            <Users className="size-5 text-[color:var(--copper)]" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {metrics.trafficSources.slice(0, 5).map((source, index) => (
                <DashboardProgressItem
                  key={source.label}
                  index={index}
                  label={source.label}
                  detail={`${source.visits.toLocaleString("pt-BR")} interações`}
                  rightValue={`${source.share}%`}
                  barClassName="bg-[color:var(--wood)]"
                  width={`${source.share}%`}
                />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="mt-2 mb-6 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)] lg:hidden">
                Status
              </h2>
              {statusRows.map((item, index) => (
                <DashboardProgressItem
                  key={item.status}
                  index={index}
                  label={item.label}
                  detail={`${item.count} / ${totalStatusOrders || 0}`}
                  rightValue={`${statusPercentages[index]}%`}
                  barClassName="bg-[color:var(--copper)]"
                  width={`${statusPercentages[index]}%`}
                />
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="surface-card overflow-hidden p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
              Pedidos recentes
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
              Últimas confirmações
            </h2>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[1.4rem] border border-[color:var(--border)]">
            <table className="w-full min-w-[620px] bg-white text-left text-sm">
              <thead className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 align-middle font-semibold">Pedido</th>
                  <th className="px-4 py-3 align-middle font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-center align-middle font-semibold">Status</th>
                  <th className="px-4 py-3 text-right align-middle font-semibold">Valor</th>
                  <th className="px-4 py-3 text-right align-middle font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4 align-middle font-semibold text-[color:var(--wood-dark)]">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4 align-middle text-[color:var(--muted-foreground)]">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--copper)]">
                        {displayOrderStatus(order.status, order.orderNumber)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right align-middle font-semibold text-[color:var(--wood-dark)]">
                      {formatCurrency(order.totalInCents)}
                    </td>
                    <td className="px-4 py-4 text-right align-middle text-[color:var(--muted-foreground)]">
                      {displayOrderDate(order.createdAt, order.orderNumber)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="surface-card overflow-hidden p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
              Melhores clientes
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.55rem,3vw,1.9rem)] text-[color:var(--wood-dark)]">
              Top 5 compradores
            </h2>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[1.4rem] border border-[color:var(--border)]">
            <table className="w-full min-w-[520px] bg-white text-left text-sm">
              <thead className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 text-center align-middle font-semibold">#</th>
                  <th className="px-4 py-3 align-middle font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-center align-middle font-semibold">Compras</th>
                  <th className="px-4 py-3 text-right align-middle font-semibold">Total gasto</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topCustomers.slice(0, 5).map((customer, index) => (
                  <tr key={`${customer.name}-${index}`} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4 text-center align-middle font-semibold text-[color:var(--wood-dark)]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 align-middle text-[color:var(--muted-foreground)]">
                      {customer.name}
                    </td>
                    <td className="px-4 py-4 text-center align-middle font-semibold text-[color:var(--wood-dark)]">
                      {customer.orders}
                    </td>
                    <td className="px-4 py-4 text-right align-middle font-semibold text-[color:var(--wood-dark)]">
                      {formatCurrency(customer.totalInCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
