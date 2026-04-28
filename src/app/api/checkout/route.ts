import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerById, hasCompleteCheckoutProfile } from "@/lib/accounts";
import { authOptions } from "@/lib/auth";
import { getCheckoutShippingInCents } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { jsonError, parseJsonBody } from "@/lib/request";
import { getCatalog } from "@/lib/storefront";
import { buildCheckoutUrls, getStripe } from "@/lib/stripe";
import { createOrderNumber } from "@/lib/utils";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  source: z.enum(["cart", "buy-now"]).default("cart"),
  cancelPath: z.string().trim().regex(/^\/(?!\/|\\).*/).optional(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.customerId || session.user.role !== "customer") {
    return jsonError("Sessão do cliente não encontrada.", 401);
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer || !hasCompleteCheckoutProfile(customer)) {
    return jsonError("Complete seus dados de cadastro antes de seguir para o pagamento.", 409);
  }

  const body = await parseJsonBody(request);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Dados de checkout inválidos.", 400);
  }

  const catalog = await getCatalog();
  const catalogMap = new Map(catalog.map((product) => [product.id, product]));
  const items = parsed.data.items
    .map((item) => {
      const product = catalogMap.get(item.id);
      if (!product || product.stock <= 0) {
        return null;
      }

      return {
        product,
        quantity: Math.min(item.quantity, product.stock),
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
    return jsonError("Nenhum item válido enviado ao checkout.", 400);
  }

  const primaryAddress = customer.primaryAddress;
  if (!primaryAddress) {
    return jsonError("Cadastre um endereço principal antes de prosseguir.", 409);
  }

  const subtotalInCents = items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0,
  );
  const shippingInCents = getCheckoutShippingInCents(items.length);
  const totalInCents = subtotalInCents + shippingInCents;
  const orderNumber = createOrderNumber();
  const stripe = getStripe();

  if (stripe && !hasDatabase()) {
    return jsonError("Configure o banco de dados para habilitar o checkout com Stripe.", 503);
  }

  if (!stripe) {
    return NextResponse.json({
      checkoutUrl: `/checkout/success?order=${orderNumber}&demo=1`,
    });
  }

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
            productId: item.product.source === "database" ? item.product.id : null,
          })),
        },
      },
      select: { id: true },
    });

    orderId = order.id;
  }

  try {
    const { successUrl, cancelUrl } = buildCheckoutUrls({
      orderNumber,
      requestOrigin: request.headers.get("origin"),
      cancelPath: parsed.data.cancelPath ?? "/checkout",
    });

    const sessionResult = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customer.email,
      billing_address_collection: "required",
      client_reference_id: orderId ?? customer.id,
      metadata: {
        orderId: orderId ?? "",
        orderNumber,
        customerId: customer.id,
        source: parsed.data.source,
      },
      payment_intent_data: {
        metadata: {
          orderId: orderId ?? "",
          orderNumber,
          customerId: customer.id,
        },
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
            metadata:
              item.product.source === "database"
                ? {
                    productId: item.product.id,
                  }
                : undefined,
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
  } catch (error) {
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELED",
          deliveryNotes: "Falha ao criar a sessão de pagamento no Stripe. Tente novamente.",
        },
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message === "CHECKOUT_BASE_URL_NOT_CONFIGURED"
              ? "Configure a URL base do checkout antes de usar o Stripe."
              : "Não foi possível iniciar o pagamento agora."
            : "Não foi possível iniciar o pagamento agora.",
      },
      { status: 502 },
    );
  }
}
