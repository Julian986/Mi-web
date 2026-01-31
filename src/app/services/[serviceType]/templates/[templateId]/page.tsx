import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTemplateById, type ServiceType } from "@/app/lib/templatesCatalog";
import ScrollToTopButton from "./ScrollToTopButton";
import TemplateGalleryCarousel from "./TemplateGalleryCarousel";

type PageProps = {
  params: Promise<{
    serviceType: ServiceType;
    templateId: string;
  }>;
};

export default async function TemplateDetailPage({ params }: PageProps) {
  const { serviceType, templateId } = await params;
  const template = getTemplateById(serviceType, templateId);

  if (!template) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl font-bold text-slate-900">Diseño no encontrado</h1>
          <p className="mt-2 text-slate-600">Elegí otro diseño del catálogo.</p>
          <div className="mt-6">
            <Link
              href={`/services/${serviceType}`}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Botón de volver arriba a la izquierda */}
        <div className="mb-6">
          <Link
            href={`/services/${serviceType}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">Catálogo · {serviceType}</p>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{template.title}</h1>
            <Link
              href={`/services/${serviceType}?template=${encodeURIComponent(template.id)}`}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#84b9ed] px-6 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] whitespace-nowrap shrink-0 min-w-[120px]"
            >
              Seleccionar
            </Link>
          </div>
          <p className="mt-2 text-slate-600">
            Así se vería tu sitio con este diseño. Después lo personalizamos con tus fotos y textos. El plan incluye cambios ilimitados.
          </p>
          <div className="mt-4 flex justify-center sm:hidden">
            <Link
              href={`/services/${serviceType}?template=${encodeURIComponent(template.id)}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#84b9ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] whitespace-nowrap w-full"
            >
              Seleccionar
            </Link>
          </div>
        </div>

        <TemplateGalleryCarousel
          templateId={template.id}
          title={template.title}
          gallery={template.gallery}
        />
      </div>
      <ScrollToTopButton />
    </div>
  );
}

