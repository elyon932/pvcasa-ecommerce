import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MapPinned, ReceiptText } from "lucide-react";
import { AccountSectionCard } from "@/components/account/account-section-card";
import { SignOutButton } from "@/components/common/sign-out-button";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getCustomerById, getPrimaryAddressLabel } from "@/lib/accounts";
import { clientAuthOptions } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { getCustomerOrders } from "@/lib/storefront";

export default async function AccountPage() {
  const session = await getServerSession(clientAuthOptions);

  if (!session || !session.user.customerId) {
    redirect("/account/login");
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer) {
    redirect("/account/login");
  }

  const orders = await getCustomerOrders(customer.id, customer.email);
  const recentOrders = orders
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 2);
  const primaryAddress = customer.primaryAddress;

  return (
    <StorefrontShell>
      <div className="container-shell space-y-6 py-6 sm:space-y-8 sm:py-8 lg:py-10">
        <div className="surface-card flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Minha conta
            </p>
            <h1 className="mt-3 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
              {customer.name}
            </h1>
            <p className="mt-2 break-words text-base text-[color:var(--muted-foreground)]">
              {customer.email} • {customer.phone}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <AccountSectionCard eyebrow="Perfil" title="Dados da conta">
              <div className="grid gap-4 text-sm text-[color:var(--muted-foreground)] sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-4">
                  <p className="font-semibold text-[color:var(--wood-dark)]">Conta criada em</p>
                  <p className="mt-1">{formatDate(customer.createdAt)}</p>
                </div>
                <div className="rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-4">
                  <p className="font-semibold text-[color:var(--wood-dark)]">Pedidos registrados</p>
                  <p className="mt-1">{orders.length}</p>
                </div>
              </div>
            </AccountSectionCard>

            <AccountSectionCard
              eyebrow="Endereço"
              title="Dados de entrega"
              action={
                <Link
                  href="/account/addresses"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
                  aria-label="Gerenciar endereços"
                >
                  <MapPinned className="size-4" />
                </Link>
              }
            >
              {primaryAddress ? (
                <div className="rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]">
                  <div>
                    <p className="font-semibold text-[color:var(--wood-dark)]">
                      {primaryAddress.label}
                    </p>
                    <p className="mt-1">{primaryAddress.recipientName}</p>
                  </div>
                  <div className="mt-3">
                    <p>{getPrimaryAddressLabel(customer)}</p>
                    <p>CEP {primaryAddress.postalCode}</p>
                    {primaryAddress.complement ? <p>{primaryAddress.complement}</p> : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--muted-foreground)]">
                  Nenhum endereço principal cadastrado.
                </div>
              )}
            </AccountSectionCard>
          </div>

          <AccountSectionCard
            eyebrow="Histórico de pedidos"
            title="Acompanhe suas compras"
            action={
              <Link
                href="/account/orders"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
              >
                Ver todos
              </Link>
            }
          >
            {orders.length ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[color:var(--wood-dark)]">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-[color:var(--copper)]">
                          {formatOrderStatus(order.status)}
                        </p>
                        <p className="font-semibold text-[color:var(--wood-dark)]">
                          {formatCurrency(order.totalInCents)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        order.items.length > 2
                          ? "mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(5rem,0.45fr)]"
                          : "mt-4 grid gap-3 sm:grid-cols-2"
                      }
                    >
                      {order.items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="min-w-0 rounded-[1.25rem] bg-white px-4 py-4 text-sm text-[color:var(--muted-foreground)]"
                        >
                          <p
                            className="truncate font-semibold text-[color:var(--wood-dark)]"
                            title={item.name}
                          >
                            {item.name}
                          </p>
                          <p className="mt-1 whitespace-nowrap">
                            Quantidade: {item.quantity}{" "}
                            <span aria-hidden="true">
                              •
                            </span>{" "}
                            {formatCurrency(item.unitPriceInCents)}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 ? (
                        <div className="grid min-h-[76px] place-items-center rounded-[1.25rem] bg-white px-4 py-4 text-center text-sm text-[color:var(--muted-foreground)]">
                          <div>
                            <p className="text-lg font-semibold leading-none text-[color:var(--wood-dark)]">
                              +{order.items.length - 2}
                            </p>
                            <p className="mt-1 text-xs">itens</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted-foreground)]">
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 size-4 text-[color:var(--copper)]" />
                  <div>
                    <p className="font-semibold text-[color:var(--wood-dark)]">
                      Histórico vazio
                    </p>
                    <p className="mt-1">
                      Seus pedidos aparecerão aqui assim que uma compra for iniciada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </AccountSectionCard>
        </div>
      </div>
    </StorefrontShell>
  );
}
