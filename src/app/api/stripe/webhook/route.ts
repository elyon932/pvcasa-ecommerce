import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  cancelStripeCheckoutOrder,
  finalizeStripeCheckoutSession,
  finalizeStripePaymentIntent,
} from "@/lib/payments";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook não configurado." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Assinatura Stripe ausente." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Assinatura Stripe inválida.",
      },
      { status: 400 },
    );
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.async_payment_failed" &&
    event.type !== "payment_intent.succeeded"
  ) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const result = await finalizeStripePaymentIntent({
      eventId: event.id,
      eventType: event.type,
      paymentIntent,
    });

    return NextResponse.json(
      {
        received: true,
        result,
      },
      { status: 200 },
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (
    event.type === "checkout.session.completed" &&
    session.payment_status !== "paid"
  ) {
    return NextResponse.json({
      received: true,
      ignored: "payment_not_confirmed_yet",
    });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const result = await finalizeStripeCheckoutSession({
      eventId: event.id,
      eventType: event.type,
      session,
    });

    return NextResponse.json(
      {
        received: true,
        result,
      },
      { status: 200 },
    );
  }

  const result = await cancelStripeCheckoutOrder({
    eventId: event.id,
    eventType: event.type,
    session,
  });

  return NextResponse.json(
    {
      received: true,
      result,
    },
    { status: 200 },
  );
}
