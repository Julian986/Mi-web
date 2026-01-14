export default function Hero() {
  return (
    <section className="relative overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div id="top" className="flex min-h-[calc(100vh-64px)] items-center justify-center pb-16 pt-28">
          {/* Hero simple, blanco y centrado (texto "en el aire") */}
          <div className="w-full max-w-3xl text-center overflow-x-hidden">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-slate-900 sm:text-6xl">
              <span className="relative inline-block">
                <span>
                  Desarrollo de Software
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-1 -bottom-2 h-[3px] rounded-full bg-[linear-gradient(to_right,rgba(59,130,246,0.0),rgba(59,130,246,0.55),rgba(59,130,246,0.0))]"
                />
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Somos una empresa de desarrollo de software especializada en sitios web, tiendas online y aplicaciones a medida de alto rendimiento.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-7 py-3 font-semibold text-white shadow-[0_18px_50px_rgba(2,6,23,0.18)] transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-black/15"
              >
                Ver servicios
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-7 py-3 font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                Hablemos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
