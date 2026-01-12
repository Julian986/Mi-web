import dynamic from "next/dynamic";
import Header from "./components/Header";
import Hero from "./components/Hero";
import { SidebarProvider } from "./components/sidebar/SidebarProvider";
import DrawerSidebar from "./components/sidebar/DrawerSidebar";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

// Lazy load de componentes pesados para mejorar First Contentful Paint
const ServicesDashboards = dynamic(() => import("./components/ServicesDashboards"), {
  loading: () => <div className="h-96 animate-pulse bg-slate-50" />,
});

const ProjectsShowcase = dynamic(() => import("./components/ProjectsShowcase"), {
  loading: () => <div className="h-96 animate-pulse bg-slate-50" />,
});

export default function Home() {
  return (
    <SidebarProvider>
      <div className="min-h-screen overflow-x-hidden text-slate-900">
        <Header />
        <DrawerSidebar />
        <Hero />

        <section id="services" className="overflow-x-hidden">
          <ServicesDashboards />
        </section>

        <section id="work" className="border-t border-black/10 py-16 text-center overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-6 mb-10">
            <h2 className="text-3xl font-bold mb-4">Desarrollos / Casos</h2>
            <p className="text-lg max-w-2xl mx-auto text-slate-600">
              Proyectos reales en producción: webs, tiendas online y aplicaciones que construimos para nuestros clientes. Pasá el mouse sobre cada desarrollo para ver la conexión.
            </p>
          </div>

          <ProjectsShowcase />
        </section>

        <FAQ />

        <section id="contact" className="border-t border-black/10 px-6 py-16 text-center overflow-x-hidden">
          <h2 className="text-3xl font-bold mb-6">Contacto</h2>
          <p className="text-lg max-w-2xl mx-auto text-slate-600 mb-8">
            Contanos qué querés construir. Te respondemos con estimación y próximos pasos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contacto@glomun.com"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-800"
            >
              contacto@glomun.com
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-6 py-2.5 font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              Ver servicios
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </SidebarProvider>
  );
}
