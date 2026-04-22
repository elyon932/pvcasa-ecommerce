import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerById, hasCompleteCheckoutProfile } from "@/lib/accounts";
import { authOptions } from "@/lib/auth";
import { getCheckoutShippingInCents } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/storefront";
import { getStripe } from "@/lib/stripe";
import { createOrderNumber } from "@/lib/utils";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  source: z.enum(["cart", "buy-now"]).default("cart"),
  cancelPath: z.string().optional(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.customerId || session.user.role !== "customer") {
    return NextResponse.json({ error: "Sessão do cliente não encontrada." }, { status: 401 });
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer || !hasCompleteCheckoutProfile(customer)) {
    return NextResponse.json(
      { error: "Complete seus dados de cadastro antes de seguir para o pagamento." },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const catalogMap = new Map(catalog.map((product) => [product.id, product]));
  const items = parsed.data.items
    .map((item) => {
      const product = catalogMap.get(item.id);
      if (!product) {
        return null;
      }

      return {
        product,
        quantity: Math.min(item.quantity, Math.max(1, product.stock)),
      };
    })
    .filter(
      (
        item,
      ): item is {
        product: (typeof catalog)[number];
        quantity: number;
      } => Boolean(item),
    );

  if (!items.length) {
    return NextResponse.json(
      { error: "Nenhum item válido enviado ao checkout." },
      { status: 400 },
    );
  }

  const primaryAddress = customer.primaryAddress;
  if (!primaryAddress) {
    return NextResponse.json(
      { error: "Cadastre um endereço principal antes de prosseguir." },
      { status: 409 },
    );
  }

  const subtotalInCents = items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0,
  );
  const shippingInCents = getCheckoutShippingInCents(items.length);
  const totalInCents = subtotalInCents + shippingInCents;
  const orderNumber = createOrderNumber();
  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
  const cancelPath = parsed.data.cancelPath ?? "/checkout";
  const cancelUrl = `${origin}${cancelPath.startsWith("/") ? cancelPath : "/checkout"}`;
  const successUrl = `${origin}/checkout/success?order=${orderNumber}`;

  let orderId: string | null = null;

  if (hasDatabase()) {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        subtotalInCents,
        shippingInCents,
        totalInCents,
        paymentMethod: "stripe_checkout",
        customerId: customer.source === "database" ? customer.id : null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        deliveryCity: primaryAddress.city,
        deliveryState: primaryAddress.state,
        deliveryAddress: `${primaryAddress.street}, ${primaryAddress.number} - ${primaryAddress.neighborhood}`,
        deliveryPostalCode: primaryAddress.postalCode,
        deliveryNotes: primaryAddress.complement || null,
        items: {
          create: items.map((item) => ({
            productName: item.product.name,
            productSlug: item.product.slug,
            quantity: item.quantity,
            unitPriceInCents: item.product.priceInCents,
            totalInCents: item.product.priceInCents * item.quantity,
            productId: null,
          })),
        },
      },
      select: { id: true },
    });

    orderId = order.id;
  }

  const stripe = getStripe();
  if (!stripe) {
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    }

    return NextResponse.json({
      checkoutUrl: `/checkout/success?order=${orderNumber}&demo=1`,
    });
  }

  const sessionResult = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customer.email,
    billing_address_collection: "required",
    metadata: {
      orderNumber,
      customerId: customer.id,
      source: parsed.data.source,
      orderId: orderId ?? "",
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: shippingInCents,
            currency: "brl",
          },
          display_name: "Entrega padrão",
        },
      },
    ],
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "brl",
        product_data: {
          name: item.product.name,
          description: item.product.shortDescription,
        },
        unit_amount: item.product.priceInCents,
      },
    })),
  });

  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: sessionResult.id },
    });
  }

  return NextResponse.json({
    checkoutUrl: sessionResult.url,
  });
}
