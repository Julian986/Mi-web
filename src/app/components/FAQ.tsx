"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "¿Qué incluye mi suscripción / cuenta premium?",
    answer:
      "Con tu suscripción tenés tu sitio o tienda online activa, dominio y hosting incluidos (según el plan), certificado SSL, acceso a “Mi cuenta” para ver tus estadísticas, historial de pagos y datos de tu plan, soporte por WhatsApp y la posibilidad de pedir cambios en tu sitio.",
  },
  {
    question: "¿Qué es un certificado SSL y por qué lo necesito?",
    answer:
      "El certificado SSL es lo que hace que tu web muestre el candado y el “https”. Protege los datos que tus clientes envían (formularios, pagos, etc.) y genera confianza. Sin SSL, muchos navegadores marcan tu sitio como “no seguro” y eso puede espantar visitas.",
  },
  {
    question: "¿Dominio y hosting están incluidos o los pago aparte?",
    answer:
      "En los planes indicados, nos encargamos del dominio y del hosting por vos. Vos no tenés que tocar servidores ni configuraciones raras: nosotros nos ocupamos de que tu sitio esté online y se mantenga funcionando.",
  },
  {
    question: "¿Qué significa que puedo hacer cambios ilimitados?",
    answer:
      "Podés pedirnos cambios razonables en tu sitio: textos, fotos, secciones simples, actualización de precios, horarios, etc. No hay límite fijo de cantidad. Lo que no entra como “cambio” es rehacer todo el diseño o desarrollar una aplicación nueva desde cero; eso se cotiza aparte.",
  },
  {
    question: "¿El mantenimiento está incluido o se paga aparte?",
    answer:
      "Mientras tengas la suscripción activa nos encargamos del mantenimiento básico: actualizaciones, seguridad, pequeños arreglos y cambios razonables en tu sitio. Si necesitás algo grande (como un rediseño completo o una funcionalidad nueva a medida), lo vemos juntos y se cotiza por separado.",
  },
  {
    question: "¿Puedo cancelar cuando quiera? ¿Hay permanencia mínima?",
    answer:
      "Sí, podés cancelar tu suscripción cuando quieras desde “Mi cuenta” o escribiéndonos. No hay contrato de permanencia. Cuando cancelás, dejamos de cobrarte los próximos meses y tu sitio deja de estar activo al finalizar el período ya abonado.",
  },
  {
    question: "¿Qué es exactamente la sección “Mi cuenta”?",
    answer:
      "“Mi cuenta” es tu panel como cliente: ahí ves tu plan, el monto mensual, próximos cobros, historial de pagos y estadísticas de tu sitio (visitas, rendimiento, etc.). También tenés accesos rápidos para ver tu web y contactarnos por soporte.",
  },
  {
    question: "¿Cómo funcionan las estadísticas y métricas de mi sitio?",
    answer:
      "Medimos visitas y rendimiento de tu sitio usando herramientas como Google Analytics y auditorías de performance. En “Mi cuenta” ves un resumen claro para entender cómo está funcionando tu web y tomar decisiones (por ejemplo, si conviene mejorar textos, campañas, etc.).",
  },
  {
    question: "Ya tengo dominio o sitio, ¿lo puedo usar con Glomun?",
    answer:
      "Sí. Si ya tenés un dominio, podemos apuntarlo a tu nuevo sitio en Glomun. Si tenés una web vieja, podemos usarla como base de contenido y hacer un rediseño más moderno y rápido.",
  },
  {
    question: "¿En cuánto tiempo está lista mi web o tienda?",
    answer:
      "Una web o tienda estándar suele estar lista en pocas semanas desde que nos pasás el contenido (textos, logo, fotos). Si el proyecto es más complejo o a medida, te contamos el tiempo estimado antes de empezar.",
  },
  {
    question: "¿Qué necesito tener listo para empezar?",
    answer:
      "Con que tengas claro el nombre de tu negocio, logo (si tenés), textos básicos sobre qué hacés y algunas fotos ya podemos arrancar. Si te falta algo, te guiamos paso a paso para armarlo juntos.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="border-t border-black/10 py-16 overflow-x-hidden bg-white scroll-mt-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Preguntas Frecuentes</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestros servicios y proceso de trabajo
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-lg border border-black/10 overflow-hidden transition-shadow ${
                  isOpen ? "" : "hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={`w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 ${
                    isOpen ? "border-b border-black/10" : ""
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-slate-900 pr-4">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-4 -mt-px">
                        <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            ¿No encontraste la respuesta que buscabas?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Contactanos
          </a>
        </div>
      </div>
    </section>
  );
}
