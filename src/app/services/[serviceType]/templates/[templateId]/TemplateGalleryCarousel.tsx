"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_LABELS = ["Home", "Servicios", "Detalle", "Precios", "Contacto"];

type TemplateGalleryCarouselProps = {
  templateId: string;
  title: string;
  gallery: string[];
};

export default function TemplateGalleryCarousel({
  templateId,
  title,
  gallery,
}: TemplateGalleryCarouselProps) {
  const slides = gallery.slice(0, 5);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    containScroll: "trimSnaps",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      className="mt-8 w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Galería del diseño ${title}`}
    >
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-4">
            {slides.map((src, idx) => (
              <div
                key={`${templateId}-${idx}`}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_85%] lg:flex-[0_0_75%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`Pantalla ${idx + 1}: ${SLIDE_LABELS[idx] ?? "Vista"}`}
              >
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={src}
                      alt={`${title} - vista ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 85vw, 75vw"
                      priority={idx === 0}
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      Pantalla {idx + 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      {SLIDE_LABELS[idx] ?? "Vista"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones anterior / siguiente */}
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 cursor-pointer rounded-full bg-white p-2 shadow-md ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 sm:-translate-x-4"
          aria-label="Pantalla anterior"
        >
          <ChevronLeft className="h-6 w-6 text-slate-700" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 cursor-pointer rounded-full bg-white p-2 shadow-md ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 sm:translate-x-4"
          aria-label="Pantalla siguiente"
        >
          <ChevronRight className="h-6 w-6 text-slate-700" />
        </button>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-2 cursor-pointer rounded-full transition-all ${
                idx === selectedIndex
                  ? "w-6 bg-[#84b9ed]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Ir a pantalla ${idx + 1}`}
              aria-current={idx === selectedIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}

      {/* Indicador de posición */}
      <p className="mt-2 text-center text-xs text-slate-500">
        {selectedIndex + 1} de {slides.length}
      </p>
    </div>
  );
}
