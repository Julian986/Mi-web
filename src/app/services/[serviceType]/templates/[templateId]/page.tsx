import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTemplateById, type ServiceType } from "@/app/lib/templatesCatalog";

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
            Vista previa del diseño (placeholder). Luego vas a reemplazar imágenes/IDs finales.
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

        <div className="mt-8 grid grid-cols-1 gap-6">
          {template.gallery.slice(0, 5).map((src, idx) => (
            <div key={`${template.id}-${idx}`} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="relative aspect-[16/10] bg-slate-50">
                <Image
                  src={src}
                  alt={`${template.title} - vista ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 960px"
                  priority={idx === 0}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-medium text-slate-900">Pantalla {idx + 1}</p>
                <p className="text-xs text-slate-500">
                  {idx === 0 ? "Home" : idx === 1 ? "Servicios" : idx === 2 ? "Detalle" : idx === 3 ? "Precios" : "Contacto"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

