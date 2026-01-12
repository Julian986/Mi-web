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
    question: "¿Cuánto tiempo toma desarrollar un proyecto?",
    answer: "El tiempo de desarrollo varía según la complejidad del proyecto. Una página web básica puede tomar entre 2-4 semanas, mientras que una aplicación completa puede requerir de 2-6 meses. Te proporcionamos un cronograma detallado después de analizar tus necesidades específicas.",
  },
  {
    question: "¿Qué tecnologías utilizan?",
    answer: "Trabajamos con tecnologías modernas y probadas: Next.js, React, TypeScript, Node.js, y bases de datos como PostgreSQL y MongoDB. Para e-commerce utilizamos plataformas como Shopify o desarrollos custom según tus necesidades. Siempre elegimos la mejor stack tecnológica para tu proyecto.",
  },
  {
    question: "¿Ofrecen mantenimiento después del lanzamiento?",
    answer: "Sí, ofrecemos planes de mantenimiento que incluyen actualizaciones de seguridad, mejoras de rendimiento, soporte técnico y nuevas funcionalidades. Puedes elegir entre planes mensuales o contratar soporte bajo demanda según tus necesidades.",
  },
  {
    question: "¿Cómo funciona el proceso de trabajo?",
    answer: "Nuestro proceso es colaborativo: 1) Reunión inicial para entender tus objetivos, 2) Propuesta y presupuesto detallado, 3) Diseño y aprobación, 4) Desarrollo con entregas incrementales, 5) Testing y ajustes, 6) Lanzamiento y capacitación. Te mantenemos informado en cada etapa.",
  },
  {
    question: "¿Pueden integrar mi proyecto con sistemas existentes?",
    answer: "Absolutamente. Integramos tu proyecto con APIs, sistemas de pago, CRMs, herramientas de marketing, y cualquier otro sistema que necesites. Trabajamos con integraciones estándar y también desarrollamos conexiones personalizadas cuando es necesario.",
  },
  {
    question: "¿Qué incluye el precio de un proyecto?",
    answer: "El precio incluye: diseño, desarrollo, testing, despliegue inicial, documentación técnica, y capacitación básica. No incluye hosting, dominios, o servicios de terceros (a menos que se especifique). Te proporcionamos un desglose detallado antes de comenzar.",
  },
  {
    question: "¿Ofrecen diseño además de desarrollo?",
    answer: "Sí, ofrecemos servicios completos de diseño UI/UX. Nuestro equipo diseña interfaces modernas, intuitivas y optimizadas para conversión. El diseño siempre está alineado con tu marca y objetivos de negocio.",
  },
  {
    question: "¿Cómo garantizan la calidad del código?",
    answer: "Aplicamos las mejores prácticas: código limpio y documentado, testing automatizado, revisiones de código, y seguimiento de estándares de la industria. Utilizamos control de versiones (Git) y metodologías ágiles para asegurar calidad en cada entrega.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="border-t border-black/10 py-16 overflow-x-hidden bg-white">
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
                  className={`w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 ${
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
