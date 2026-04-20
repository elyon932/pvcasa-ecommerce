import { StorefrontShell } from "@/components/layout/storefront-shell";
import { storeSettings } from "@/config/store";

export default function AboutPage() {
  return (
    <StorefrontShell>
      <div className="container-shell flex flex-1 items-start py-8 lg:py-10">
        <div className="surface-card w-full p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[color:var(--copper)]">
            Sobre a marca
          </p>
          <h1 className="mt-4 font-serif text-5xl text-[color:var(--wood-dark)]">
            PV Casa une acolhimento, curadoria e operação prática
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            Com base em {storeSettings.cityState}, a PV Casa combina cama, mesa e banho em uma
            vitrine pensada para facilitar a compra, apoiar o atendimento pelo WhatsApp e manter
            uma gestão profissional no dia a dia.
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
