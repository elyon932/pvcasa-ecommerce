import { dashboardMetrics, orders } from "@/data/mockStore";
import { prisma } from "@/lib/prisma";
import { getCatalog, normalizeCopy } from "@/lib/storefront";
import type { DashboardMetrics, Order, Product } from "@/types/store";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    customerName: normalizeCopy(order.customerName),
    city: normalizeCopy(order.city),
    state: normalizeCopy(order.state),
    items: order.items.map((item) => ({
      ...item,
      name: normalizeCopy(item.name),
    })),
  };
}

function normalizeMetrics(metrics: DashboardMetrics): DashboardMetrics {
  return {
    ...metrics,
    bestSellers: metrics.bestSellers.map((item) => ({
      ...item,
      name: normalizeCopy(item.name),
    })),
    recentOrders: metrics.recentOrders.map(normalizeOrder),
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  return getCatalog();
}

export async function getAdminOrders(): Promise<Order[]> {
  if (!hasDatabase()) {
    return orders.map(normalizeOrder);
  }

  try {
    const dbOrders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (!dbOrders.length) {
      return orders.map(normalizeOrder);
    }

    return dbOrders.map((order) => ({
      id: order.id,
      customerId: order.customerEmail,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: normalizeCopy(order.customerName),
      customerEmail: order.customerEmail,
      totalInCents: order.totalInCents,
      city: normalizeCopy(order.deliveryCity),
      state: normalizeCopy(order.deliveryState),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId ?? item.productSlug,
        name: normalizeCopy(item.productName),
        slug: item.productSlug,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
      })),
    }));
  } catch {
    return orders.map(normalizeOrder);
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!hasDatabase()) {
    return normalizeMetrics(dashboardMetrics);
  }

  try {
    const [ordersCount, revenueAgg, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalInCents: true },
        _avg: { totalInCents: true },
      }),
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const bestSellersRaw = await prisma.orderItem.groupBy({
      by: ["productName"],
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
      return normalizeMetrics(dashboardMetrics);
    }

    return {
      revenueInCents: revenueAgg._sum.totalInCents ?? 0,
      orders: ordersCount,
      averageTicketInCents: Math.round(revenueAgg._avg.totalInCents ?? 0),
      returningCustomers: Math.max(Math.round(ordersCount * 0.28), 1),
      bestSellers: bestSellersRaw.map((item) => ({
        name: normalizeCopy(item.productName),
        quantity: item._sum.quantity ?? 0,
        revenueInCents: item._sum.totalInCents ?? 0,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customerId: order.customerEmail,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: normalizeCopy(order.customerName),
        customerEmail: order.customerEmail,
        totalInCents: order.totalInCents,
        city: normalizeCopy(order.deliveryCity),
        state: normalizeCopy(order.deliveryState),
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId ?? item.productSlug,
          name: normalizeCopy(item.productName),
          slug: item.productSlug,
          quantity: item.quantity,
          unitPriceInCents: item.unitPriceInCents,
        })),
      })),
    };
  } catch {
    return normalizeMetrics(dashboardMetrics);
  }
}
