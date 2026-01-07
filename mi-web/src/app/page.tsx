import Header from "./components/Header";
import Hero from "./components/Hero";
import CompanyCore from "./components/CompanyCore";

export default function Home() {
  return (
    <div className="min-h-screen text-slate-900">
      <Header />
      <Hero />

      <section id="services" className="border-t border-black/10 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Servicios</h2>
        <p className="text-lg max-w-2xl mx-auto text-slate-600 mb-10">
          Equipo senior para diseñar, construir y escalar. Sin humo: claridad técnica, buenas prácticas y entregas predecibles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group rounded-2xl border border-black/10 bg-white p-6 text-left shadow-[0_10px_30px_rgba(2,6,23,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(2,6,23,0.10)]">
            <div className="mb-3 text-xs font-medium text-slate-500">Web</div>
            <h3 className="text-xl font-semibold mb-2">Sitios web</h3>
            <p className="text-slate-600">Landing y marketing sites rápidos, SEO técnico, diseño moderno y foco en conversiones.</p>
          </div>
          <div className="group rounded-2xl border border-black/10 bg-white p-6 text-left shadow-[0_10px_30px_rgba(2,6,23,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(2,6,23,0.10)]">
            <div className="mb-3 text-xs font-medium text-slate-500">Plataforma</div>
            <h3 className="text-xl font-semibold mb-2">Tienda online (e‑commerce)</h3>
            <p className="text-slate-600">Catálogo, pagos, logística, panel admin e integraciones (Stripe/MercadoPago, etc.).</p>
          </div>
          <div className="group rounded-2xl border border-black/10 bg-white p-6 text-left shadow-[0_10px_30px_rgba(2,6,23,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(2,6,23,0.10)]">
            <div className="mb-3 text-xs font-medium text-slate-500">A medida</div>
            <h3 className="text-xl font-semibold mb-2">Software a medida</h3>
            <p className="text-slate-600">Automatizaciones, dashboards, backoffice, APIs y herramientas internas.</p>
          </div>
        </div>
      </section>

      <section id="work" className="border-t border-black/10 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Desarrollos / Casos</h2>
        <p className="text-lg max-w-2xl mx-auto text-slate-600 mb-10">
          Un núcleo tecnológico que conecta proyectos reales: webs, e‑commerce, apps e integraciones. Pasá el mouse (o tab) para ver el sistema “vivo”.
        </p>

        <CompanyCore />
      </section>

      <section id="contact" className="border-t border-black/10 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Contacto</h2>
        <p className="text-lg max-w-2xl mx-auto text-slate-600 mb-8">
          Contanos qué querés construir. Te respondemos con estimación y próximos pasos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:contacto@nexus.dev"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-800"
          >
            contacto@nexus.dev
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-6 py-2.5 font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            Ver servicios
          </a>
        </div>
      </section>
    </div>
  );
}
