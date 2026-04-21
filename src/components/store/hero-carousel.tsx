"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types/store";

const AUTO_ADVANCE_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const renderedSlides = useMemo(() => {
    if (slides.length <= 1) {
      return slides;
    }

    return [slides[slides.length - 1], ...slides, slides[0]];
  }, [slides]);

  const [activeIndex, setActiveIndex] = useState(slides.length > 1 ? 1 : 0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isTransitioning) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsAnimating(true);
      setIsTransitioning(true);
      setActiveIndex((current) => current + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isTransitioning, slides.length]);

  const moveLeft = () => {
    if (slides.length <= 1 || isTransitioning) {
      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    setActiveIndex((current) => current + 1);
  };

  const moveRight = () => {
    if (slides.length <= 1 || isTransitioning) {
      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    setActiveIndex((current) => current - 1);
  };

  const goTo = (index: number) => {
    if (slides.length <= 1 || isTransitioning) {
      return;
    }

    const currentVisibleIndex =
      activeIndex === 0 ? slides.length - 1 : activeIndex === slides.length + 1 ? 0 : activeIndex - 1;

    if (index === currentVisibleIndex) {
      return;
    }

    const leftDistance = (index - currentVisibleIndex + slides.length) % slides.length;
    const rightDistance = (currentVisibleIndex - index + slides.length) % slides.length;

    if (leftDistance <= rightDistance) {
      moveLeft();
      return;
    }

    moveRight();
  };

  const handleTransitionEnd = () => {
    if (slides.length <= 1) {
      return;
    }

    setIsTransitioning(false);

    if (activeIndex === 0) {
      setIsAnimating(false);
      setActiveIndex(slides.length);
      return;
    }

    if (activeIndex === slides.length + 1) {
      setIsAnimating(false);
      setActiveIndex(1);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isAnimating]);

  const visibleIndex =
    slides.length <= 1 ? 0 : activeIndex === 0 ? slides.length - 1 : (activeIndex - 1) % slides.length;

  return (
    <section className="relative">
      <div className="overflow-hidden rounded-[1.9rem] border border-[color:var(--border)] bg-white shadow-[0_24px_60px_rgba(60,38,22,0.08)] sm:rounded-[2.5rem] sm:shadow-[0_30px_80px_rgba(60,38,22,0.08)]">
        <div
          className={`flex will-change-transform [backface-visibility:hidden] ${isTransitioning ? "pointer-events-none" : ""} ${isAnimating ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {renderedSlides.map((slide, index) => (
            <Link
              key={`${slide.id}-${index}`}
              href={slide.href}
              className="group relative block w-full shrink-0 [backface-visibility:hidden]"
              aria-label={`Banner ${((index - 1 + slides.length) % slides.length) + 1}`}
            >
              <div className="relative aspect-[4/5] min-h-[260px] sm:aspect-[16/10] sm:min-h-[320px] lg:aspect-[16/6.4] lg:min-h-[360px]">
                <Image
                  src={slide.imageUrl}
                  alt={`Banner ${((index - 1 + slides.length) % slides.length) + 1}`}
                  fill
                  priority={index === 1}
                  className="interactive-zoom object-cover"
                  sizes="100vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={moveRight}
        disabled={isTransitioning}
        className="absolute left-2.5 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.3)] bg-[color:rgba(255,255,255,0.9)] text-[color:var(--wood-dark)] shadow-[0_10px_24px_rgba(34,22,15,0.18)] transition hover:border-[color:var(--copper)] sm:left-4 sm:size-11"
        aria-label="Banner anterior"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={moveLeft}
        disabled={isTransitioning}
        className="absolute right-2.5 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.3)] bg-[color:rgba(255,255,255,0.9)] text-[color:var(--wood-dark)] shadow-[0_10px_24px_rgba(34,22,15,0.18)] transition hover:border-[color:var(--copper)] sm:right-4 sm:size-11"
        aria-label="Próximo banner"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 sm:bottom-5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            disabled={isTransitioning}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === visibleIndex
                ? "w-8 bg-white shadow-[0_8px_16px_rgba(34,22,15,0.24)] sm:w-10"
                : "w-2.5 bg-[color:rgba(255,255,255,0.7)]"
            }`}
            aria-label={`Ir para o banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
