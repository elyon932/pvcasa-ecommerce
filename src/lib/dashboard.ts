import "server-only";

import type { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { dashboardMetrics, orders } from "@/data/mockStore";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/storefront";
import type { DashboardMetrics, Order, OrderStatus, Product } from "@/types/store";

const paidOrderStatuses: PrismaOrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const paidOrderStatusLabels: Record<OrderStatus, string> = {
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

function buildRevenueSeries(
  ordersList: Array<{ createdAt: Date | string; totalInCents: number }>,
) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      revenueInCents: 0,
      orders: 0,
    };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));

  for (const order of ordersList) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    const day = byKey.get(key);

    if (day) {
      day.revenueInCents += order.totalInCents;
      day.orders += 1;
    }
  }

  return days.map((day) => ({
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
    { label: "Busca orgânica", share: 42 },
    { label: "Instagram", share: 27 },
    { label: "Direto", share: 19 },
    { label: "Indicações", share: 12 },
  ];

  return sources.map((source) => ({
    ...source,
    visits: Math.round((visits * source.share) / 100),
  }));
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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!hasDatabase()) {
    return dashboardMetrics;
  }

  try {
    const [ordersCount, revenueAgg, recentOrders, paidOrdersForSeries, statusBreakdown, activeProducts, lowStockProducts] = await Promise.all([
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
        take: 6,
      }),
      prisma.order.findMany({
        where: { status: { in: paidOrderStatuses } },
        select: {
          createdAt: true,
          totalInCents: true,
        },
        orderBy: { createdAt: "desc" },
        take: 120,
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { status: { in: paidOrderStatuses } },
        _count: { status: true },
      }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { status: "ACTIVE", stock: { lte: 5 } } }),
    ]);

    const bestSellersRaw = await prisma.orderItem.groupBy({
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
    });

    if (!ordersCount) {
      return dashboardMetrics;
    }

    const revenueSeries = buildRevenueSeries(paidOrdersForSeries);
    const trends = calculateTrend(revenueSeries);
    const visits = Math.max(Math.round(ordersCount / 0.028), ordersCount * 18, 320);
    const conversionRate = visits ? roundPercent((ordersCount / visits) * 100) : 0;
    const statusCountByName = new Map(
      statusBreakdown.map((item) => [item.status, item._count.status]),
    );

    return {
      revenueInCents: revenueAgg._sum.totalInCents ?? 0,
      orders: ordersCount,
      averageTicketInCents: Math.round(revenueAgg._avg.totalInCents ?? 0),
      returningCustomers: Math.max(Math.round(ordersCount * 0.28), 1),
      visits,
      conversionRate,
      cartsAbandoned: Math.max(Math.round(visits * 0.065) - ordersCount, 0),
      activeProducts,
      lowStockProducts,
      revenueTrendPercent: trends.revenueTrendPercent,
      ordersTrendPercent: trends.ordersTrendPercent,
      revenueSeries,
      trafficSources: buildTrafficSources(visits),
      orderStatusBreakdown: paidOrderStatuses.map((status) => ({
        status,
        label: paidOrderStatusLabels[status],
        count: statusCountByName.get(status) ?? 0,
      })),
      operationalAlerts: [
        {
          label: "Checkout aprovado",
          value: `${Math.max(94, 100 - lowStockProducts).toFixed(1).replace(".", ",")}%`,
          tone: "success",
        },
        {
          label: "Produtos com baixo estoque",
          value: String(lowStockProducts),
          tone: lowStockProducts > 0 ? "warning" : "success",
        },
        {
          label: "Catálogo ativo",
          value: `${activeProducts} itens`,
          tone: "neutral",
        },
      ],
      bestSellers: bestSellersRaw.map((item) => ({
        name: item.productName,
        quantity: item._sum.quantity ?? 0,
        revenueInCents: item._sum.totalInCents ?? 0,
      })),
      recentOrders: recentOrders.map((order) => ({
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
    };
  } catch {
    return dashboardMetrics;
  }
}
