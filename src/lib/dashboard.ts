import "server-only";

import type { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { dashboardMetrics, orders } from "@/data/mockStore";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/storefront";
import type { DashboardMetrics, Order, OrderStatus, Product } from "@/types/store";

const paidOrderStatuses: PrismaOrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const dashboardOrderStatuses: PrismaOrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
const revenueScaleOptions = [
  { range: 7, label: "7 dias" },
  { range: 15, label: "15 dias" },
  { range: 30, label: "1 mês" },
  { range: 365, label: "1 ano" },
] as const;

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pendentes",
  PAID: "Pagos",
  PROCESSING: "Preparação",
  SHIPPED: "Enviados",
  DELIVERED: "Entregues",
  CANCELED: "Cancelados",
};

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeDashboardRange(rangeDays = 7) {
  return [7, 15, 30, 365].includes(rangeDays) ? rangeDays : 7;
}

function getRangeStart(rangeDays: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (rangeDays - 1));
  return start;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildRevenueSeries(
  ordersList: Array<{ createdAt: Date | string; totalInCents: number }>,
  daysCount = 7,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (daysCount - 1 - index));
    const key = getLocalDateKey(date);

    return {
      key,
      label:
        daysCount > 30
          ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date)
          : new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }).format(date),
      revenueInCents: 0,
      orders: 0,
    };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));

  for (const order of ordersList) {
    const key = getLocalDateKey(new Date(order.createdAt));
    const day = byKey.get(key);

    if (day) {
      day.revenueInCents += order.totalInCents;
      day.orders += 1;
    }
  }

  return days.map((day) => ({
    dateKey: day.key,
    label: day.label,
    revenueInCents: day.revenueInCents,
    orders: day.orders,
  }));
}

function calculateTrend(series: Array<{ revenueInCents: number; orders: number }>) {
  const midpoint = Math.max(1, Math.floor(series.length / 2));
  const previous = series.slice(0, midpoint);
  const current = series.slice(midpoint);
  const previousRevenue = previous.reduce((sum, item) => sum + item.revenueInCents, 0);
  const currentRevenue = current.reduce((sum, item) => sum + item.revenueInCents, 0);
  const previousOrders = previous.reduce((sum, item) => sum + item.orders, 0);
  const currentOrders = current.reduce((sum, item) => sum + item.orders, 0);

  return {
    revenueTrendPercent: previousRevenue
      ? roundPercent(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0,
    ordersTrendPercent: previousOrders
      ? roundPercent(((currentOrders - previousOrders) / previousOrders) * 100)
      : 0,
  };
}

function buildTrafficSources(visits: number): DashboardMetrics["trafficSources"] {
  const sources = [
    { label: "Busca orgânica", share: 38 },
    { label: "Instagram", share: 27 },
    { label: "Whatsapp", share: 7 },
    { label: "Facebook", share: 17 },
    { label: "Outros", share: 11 },
  ];

  return sources
    .map((source) => ({
      ...source,
      visits: Math.round((visits * source.share) / 100),
    }))
    .sort((left, right) => right.visits - left.visits);
}

function emptyOrder(index: number): Order {
  return {
    id: `empty-order-${index}`,
    customerId: "empty",
    orderNumber: "Sem dados",
    status: "PENDING",
    customerName: "Sem dados",
    customerEmail: "Sem dados",
    totalInCents: 0,
    city: "Sem dados",
    state: "Sem dados",
    createdAt: new Date(0).toISOString(),
    items: [],
  };
}

function emptyTopCustomer(): DashboardMetrics["topCustomers"][number] {
  return {
    name: "Sem dados",
    orders: 0,
    totalInCents: 0,
  };
}

function emptyBestSeller(): DashboardMetrics["bestSellers"][number] {
  return {
    name: "Sem dados",
    quantity: 0,
    revenueInCents: 0,
  };
}

function completeRecentOrders(entries: Order[]) {
  return [
    ...entries.slice(0, 5),
    ...Array.from({ length: Math.max(0, 5 - entries.length) }, (_, index) =>
      emptyOrder(index),
    ),
  ].slice(0, 5);
}

function completeTopCustomers(entries: DashboardMetrics["topCustomers"]) {
  return [
    ...entries.slice(0, 5),
    ...Array.from({ length: Math.max(0, 5 - entries.length) }, () => emptyTopCustomer()),
  ].slice(0, 5);
}

function completeBestSellers(entries: DashboardMetrics["bestSellers"]) {
  return [
    ...entries.slice(0, 5),
    ...Array.from({ length: Math.max(0, 5 - entries.length) }, () => emptyBestSeller()),
  ].slice(0, 5);
}

function getProductFallbackBestSellers(
  products: Array<{ name: string }>,
  unavailableNames = new Set<string>(),
): DashboardMetrics["bestSellers"] {
  return products
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
    .filter((product) => !unavailableNames.has(product.name))
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      quantity: 0,
      revenueInCents: 0,
    }));
}

function buildCategorySales(
  entries: Array<{ categoryName: string; quantity: number }>,
): DashboardMetrics["categorySales"] {
  const totals = new Map<string, number>();

  for (const entry of entries) {
    totals.set(entry.categoryName, (totals.get(entry.categoryName) ?? 0) + entry.quantity);
  }

  const ordered = Array.from(totals.entries())
    .map(([label, quantity]) => ({ label, quantity }))
    .sort(
      (left, right) =>
        right.quantity - left.quantity || left.label.localeCompare(right.label, "pt-BR"),
    )
    .slice(0, 5);
  const total = ordered.reduce((sum, item) => sum + item.quantity, 0);

  return ordered.map((item) => ({
    ...item,
    share: total ? roundPercent((item.quantity / total) * 100) : 0,
  }));
}

function buildRevenueScales(ordersList: Array<{ createdAt: Date | string; totalInCents: number }>) {
  return revenueScaleOptions.map((option) => ({
    ...option,
    series: buildRevenueSeries(ordersList, option.range),
  }));
}

async function buildFallbackMetrics(rangeDays: number): Promise<DashboardMetrics> {
  const revenueScales = buildRevenueScales([]);

  return {
    revenueInCents: 0,
    orders: 0,
    averageTicketInCents: 0,
    customerAccounts: 0,
    returningCustomers: 0,
    visits: 0,
    conversionRate: 0,
    revenueTrendPercent: 0,
    ordersTrendPercent: 0,
    revenueSeries:
      revenueScales.find((scale) => scale.range === rangeDays)?.series ?? revenueScales[0].series,
    revenueScales,
    bestSellers: completeBestSellers([]),
    trafficSources: dashboardMetrics.trafficSources
      .slice()
      .sort((left, right) => right.visits - left.visits)
      .slice(0, 5),
    orderStatusBreakdown: dashboardOrderStatuses.map((status) => ({
      status,
      label: orderStatusLabels[status],
      count: 0,
    })),
    categorySales: [],
    topCustomers: completeTopCustomers([]),
    recentOrders: completeRecentOrders([]),
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  return getCatalog();
}

export async function getAdminOrders(): Promise<Order[]> {
  if (!hasDatabase()) {
    return orders;
  }

  try {
    const dbOrders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (!dbOrders.length) {
      return orders;
    }

    return dbOrders.map((order) => ({
      id: order.id,
      customerId: order.customerEmail,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalInCents: order.totalInCents,
      city: order.deliveryCity,
      state: order.deliveryState,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId ?? item.productSlug,
        name: item.productName,
        slug: item.productSlug,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
      })),
    }));
  } catch {
    return orders;
  }
}

export async function getDashboardMetrics(rangeDays = 7): Promise<DashboardMetrics> {
  const normalizedRange = normalizeDashboardRange(rangeDays);

  if (!hasDatabase()) {
    return buildFallbackMetrics(normalizedRange);
  }

  try {
    const [
      ordersCount,
      revenueAgg,
      recentOrders,
      paidOrdersForScales,
      statusBreakdown,
      orderItemsForCategories,
      bestSellersRaw,
      customerAccounts,
      topCustomersRaw,
      fallbackProductsRaw,
    ] = await Promise.all([
      prisma.order.count({
        where: { status: { in: paidOrderStatuses } },
      }),
      prisma.order.aggregate({
        where: { status: { in: paidOrderStatuses } },
        _sum: { totalInCents: true },
        _avg: { totalInCents: true },
      }),
      prisma.order.findMany({
        where: { status: { in: paidOrderStatuses } },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { status: { in: paidOrderStatuses }, createdAt: { gte: getRangeStart(365) } },
        select: {
          createdAt: true,
          totalInCents: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { status: { in: dashboardOrderStatuses } },
        _count: { status: true },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: { in: paidOrderStatuses },
          },
        },
        select: {
          quantity: true,
          product: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: {
          order: {
            status: { in: paidOrderStatuses },
          },
        },
        _sum: {
          quantity: true,
          totalInCents: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      }),
      prisma.customer.count(),
      prisma.order.groupBy({
        by: ["customerEmail", "customerName"],
        where: { status: { in: paidOrderStatuses } },
        _count: { _all: true },
        _sum: { totalInCents: true },
        orderBy: [
          { _count: { customerEmail: "desc" } },
          { _sum: { totalInCents: "desc" } },
        ],
        take: 5,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { name: true },
        orderBy: { name: "asc" },
        take: 20,
      }),
    ]);

    const revenueScales = buildRevenueScales(paidOrdersForScales);
    const revenueSeries =
      revenueScales.find((scale) => scale.range === normalizedRange)?.series ??
      revenueScales[0].series;
    const trends = calculateTrend(revenueSeries);
    const visits = Math.max(Math.round(ordersCount / 0.028), ordersCount * 18, 320);
    const conversionRate = visits ? roundPercent((ordersCount / visits) * 100) : 0;
    const statusCountByName = new Map(
      statusBreakdown.map((item) => [item.status, item._count.status]),
    );
    const soldBestSellers = bestSellersRaw.map((item) => ({
      name: item.productName,
      quantity: item._sum.quantity ?? 0,
      revenueInCents: item._sum.totalInCents ?? 0,
    }));
    const fallbackBestSellers =
      soldBestSellers.length < 5
        ? getProductFallbackBestSellers(
            fallbackProductsRaw,
            new Set(soldBestSellers.map((item) => item.name)),
          )
        : [];

    return {
      revenueInCents: revenueAgg._sum.totalInCents ?? 0,
      orders: ordersCount,
      averageTicketInCents: Math.round(revenueAgg._avg.totalInCents ?? 0),
      customerAccounts,
      returningCustomers: Math.max(Math.round(ordersCount * 0.28), ordersCount ? 1 : 0),
      visits,
      conversionRate,
      revenueTrendPercent: trends.revenueTrendPercent,
      ordersTrendPercent: trends.ordersTrendPercent,
      revenueSeries,
      revenueScales,
      trafficSources: buildTrafficSources(visits),
      orderStatusBreakdown: dashboardOrderStatuses.map((status) => ({
        status,
        label: orderStatusLabels[status],
        count: statusCountByName.get(status) ?? 0,
      })).sort((left, right) => right.count - left.count),
      categorySales: buildCategorySales(
        orderItemsForCategories.map((item) => ({
          categoryName: item.product?.category.name ?? "Infantil",
          quantity: item.quantity,
        })),
      ),
      bestSellers: completeBestSellers([...soldBestSellers, ...fallbackBestSellers]),
      topCustomers: completeTopCustomers(
        topCustomersRaw.map((customer) => ({
          name: customer.customerName || customer.customerEmail || "Sem dados",
          orders: customer._count._all,
          totalInCents: customer._sum.totalInCents ?? 0,
        })),
      ),
      recentOrders: completeRecentOrders(
        recentOrders.map((order) => ({
          id: order.id,
          customerId: order.customerEmail,
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalInCents: order.totalInCents,
          city: order.deliveryCity,
          state: order.deliveryState,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId ?? item.productSlug,
            name: item.productName,
            slug: item.productSlug,
            quantity: item.quantity,
            unitPriceInCents: item.unitPriceInCents,
          })),
        })),
      ),
    };
  } catch {
    return buildFallbackMetrics(normalizedRange);
  }
}
