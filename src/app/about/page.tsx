import { StorefrontShell } from "@/components/layout/storefront-shell";
import { storeSettings } from "@/config/store";

export default function AboutPage() {
  return (
    <StorefrontShell>
      <div className="container-shell flex flex-1 items-start py-6 sm:py-8 lg:py-10">
        <div className="surface-card w-full p-5 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)] sm:text-sm sm:tracking-[0.32em]">
            Sobre a marca
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2rem,4.4vw,3.2rem)] leading-tight text-[color:var(--wood-dark)]">
            PV Casa une acolhimento, curadoria e operação prática
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[color:var(--muted-foreground)] sm:text-lg sm:leading-8">
            Com base em {storeSettings.cityState}, a PV Casa combina cama, mesa e banho em uma
            vitrine pensada para facilitar a compra, apoiar o atendimento pelo WhatsApp e manter
            uma gestão profissional no dia a dia.
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
