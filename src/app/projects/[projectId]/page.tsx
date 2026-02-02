import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";
import { getDevelopmentById } from "@/app/lib/developmentsCatalog";
import VisitorsChart from "@/app/components/VisitorsChart";
import PerformanceMetrics from "@/app/components/PerformanceMetrics";
import ProjectDetailHeader from "./ProjectDetailHeader";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const typeLabels = {
  web: "Sitio Web",
  ecommerce: "Tienda Online",
  app: "Aplicación",
};

const typeColors = {
  web: "bg-blue-100 text-blue-700",
  ecommerce: "bg-purple-100 text-purple-700",
  app: "bg-indigo-100 text-indigo-700",
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const development = getDevelopmentById(projectId);

  if (!development) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl font-bold text-slate-900">Proyecto no encontrado</h1>
          <p className="mt-2 text-slate-600">El proyecto que buscas no existe.</p>
          <div className="mt-6">
            <Link
              href="/#projects"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Volver a desarrollos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProjectDetailHeader />

      <div className="mx-auto max-w-7xl px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen - Izquierda en desktop, arriba en mobile */}
          <div className="order-1 lg:order-1">
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-lg flex items-center justify-center p-0">
              <Image
                src={development.image}
                alt={development.title}
                width={1200}
                height={800}
                className="w-full h-auto object-contain max-h-[600px]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Información - Derecha en desktop, abajo en mobile */}
          <div className="order-2 lg:order-2 flex flex-col justify-center space-y-6">
            {/* Título */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {development.title}
              </h1>
            </div>

            {/* Badges de tipo y tecnología */}
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${typeColors[development.type]}`}
              >
                {typeLabels[development.type]}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {development.technology}
              </span>
            </div>

            {/* Dominio */}
            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="w-5 h-5" />
              <span className="text-lg font-medium">{development.domain}</span>
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Sobre el proyecto</h2>
              <p className="text-slate-600 leading-relaxed">
                {development.description ||
                  `Este proyecto fue desarrollado con ${development.technology} para ${typeLabels[development.type].toLowerCase()}. Incluye funcionalidades modernas y un diseño responsivo optimizado para todas las plataformas.`}
              </p>
            </div>

            {/* Botón CTA */}
            <div className="pt-2">
              <a
                href={development.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#84b9ed] px-6 py-3 text-base font-semibold text-white hover:bg-[#6ba3d9] transition-colors shadow-md hover:shadow-lg"
              >
                Ver desarrollo en vivo
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Sección de Analytics */}
        <div className="mt-12 lg:mt-16">
          <VisitorsChart projectId={projectId} />
        </div>

        {/* Sección de Performance Metrics */}
        <div className="mt-12 lg:mt-16">
          <PerformanceMetrics projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
