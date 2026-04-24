import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { getHeroSlides } from "@/lib/storefront";

export default async function AdminContentPage() {
  const slides = await getHeroSlides();

  return (
    <AdminShell
      title="Banners da home"
      description="Revise os banners visuais que abrem a jornada de compra da loja."
    >
      <section className="grid gap-6 xl:grid-cols-2">
        {slides.map((slide, index) => (
          <article key={slide.id} className="surface-card overflow-hidden">
            <div className="relative h-72">
              <Image
                src={slide.imageUrl}
                alt={`Banner ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
                Banner {index + 1}
              </p>
              <p className="text-sm font-medium text-[color:var(--wood)]">
                Destino: {slide.href}
              </p>
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
