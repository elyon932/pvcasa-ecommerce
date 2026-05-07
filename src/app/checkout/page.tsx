import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { CheckoutPageContent } from "@/components/checkout/checkout-page-content";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import {
  getCustomerById,
  getPrimaryAddressLabel,
  hasCompleteCheckoutProfile,
} from "@/lib/accounts";
import { clientAuthOptions } from "@/lib/auth";
import { getProductBySlug } from "@/lib/storefront";

type CheckoutPageProps = {
  searchParams: Promise<{
    slug?: string;
    quantity?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const callbackUrl = params.slug
    ? `/checkout?slug=${encodeURIComponent(params.slug)}&quantity=${encodeURIComponent(
        params.quantity ?? "1",
      )}`
    : "/checkout";
  const session = await getServerSession(clientAuthOptions);

  if (!session?.user.customerId) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer || !hasCompleteCheckoutProfile(customer)) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const primaryAddress = customer.primaryAddress;
  if (!primaryAddress) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  const quantity = Math.max(1, Number(params.quantity ?? "1"));
  const buyNowProduct = params.slug ? await getProductBySlug(params.slug) : null;

  if (params.slug && !buyNowProduct) {
    notFound();
  }

  return (
    <StorefrontShell>
      <div className="container-shell py-6 sm:py-8 lg:py-10">
        <CheckoutPageContent
          customer={{
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            createdAt: customer.createdAt,
            addressLabel: getPrimaryAddressLabel(customer) ?? "",
            postalCode: primaryAddress.postalCode,
          }}
          buyNowItem={
            buyNowProduct
              ? {
                  id: buyNowProduct.id,
                  slug: buyNowProduct.slug,
                  name: buyNowProduct.name,
                  quantity: Math.min(quantity, Math.max(1, buyNowProduct.stock)),
                  unitPriceInCents: buyNowProduct.priceInCents,
                }
              : null
          }
        />
      </div>
    </StorefrontShell>
  );
}
