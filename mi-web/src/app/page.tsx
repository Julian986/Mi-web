import Header from "./components/Header";
import Hero from "./components/Hero";
import CompanyCore from "./components/CompanyCore";

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      {/* Subtle vignette across the whole page */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-vignette opacity-60" />
      <Header />
      <Hero />

      <section id="services" className="border-t border-white/10 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Servicios</h2>
        <p className="text-lg max-w-2xl mx-auto text-white/70 mb-10">
          Un equipo senior para diseñar, construir y escalar tu producto. Enfoque en performance, calidad y entrega continua.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-white/20 hover:bg-white/7 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 text-sm text-white/60">50%</div>
            <h3 className="text-xl font-semibold mb-2">Sitios web</h3>
            <p className="text-white/60">Landing + marketing sites rápidos, SEO técnico, diseño moderno y conversiones.</p>
          </div>
          <div className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-white/20 hover:bg-white/7 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 text-sm text-white/60">Plataforma</div>
            <h3 className="text-xl font-semibold mb-2">Tienda online (e‑commerce)</h3>
            <p className="text-white/60">Catálogo, pagos, logística, panel admin e integraciones (Stripe/MercadoPago, etc.).</p>
          </div>
          <div className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-white/20 hover:bg-white/7 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 text-sm text-white/60">A medida</div>
            <h3 className="text-xl font-semibold mb-2">Software a medida</h3>
            <p className="text-white/60">Automatizaciones, dashboards, backoffice, APIs y herramientas internas.</p>
          </div>
        </div>
      </section>

      <section id="work" className="border-t border-white/10 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Desarrollos / Casos</h2>
        <p className="text-lg max-w-2xl mx-auto text-white/70 mb-10">
          Un núcleo tecnológico que conecta proyectos reales: webs, e‑commerce, apps e integraciones. Pasá el mouse (o tab) para ver el sistema “vivo”.
        </p>

        <CompanyCore />
      </section>

      <section id="contact" className="border-t border-white/10 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Contacto</h2>
        <p className="text-lg max-w-2xl mx-auto text-white/70 mb-8">
          Contanos qué querés construir. Te respondemos con estimación y próximos pasos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:contacto@nexus.dev"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-2.5 font-medium text-black transition-colors hover:bg-white/90"
          >
            contacto@nexus.dev
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-6 py-2.5 font-medium text-white/90 transition-colors hover:bg-white/5"
          >
            Ver servicios
          </a>
        </div>
      </section>
    </div>
  );
}
