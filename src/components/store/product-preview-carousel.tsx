"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types/store";

type ProductPreviewCarouselProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductPreviewCarousel({
  images,
  productName,
}: ProductPreviewCarouselProps) {
  const renderedImages = useMemo(() => {
    if (images.length <= 1) {
      return images;
    }

    return [images[images.length - 1], ...images, images[0]];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(images.length > 1 ? 1 : 0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const moveLeft = () => {
    if (images.length <= 1 || isTransitioning) {
      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    setActiveIndex((current) => current + 1);
  };

  const moveRight = () => {
    if (images.length <= 1 || isTransitioning) {
      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    setActiveIndex((current) => current - 1);
  };

  const goTo = (index: number) => {
    if (images.length <= 1 || isTransitioning) {
      return;
    }

    const currentVisibleIndex =
      activeIndex === 0 ? images.length - 1 : activeIndex === images.length + 1 ? 0 : activeIndex - 1;

    if (index === currentVisibleIndex) {
      return;
    }

    const leftDistance = (index - currentVisibleIndex + images.length) % images.length;
    const rightDistance = (currentVisibleIndex - index + images.length) % images.length;

    if (leftDistance <= rightDistance) {
      moveLeft();
      return;
    }

    moveRight();
  };

  const handleTransitionEnd = () => {
    if (images.length <= 1) {
      return;
    }

    setIsTransitioning(false);

    if (activeIndex === 0) {
      setIsAnimating(false);
      setActiveIndex(images.length);
      return;
    }

    if (activeIndex === images.length + 1) {
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

  if (!images.length) {
    return null;
  }

  const visibleIndex =
    images.length <= 1 ? 0 : activeIndex === 0 ? images.length - 1 : (activeIndex - 1) % images.length;

  return (
    <div className="surface-card relative h-full min-h-[320px] overflow-hidden sm:min-h-[440px] lg:min-h-[560px]">
      <div
        className={`flex h-full will-change-transform [backface-visibility:hidden] ${isTransitioning ? "pointer-events-none" : ""} ${isAnimating ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
        style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {renderedImages.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="group relative h-full w-full shrink-0 overflow-hidden [backface-visibility:hidden]"
          >
            <Image
              src={image.url}
              alt={image.alt || `${productName} - imagem ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={moveRight}
        disabled={isTransitioning}
        className="absolute left-2.5 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.3)] bg-[color:rgba(255,255,255,0.9)] text-[color:var(--wood-dark)] shadow-[0_10px_24px_rgba(34,22,15,0.18)] transition hover:border-[color:var(--copper)] sm:left-4 sm:size-11"
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={moveLeft}
        disabled={isTransitioning}
        className="absolute right-2.5 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.3)] bg-[color:rgba(255,255,255,0.9)] text-[color:var(--wood-dark)] shadow-[0_10px_24px_rgba(34,22,15,0.18)] transition hover:border-[color:var(--copper)] sm:right-4 sm:size-11"
        aria-label="Próxima imagem"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 sm:bottom-5">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => goTo(index)}
            disabled={isTransitioning}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === visibleIndex
                ? "w-8 bg-white shadow-[0_8px_16px_rgba(34,22,15,0.24)] sm:w-10"
                : "w-2.5 bg-[color:rgba(255,255,255,0.7)]"
            }`}
            aria-label={`Ir para a imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
