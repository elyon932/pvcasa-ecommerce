import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const STOCK_FAILURE_NOTE =
  "Pagamento aprovado no Stripe, mas o estoque ficou indisponível antes da confirmação. Reembolso/manual review pendente.";
const PAYMENT_FAILURE_NOTE =
  "Pagamento não foi concluído no Stripe. Revise o pedido antes de seguir com separação ou despacho.";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function appendOrderNote(current: string | null, note: string) {
  if (current?.includes(note)) {
    return current;
  }

  return current ? `${current}\n${note}` : note;
}

function resolvePaymentIntentId(session: Stripe.Checkout.Session) {
  if (!session.payment_intent) {
    return null;
  }

  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;
}

function resolveOrderId(session: Stripe.Checkout.Session) {
  const metadataOrderId = session.metadata?.orderId;

  if (typeof metadataOrderId === "string" && metadataOrderId) {
    return metadataOrderId;
  }

  return null;
}

function resolvePaymentIntentOrderId(paymentIntent: Stripe.PaymentIntent) {
  const metadataOrderId = paymentIntent.metadata?.orderId;

  if (typeof metadataOrderId === "string" && metadataOrderId) {
    return metadataOrderId;
  }

  return null;
}

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function lockOrderForWebhook(tx: TransactionClient, orderId: string) {
  await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
}

async function decrementOrderStock(tx: TransactionClient, order: {
  id: string;
  orderNumber: string;
  deliveryNotes: string | null;
  items: Array<{
    productId: string | null;
    quantity: number;
  }>;
}, paymentIntentId: string | null, paidAt: Date) {
  const stockItems = order.items.filter(
    (item): item is { productId: string; quantity: number } =>
      typeof item.productId === "string" && item.productId.length > 0,
  );

  if (!stockItems.length) {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
        paidAt,
      },
    });

    return { processed: true as const, reason: "paid" as const };
  }

  const productIds = [...new Set(stockItems.map((item) => item.productId))];
  const products = await tx.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      stock: true,
    },
  });

  const stockByProductId = new Map(products.map((product) => [product.id, product.stock]));
  const insufficientItem = stockItems.find((item) => {
    const currentStock = stockByProductId.get(item.productId);
    return typeof currentStock !== "number" || currentStock < item.quantity;
  });

  if (insufficientItem) {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELED",
        stripePaymentIntentId: paymentIntentId,
        paidAt,
        deliveryNotes: appendOrderNote(order.deliveryNotes, STOCK_FAILURE_NOTE),
      },
    });

    return { processed: false as const, reason: "insufficient_stock" as const };
  }

  for (const item of stockItems) {
    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.quantity },
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });

    if (updated.count !== 1) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELED",
          stripePaymentIntentId: paymentIntentId,
          paidAt,
          deliveryNotes: appendOrderNote(order.deliveryNotes, STOCK_FAILURE_NOTE),
        },
      });

      return { processed: false as const, reason: "insufficient_stock" as const };
    }
  }

  await tx.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      stripePaymentIntentId: paymentIntentId,
      paidAt,
    },
  });

  return { processed: true as const, reason: "paid" as const };
}

export async function finalizeStripeCheckoutSession({
  eventId,
  eventType,
  session,
}: {
  eventId: string;
  eventType: string;
  session: Stripe.Checkout.Session;
}) {
  if (!hasDatabase()) {
    return { processed: false as const, reason: "database_unavailable" as const };
  }

  const orderId = resolveOrderId(session);
  if (!orderId) {
    return { processed: false as const, reason: "missing_order_id" as const };
  }

  const paymentIntentId = resolvePaymentIntentId(session);
  const paidAt = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      await lockOrderForWebhook(tx, orderId);

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          stripeSessionId: true,
          deliveryNotes: true,
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });

      await tx.stripeWebhookEvent.create({
        data: {
          stripeEventId: eventId,
          type: eventType,
          orderId: order?.id ?? null,
        },
      });

      if (!order) {
        return { processed: false as const, reason: "order_not_found" as const };
      }

      if (order.stripeSessionId && order.stripeSessionId !== session.id) {
        return { processed: false as const, reason: "session_mismatch" as const };
      }

      if (order.status !== "PENDING") {
        return { processed: false as const, reason: "already_processed" as const };
      }

      return decrementOrderStock(tx, order, paymentIntentId, paidAt);
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { processed: false as const, reason: "duplicate_event" as const };
    }

    throw error;
  }
}

export async function finalizeStripePaymentIntent({
  eventId,
  eventType,
  paymentIntent,
}: {
  eventId: string;
  eventType: string;
  paymentIntent: Stripe.PaymentIntent;
}) {
  if (!hasDatabase()) {
    return { processed: false as const, reason: "database_unavailable" as const };
  }

  const orderId = resolvePaymentIntentOrderId(paymentIntent);
  if (!orderId) {
    return { processed: false as const, reason: "missing_order_id" as const };
  }

  const paidAt = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      await lockOrderForWebhook(tx, orderId);

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          deliveryNotes: true,
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });

      await tx.stripeWebhookEvent.create({
        data: {
          stripeEventId: eventId,
          type: eventType,
          orderId: order?.id ?? null,
        },
      });

      if (!order) {
        return { processed: false as const, reason: "order_not_found" as const };
      }

      if (order.status !== "PENDING") {
        return { processed: false as const, reason: "already_processed" as const };
      }

      return decrementOrderStock(tx, order, paymentIntent.id, paidAt);
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { processed: false as const, reason: "duplicate_event" as const };
    }

    throw error;
  }
}

export async function cancelStripeCheckoutOrder({
  eventId,
  eventType,
  session,
  note = PAYMENT_FAILURE_NOTE,
}: {
  eventId: string;
  eventType: string;
  session: Stripe.Checkout.Session;
  note?: string;
}) {
  if (!hasDatabase()) {
    return { processed: false as const, reason: "database_unavailable" as const };
  }

  const orderId = resolveOrderId(session);
  if (!orderId) {
    return { processed: false as const, reason: "missing_order_id" as const };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await lockOrderForWebhook(tx, orderId);

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          deliveryNotes: true,
        },
      });

      await tx.stripeWebhookEvent.create({
        data: {
          stripeEventId: eventId,
          type: eventType,
          orderId: order?.id ?? null,
        },
      });

      if (!order) {
        return { processed: false as const, reason: "order_not_found" as const };
      }

      if (order.status !== "PENDING") {
        return { processed: false as const, reason: "already_processed" as const };
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELED",
          deliveryNotes: appendOrderNote(order.deliveryNotes, note),
        },
      });

      return { processed: true as const, reason: "canceled" as const };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { processed: false as const, reason: "duplicate_event" as const };
    }

    throw error;
  }
}
