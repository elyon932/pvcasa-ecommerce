import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ContactForm } from "@/components/store/contact-form";
import { storeSettings } from "@/config/store";

const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com.br/maps/place/PV+CASA/@-4.2761178,-55.9889554,1087m/data=!3m2!1e3!4b1!4m6!3m5!1s0x925fdbb89bf8827f:0xa6c2c803a31bd225!8m2!3d-4.2761178!4d-55.9863805!16s%2Fg%2F11kskqyy3v?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D";
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?output=embed&q=PV+CASA&ll=-4.2761178,-55.9863805&z=16";

export default function ContactPage() {
  return (
    <StorefrontShell>
      <div className="container-shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="surface-card flex h-full flex-col p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
              Contato
            </p>
            <h1 className="mt-4 font-serif text-4xl text-[color:var(--wood-dark)]">
              Fale com a PV Casa
            </h1>
            <p className="mt-4 text-base leading-7 text-[color:var(--muted-foreground)]">
              Envie um e-mail para solicitar atendimento, tirar dúvidas sobre produtos, entrega ou
              pedidos em andamento.
            </p>

            <div className="mt-6 grid gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--muted-foreground)] sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                  Atendimento
                </p>
                <p className="mt-2 font-medium text-[color:var(--wood-dark)]">
                  {storeSettings.email}
                </p>
                <p className="mt-1">{storeSettings.whatsappNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                  Loja física
                </p>
                <p className="mt-2 font-medium text-[color:var(--wood-dark)]">
                  {storeSettings.addressLine}
                </p>
                <p className="mt-1">{storeSettings.cityState}</p>
              </div>
            </div>

            <ContactForm />
          </section>

          <section className="surface-card h-full overflow-hidden p-3">
            <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)]">
              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border)] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                    Localização
                  </p>
                  <p className="mt-1 text-sm font-medium text-[color:var(--wood-dark)]">
                    PV Casa
                  </p>
                </div>
                <a
                  href={GOOGLE_MAPS_PLACE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
                >
                  Abrir no Google Maps
                </a>
              </div>
              <iframe
                title="Localização PV Casa"
                src={GOOGLE_MAPS_EMBED_URL}
                className="min-h-[380px] w-full flex-1 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>
      </div>
    </StorefrontShell>
  );
}
