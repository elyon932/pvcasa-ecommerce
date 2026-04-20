import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { storeSettings } from "@/config/store";

const navigationLinks = [
  { href: "/shop", label: "Catálogo" },
  { href: "/about", label: "Sobre a PV Casa" },
  { href: "/shipping", label: "Entrega e frete" },
  { href: "/returns", label: "Trocas e devoluções" },
  { href: "/account", label: "Minha conta" },
];

export function Footer() {
  return (
    <footer
      id="contato"
      className="border-t border-[color:var(--border)] bg-[color:var(--wood-dark)] text-[color:var(--sand)]"
    >
      <div className="container-shell grid gap-10 py-14 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]">
        <div className="space-y-4">
          <BrandLogo compact inverted />
          <p className="max-w-md text-sm leading-7 text-[color:rgba(255,245,235,0.82)]">
            {storeSettings.slogan}. Uma operação digital pensada para vender com clareza, apoiar o
            atendimento humano e manter a rotina da loja prática.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={storeSettings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.18)] bg-[color:rgba(255,255,255,0.06)] transition hover:border-[color:var(--copper-light)] hover:bg-[color:rgba(255,255,255,0.12)]"
              aria-label="Instagram"
            >
              <Image
                src="/social/instagram.svg"
                alt=""
                width={18}
                height={18}
                className="size-[18px]"
              />
            </a>
            <a
              href={storeSettings.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.18)] bg-[color:rgba(255,255,255,0.06)] transition hover:border-[color:var(--copper-light)] hover:bg-[color:rgba(255,255,255,0.12)]"
              aria-label="WhatsApp"
            >
              <Image
                src="/social/whatsapp.svg"
                alt=""
                width={18}
                height={18}
                className="size-[18px]"
              />
            </a>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.24em] text-[color:var(--copper-light)]">
            Navegação
          </p>
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.24em] text-[color:var(--copper-light)]">
            Atendimento
          </p>
          <p>{storeSettings.addressLine}</p>
          <p>{storeSettings.cityState}</p>
          <p>{storeSettings.whatsappNumber}</p>
          <p>{storeSettings.email}</p>
          <p>{storeSettings.supportHours}</p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.24em] text-[color:var(--copper-light)]">
            Operação
          </p>
          <p>Instagram oficial e atendimento por WhatsApp para suporte rápido.</p>
          <Link
            href="/admin/login"
            className="block text-[color:rgba(255,245,235,0.72)] transition hover:text-white"
          >
            Administração
          </Link>
        </div>
      </div>
    </footer>
  );
}
