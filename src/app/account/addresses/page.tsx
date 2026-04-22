import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddressForm } from "@/components/account/address-form";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getCustomerById } from "@/lib/accounts";
import { authOptions } from "@/lib/auth";

export default async function AccountAddressesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.customerId || session.user.role !== "customer") {
    redirect("/account/login");
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer) {
    redirect("/account/login");
  }

  const primaryAddress = customer.addresses.find((address) => address.type === "PRIMARY") ?? null;
  const secondaryAddress =
    customer.addresses.find((address) => address.type === "SECONDARY") ?? null;

  return (
    <StorefrontShell>
      <div className="container-shell space-y-6 py-6 sm:space-y-8 sm:py-8 lg:py-10">
        <div className="surface-card p-5 sm:p-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--copper)] transition hover:text-[color:var(--wood-dark)]"
          >
            <ArrowLeft className="size-4" />
            Voltar para a conta
          </Link>
          <h1 className="mt-4 font-serif text-[clamp(1.9rem,4vw,2.5rem)] text-[color:var(--wood-dark)]">
            Gerenciar endereços
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
            Atualize o endereço principal e mantenha um endereço secundário salvo para futuras
            compras.
          </p>
        </div>

        <AddressForm primaryAddress={primaryAddress} secondaryAddress={secondaryAddress} />
      </div>
    </StorefrontShell>
  );
}
