import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getCustomerById } from "@/lib/accounts";
import { clientAuthOptions } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { getCustomerOrders } from "@/lib/storefront";

const ORDERS_PER_PAGE = 5;

type SearchParams = Promise<{
  page?: string;
}>;

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const session = await getServerSession(clientAuthOptions);

  if (!session?.user.customerId) {
    redirect("/account/login");
  }

  const customer = await getCustomerById(session.user.customerId);
  if (!customer) {
    redirect("/account/login");
  }

  const orders = await getCustomerOrders(customer.id, customer.email);
  const sortedOrders = orders
    .slice()
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
  const totalPages = Math.max(
    1,
    Math.ceil(sortedOrders.length / ORDERS_PER_PAGE),
  );
  const requestedPage = Number(params.page ?? "1");
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(Math.floor(requestedPage), totalPages)
      : 1;
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE,
  );
  const pageWindowStart = Math.max(
    1,
    Math.min(currentPage - 1, totalPages - 2),
  );
  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => pageWindowStart + index,
  ).filter((page) => page <= totalPages);

  const buildPageHref = (page: number) => {
    const search = new URLSearchParams();

    if (page > 1) search.set("page", String(page));

    const query = search.toString();
    return `/account/orders${query ? `?${query}` : ""}`;
  };

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
            Histórico detalhado de pedidos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
            Consulte status, datas e os itens de cada compra realizada com sua
            conta.
          </p>
        </div>

        {orders.length ? (
          <>
            <div className="grid gap-4">
              {paginatedOrders.map((order) => (
                <article key={order.id} className="surface-card p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
                        {order.orderNumber}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[color:var(--wood-dark)]">
                        {formatOrderStatus(order.status)}
                      </h2>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-[color:var(--wood-dark)]">
                      {formatCurrency(order.totalInCents)}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="min-w-0 rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]"
                      >
                        <p
                          className="truncate font-semibold text-[color:var(--wood-dark)]"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        <p className="mt-1 whitespace-nowrap">
                          Quantidade: {item.quantity}{" "}
                          <span aria-hidden="true">•</span>{" "}
                          {formatCurrency(item.unitPriceInCents)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-center pt-2 sm:justify-end">
              <nav
                className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[1.5rem] border border-[color:var(--border)] bg-white px-2 py-2 shadow-[0_10px_24px_rgba(60,38,22,0.06)] sm:rounded-full"
                aria-label="Paginação de pedidos"
              >
                {currentPage > 1 ? (
                  <Link
                    href={buildPageHref(currentPage - 1)}
                    className="flex size-10 items-center justify-center rounded-full border border-transparent text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:bg-[color:var(--surface)]"
                    aria-label="Página anterior"
                  >
                    <span aria-hidden="true">&lsaquo;</span>
                  </Link>
                ) : (
                  <span
                    className="flex size-10 items-center justify-center rounded-full text-[color:var(--muted-foreground)] opacity-45"
                    aria-hidden="true"
                  >
                    &lsaquo;
                  </span>
                )}

                {visiblePages.map((page) => (
                  <Link
                    key={page}
                    href={buildPageHref(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                      page === currentPage
                        ? "bg-[color:var(--wood)] text-white"
                        : "text-[color:var(--wood-dark)] hover:bg-[color:var(--surface)] hover:text-[color:var(--copper)]"
                    }`}
                  >
                    {page}
                  </Link>
                ))}

                {currentPage < totalPages ? (
                  <Link
                    href={buildPageHref(currentPage + 1)}
                    className="flex size-10 items-center justify-center rounded-full border border-transparent text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:bg-[color:var(--surface)]"
                    aria-label="Próxima página"
                  >
                    <span aria-hidden="true">&rsaquo;</span>
                  </Link>
                ) : (
                  <span
                    className="flex size-10 items-center justify-center rounded-full text-[color:var(--muted-foreground)] opacity-45"
                    aria-hidden="true"
                  >
                    &rsaquo;
                  </span>
                )}
              </nav>
            </div>
          </>
        ) : (
          <div className="surface-card p-6 text-sm text-[color:var(--muted-foreground)]">
            <div className="flex items-start gap-3">
              <ReceiptText className="mt-0.5 size-4 text-[color:var(--copper)]" />
              <div>
                <p className="font-semibold text-[color:var(--wood-dark)]">
                  Histórico vazio
                </p>
                <p className="mt-1">
                  Nenhum pedido foi registrado para esta conta até o momento.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
