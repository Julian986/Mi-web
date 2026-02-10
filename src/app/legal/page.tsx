import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Legal | Glomun",
  description:
    "Términos de servicio, política de privacidad y licencia de Glomun. Servicio seguro con Mercado Pago y desarrollo con Next.js.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen overflow-x-hidden text-slate-900 bg-white">
      {/* Header estilo configuración: flecha + título */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="w-6 h-6 shrink-0" />
            <span className="text-lg font-medium">Legal</span>
          </Link>
        </div>
      </header>

      <main className="pt-18 mx-auto max-w-3xl px-6 pb-12 md:pb-16">
        <h1 className="sr-only">Legal</h1>
        <p className="text-slate-600 mb-10 mt-2">
          En esta página encontrás los términos de servicio, la política de privacidad y la licencia del trabajo que entregamos. Si tenés dudas, escribinos.
        </p>

        {/* Términos de servicio */}
        <section id="terminos" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Términos de servicio</h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
            <p>
              Estos términos rigen el uso de los servicios de desarrollo de software ofrecidos por Glomun. Al contratar nuestros servicios, aceptás estos términos.
            </p>
            <p>
              <strong>Servicios.</strong> Ofrecemos desarrollo de sitios web, tiendas online, aplicaciones a medida y consultoría. El alcance concreto de cada proyecto se define en el presupuesto o orden de compra que acordemos.
            </p>
            <p>
              <strong>Pagos.</strong> Los pagos se realizan de forma segura a través de <strong>Mercado Pago</strong> como pasarela de pago. No almacenamos datos de tarjetas; todo el proceso de pago está a cargo de Mercado Pago, cumpliendo con estándares de seguridad y normativa aplicable.
            </p>
            <p>
              <strong>Plazos y entregas.</strong> Los plazos se acuerdan por proyecto. Nos comprometemos a comunicar cualquier demora y a entregar el trabajo en las condiciones pactadas.
            </p>
            <p>
              <strong>Responsabilidad.</strong> Desarrollamos con tecnologías modernas y seguras (por ejemplo Next.js) y buenas prácticas. Nuestra responsabilidad se limita al alcance del servicio contratado y a la corrección de defectos en el trabajo entregado, en los términos que acordemos por escrito.
            </p>
            <p>
              <strong>Cambios.</strong> Podemos actualizar estos términos. Los cambios relevantes se comunicarán por los medios habituales (por ejemplo correo o aviso en el sitio). El uso continuado del servicio después de los cambios implica la aceptación de los nuevos términos.
            </p>
          </div>
        </section>

        {/* Política de privacidad */}
        <section id="privacidad" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Política de privacidad</h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
            <p>
              Respetamos tu privacidad. Esta política describe qué datos recogemos, para qué los usamos y cómo los protegemos.
            </p>
            <p>
              <strong>Datos que recogemos.</strong> Podemos recoger: datos de contacto (nombre, correo, teléfono) cuando nos escribís o contratás un servicio; datos de cuenta si usás el área de clientes (por ejemplo email, preferencias); y datos necesarios para la facturación y el pago (procesados por Mercado Pago). No recogemos más de lo necesario para prestar el servicio y cumplir obligaciones legales.
            </p>
            <p>
              <strong>Uso y confidencialidad.</strong> Usamos los datos solo para prestar el servicio, comunicarnos con vos, facturar y cumplir la ley. <strong>No vendemos ni compartimos tus datos con terceros</strong> para marketing ni otros fines ajenos al servicio. Los datos de pago los procesa únicamente Mercado Pago; nosotros no almacenamos datos de tarjetas.
            </p>
            <p>
              <strong>Seguridad.</strong> Desarrollamos con tecnologías actuales y seguras (Next.js, buenas prácticas de desarrollo) y tratamos los datos de forma confidencial. Tomamos medidas razonables para proteger la información frente a accesos no autorizados o pérdida.
            </p>
            <p>
              <strong>Tus derechos.</strong> Podés solicitar acceso, corrección o eliminación de tus datos personales escribiéndonos. Atenderemos tu solicitud conforme a la ley aplicable.
            </p>
            <p>
              <strong>Cookies y analytics.</strong> El sitio puede usar cookies técnicas y, si corresponde, herramientas de análisis (por ejemplo para medir visitas). Podés configurar tu navegador para limitar cookies; algunas funciones del sitio podrían verse afectadas.
            </p>
            <p>
              <strong>Cambios.</strong> Podemos actualizar esta política. Los cambios importantes se comunicarán por los medios habituales. La versión vigente estará publicada en esta página.
            </p>
          </div>
        </section>

        {/* Licencia / Propiedad intelectual */}
        <section id="licencia" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Licencia y propiedad intelectual</h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
            <p>
              Esta sección describe la propiedad del trabajo que entregamos y el uso que podés darle.
            </p>
            <p>
              <strong>Trabajo entregado.</strong> Una vez que el proyecto está pagado según lo acordado, el cliente recibe los derechos de uso del trabajo contratado (sitio web, tienda, aplicación, etc.) en el alcance que figure en el presupuesto o contrato. El código, diseños y contenidos creados específicamente para el cliente pasan a ser de su uso según lo pactado.
            </p>
            <p>
              <strong>Herramientas y marcos.</strong> El trabajo puede estar basado en tecnologías de terceros (por ejemplo Next.js, librerías open source). Esas tecnologías se rigen por sus propias licencias; nosotros no transferimos derechos sobre ellas, sino sobre el trabajo específico desarrollado para el cliente.
            </p>
            <p>
              <strong>Contenidos y materiales que nos pasás.</strong> Los contenidos, logos y materiales que el cliente nos proporcione siguen siendo de su propiedad. Los usamos únicamente para ejecutar el proyecto y no los compartimos con terceros.
            </p>
            <p>
              Cualquier detalle adicional (por ejemplo exclusividad, cesión total, mantenimiento) puede acordarse por escrito en el presupuesto o contrato del proyecto.
            </p>
          </div>
        </section>

        <p className="text-sm text-slate-500 border-t border-slate-200 pt-6">
          Si necesitás aclarar algo o tenés dudas legales específicas, te recomendamos consultar con un profesional. Para contacto:{" "}
          <a href="mailto:glomunsoftware@gmail.com" className="text-slate-700 underline hover:text-slate-900">
            glomunsoftware@gmail.com
          </a>
          .
        </p>
        <p className="mt-4">
          <Link href="/" className="text-slate-600 hover:text-slate-900 underline text-sm">
            ← Volver al inicio
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
