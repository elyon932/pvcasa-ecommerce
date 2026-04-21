import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ContactForm } from "@/components/store/contact-form";

const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?output=embed&q=PV+CASA&ll=-4.2761178,-55.9863805&z=16";

export default function ContactPage() {
  return (
    <StorefrontShell>
      <div className="container-shell py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <section className="surface-card flex h-full flex-col p-5 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
              Contato
            </p>
            <h1 className="mt-4 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-tight text-[color:var(--wood-dark)]">
              Fale com a PV Casa
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)]">
              Envie um e-mail para solicitar atendimento, tirar dúvidas sobre produtos, entrega ou
              pedidos em andamento.
            </p>
            <ContactForm />
          </section>

          <section className="surface-card h-full overflow-hidden p-3">
            <div className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] sm:min-h-[460px] sm:rounded-[1.75rem] lg:min-h-[520px]">
              <div className="border-b border-[color:var(--border)] px-4 py-4 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                  Localização
                </p>
              </div>
              <iframe
                title="Localização PV Casa"
                src={GOOGLE_MAPS_EMBED_URL}
                className="min-h-[300px] w-full flex-1 border-0 sm:min-h-[380px]"
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
