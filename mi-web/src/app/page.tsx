import Header from "./components/Header";
import Hero from "./components/Hero";
import CompanyCore from "./components/CompanyCore";
import ServicesDashboards from "./components/ServicesDashboards";

export default function Home() {
  return (
    <div className="min-h-screen text-slate-900">
      <Header />
      <Hero />

      <section id="services" className="border-t border-black/10 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-3">Servicios</h2>
          <p className="text-lg max-w-2xl text-slate-600 mb-10">
            Elegí lo que querés construir. Te contamos alcance, tiempos y próximos pasos en simple.
          </p>
        </div>

        <ServicesDashboards />
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
