import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const stripeWebhookEventCreate = vi.fn();
const orderFindUnique = vi.fn();
const orderUpdate = vi.fn();
const productFindMany = vi.fn();
const productUpdateMany = vi.fn();
const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback({
    stripeWebhookEvent: {
      create: stripeWebhookEventCreate,
    },
    order: {
      findUnique: orderFindUnique,
      update: orderUpdate,
    },
    product: {
      findMany: productFindMany,
      updateMany: productUpdateMany,
    },
  }),
);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
  },
}));

describe("payments", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://localhost/test";
  });

  it("finalizes a paid checkout session and decrements stock", async () => {
    orderFindUnique.mockResolvedValue({
      id: "order-1",
      orderNumber: "PVC-20260425-101",
      status: "PENDING",
      stripeSessionId: "cs_test_123",
      deliveryNotes: null,
      items: [{ productId: "prod-1", quantity: 2 }],
    });
    productFindMany.mockResolvedValue([{ id: "prod-1", stock: 5 }]);
    productUpdateMany.mockResolvedValue({ count: 1 });
    orderUpdate.mockResolvedValue({ id: "order-1" });

    const { finalizeStripeCheckoutSession } = await import("@/lib/payments");

    const result = await finalizeStripeCheckoutSession({
      eventId: "evt_1",
      eventType: "checkout.session.completed",
      session: {
        id: "cs_test_123",
        metadata: { orderId: "order-1" },
        payment_intent: "pi_123",
      } as never,
    });

    expect(result).toEqual({ processed: true, reason: "paid" });
    expect(stripeWebhookEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stripeEventId: "evt_1",
          orderId: "order-1",
        }),
      }),
    );
    expect(productUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "prod-1", stock: { gte: 2 } },
      }),
    );
    expect(orderUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: expect.objectContaining({
          status: "PAID",
          stripePaymentIntentId: "pi_123",
          paidAt: expect.any(Date),
        }),
      }),
    );
  });

  it("treats duplicate webhook events as idempotent", async () => {
    stripeWebhookEventCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "6.19.3",
      }),
    );

    const { finalizeStripeCheckoutSession } = await import("@/lib/payments");

    const result = await finalizeStripeCheckoutSession({
      eventId: "evt_duplicate",
      eventType: "checkout.session.completed",
      session: {
        id: "cs_test_123",
        metadata: { orderId: "order-1" },
        payment_intent: "pi_123",
      } as never,
    });

    expect(result).toEqual({ processed: false, reason: "duplicate_event" });
    expect(orderFindUnique).not.toHaveBeenCalled();
  });
});
