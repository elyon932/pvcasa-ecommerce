import { beforeEach, describe, expect, it, vi } from "vitest";

const constructEvent = vi.fn();
const finalizeStripeCheckoutSession = vi.fn();
const cancelStripeCheckoutOrder = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent,
    },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

vi.mock("@/lib/payments", () => ({
  finalizeStripeCheckoutSession,
  cancelStripeCheckoutOrder,
}));

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects webhook requests with invalid signatures", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "bad-signature",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid signature",
    });
    expect(finalizeStripeCheckoutSession).not.toHaveBeenCalled();
  });

  it("finalizes paid checkout sessions", async () => {
    constructEvent.mockReturnValue({
      id: "evt_paid",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_paid",
          payment_status: "paid",
          metadata: { orderId: "order-1" },
        },
      },
    });
    finalizeStripeCheckoutSession.mockResolvedValue({
      processed: true,
      reason: "paid",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid-signature",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(200);
    expect(finalizeStripeCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: "evt_paid",
        eventType: "checkout.session.completed",
      }),
    );
    expect(cancelStripeCheckoutOrder).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      received: true,
      result: {
        processed: true,
        reason: "paid",
      },
    });
  });
});
