import Image from "next/image";
import Link from "next/link";
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Catálogo · {serviceType}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{template.title}</h1>
            <p className="mt-2 text-slate-600">
              Vista previa del diseño (placeholder). Luego vas a reemplazar imágenes/IDs finales.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/services/${serviceType}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Volver
            </Link>
            <Link
              href={`/services/${serviceType}?template=${encodeURIComponent(template.id)}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#6B5BCC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a4ab8]"
            >
              Elegir este diseño
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

