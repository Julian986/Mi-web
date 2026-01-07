import { Scene3D } from "./Hero3D";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-transparent overflow-hidden">
      {/* Background polish (grid + extra glow) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12] [mask-image:radial-gradient(700px_circle_at_35%_25%,black,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,112,243,0.18),transparent_65%)] blur-2xl"
      />

      {/* 3D ambient (desktop): grande a la derecha, sin afectar el layout */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-[-260px] hidden w-[920px] lg:block"
      >
        <div className="absolute top-1/2 left-0 h-[640px] w-[920px] -translate-y-1/2 opacity-90 [mask-image:linear-gradient(to_left,black_65%,transparent)]">
          <Scene3D />
        </div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div id="top" className="flex min-h-screen flex-col items-center justify-center py-20 text-center">
          <div className="mx-auto w-full max-w-3xl space-y-8">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/90">
                <div className="h-2 w-2 rounded-full bg-white/70" />
                <span className="text-sm font-medium">Nexus · Startup de desarrollo</span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Nexus{" "}
                <span className="bg-gradient-to-b from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                  Software
                </span>
              </h1>

              {/* Description */}
              <p className="mx-auto max-w-2xl text-xl text-white/70 leading-relaxed">
                {/* Construimos productos web para empresas en crecimiento: sitios de alto rendimiento, plataformas e‑commerce y software a medida. */}
                Somos un estudio de desarrollo de software especializado en sitios web, tiendas online y aplicaciones a medida de alto rendimiento.
              </p>

              <div className="mx-auto flex flex-wrap justify-center gap-2 text-sm text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">$5,000+</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">&lt; $25 / hr</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">50–249</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Argentina</span>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#services" className="inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-10 py-2.5 font-medium text-black transition-all hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_50px_rgba(0,112,243,0.18)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_22px_65px_rgba(0,112,243,0.24)]">
                  <span>Ver servicios</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="#contact" className="inline-flex items-center justify-center space-x-2 rounded-lg border border-white/15 bg-white/[0.02] px-10 py-2.5 font-medium text-white/90 transition-all hover:bg-white/5 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Hablemos</span>
                </a>
              </div>
          </div>

          {/* 3D (mobile): debajo del contenido */}
          <div className="mt-10 w-full max-w-4xl lg:hidden">
            <div className="relative mx-auto h-[320px] w-full sm:h-[380px]">
              <Scene3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
