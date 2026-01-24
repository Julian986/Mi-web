"use client";

import Image from "next/image";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import Stepper from "@/app/components/Stepper";
import { getTemplatesForServiceType, type ServiceType } from "@/app/lib/templatesCatalog";

type StepData = {
  design?: string; // ahora representa el templateId elegido
  colorScheme?: string;
  features?: string[];
  customization?: string;
  budget?: string;
};

const serviceNames = {
  web: "Sitio Web",
  ecommerce: "E-commerce",
  custom: "Software a Medida",
};

export default function ServiceFlowPage() {
  const router = useRouter();
  const params = useParams();
  const serviceType = (params?.serviceType as ServiceType) || "web";
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StepData>({});

  const templates = useMemo(() => getTemplatesForServiceType(serviceType), [serviceType]);

  // Validar que el serviceType sea válido
  useEffect(() => {
    if (!["web", "ecommerce", "custom"].includes(serviceType)) {
      router.push("/");
    }
  }, [serviceType, router]);

  // Si volvemos desde la página de detalle con ?template=..., sincronizamos selección
  useEffect(() => {
    const templateFromUrl = searchParams.get("template");
    if (templateFromUrl && formData.design !== templateFromUrl) {
      setFormData((prev) => ({ ...prev, design: templateFromUrl }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, serviceType]);

  const steps = [
    { id: "design", label: serviceType === "custom" ? "Describe tu proyecto" : "Elige el diseño" },
    { id: "configuration", label: "Configuración" },
    { id: "review", label: "Revisión" },
    { id: "payment", label: "Pago" },
  ];

  const getStepStatus = (index: number): "completed" | "active" | "inactive" => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "inactive";
  };

  const stepperSteps = steps.map((step, index) => ({
    id: step.id,
    label: step.label,
    status: getStepStatus(index),
  }));

  const handleNext = () => {
    // Validación para el paso de diseño
    if (currentStep === 0) {
      if (serviceType === "custom") {
        // Para custom, requerir que haya texto en el textarea
        if (!formData.design || formData.design.trim().length === 0) {
          return; // No avanzar si no hay descripción
        }
      } else {
        // Para web y ecommerce, requerir que haya un diseño seleccionado
        if (!formData.design) {
          return; // No avanzar si no hay diseño seleccionado
        }
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    router.push("/#services");
  };

  const handleInputChange = (field: keyof StepData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 1: Design Selection
  const renderDesignStep = () => {
    // Si es "custom", mostrar textarea para describir el proyecto
    if (serviceType === "custom") {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Describí tu proyecto
            </h3>
            <p className="text-slate-600">
              Contanos en detalle qué tipo de software necesitás, sus funcionalidades principales y cualquier requisito especial.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción del proyecto
            </label>
            <textarea
              value={formData.design || ""}
              onChange={(e) => handleInputChange("design", e.target.value)}
              rows={8}
              placeholder="Ejemplo: Necesito un sistema de gestión de inventario para mi tienda. Debe permitir registrar productos, controlar stock, generar reportes de ventas, y tener un panel de administración para múltiples usuarios con diferentes permisos..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent resize-y min-h-[200px]"
            />
            <p className="mt-2 text-xs text-slate-500">
              Mientras más detalles proporciones, mejor podremos entender tu necesidad y ofrecerte una solución adecuada.
            </p>
          </div>
        </div>
      );
    }

    // Para "web" y "ecommerce", mostrar la grilla de diseños
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Elige el diseño para tu {serviceNames[serviceType]}
          </h3>
          <p className="text-slate-600">
            Elegí un diseño desde el catálogo. Al abrir uno vas a ver 3–5 pantallas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.slice(0, 12).map((template) => {
            const selected = formData.design === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => router.push(`/services/${serviceType}/templates/${template.id}`)}
                className={[
                  "group overflow-hidden rounded-xl border text-left transition-all cursor-pointer",
                  "bg-white hover:bg-slate-50",
                  selected ? "border-[#6B5BCC] ring-2 ring-[#6B5BCC]/20" : "border-slate-200",
                ].join(" ")}
              >
                <div className="relative aspect-[16/10] bg-slate-50">
                  <Image
                    src={template.thumb}
                    alt={template.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{template.title}</h4>
                      <p className="mt-1 text-xs text-slate-500 truncate">{template.id}</p>
                    </div>
                    {selected && (
                      <span className="shrink-0 rounded-full bg-[#6B5BCC]/10 px-2 py-1 text-xs font-semibold text-[#6B5BCC]">
                        Seleccionado
                      </span>
                    )}
                  </div>
                  {template.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.tags.slice(0, 3).map((t) => (
                        <span
                          key={`${template.id}-${t}`}
                          className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {formData.design && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Seleccionado:</span> {formData.design}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tip: podés abrir otro diseño y cambiar la selección cuando vuelvas.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Step 2: Configuration
  const renderConfigurationStep = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Configuración
          </h3>
          <p className="text-slate-600">
            Personaliza tu {serviceNames[serviceType]}
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Esquema de colores
            </label>
            <select
              value={formData.colorScheme || ""}
              onChange={(e) => handleInputChange("colorScheme", e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent cursor-pointer"
            >
              <option value="">Selecciona un esquema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Presupuesto aproximado
            </label>
            <select
              value={formData.budget || ""}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent cursor-pointer"
            >
              <option value="">Selecciona un rango</option>
              <option value="low">$500 - $1,500</option>
              <option value="medium">$1,500 - $5,000</option>
              <option value="high">$5,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Personalización adicional
            </label>
            <textarea
              value={formData.customization || ""}
              onChange={(e) => handleInputChange("customization", e.target.value)}
              rows={3}
              placeholder="Describe cualquier personalización especial que necesites..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

  // Step 3: Review
  const renderReviewStep = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Revisa tu pedido
          </h3>
          <p className="text-slate-600">
            Verifica que todo esté correcto antes de continuar
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <span className="text-sm font-medium text-slate-600">Servicio:</span>
            <p className="text-lg font-semibold text-slate-900">
              {serviceNames[serviceType]}
            </p>
          </div>
          {formData.design && (
            <div>
              <span className="text-sm font-medium text-slate-600">
                {serviceType === "custom" ? "Descripción del proyecto:" : "Diseño:"}
              </span>
              {serviceType === "custom" ? (
                <p className="text-slate-900 mt-1 whitespace-pre-wrap">{formData.design}</p>
              ) : (
                <p className="text-slate-900 capitalize">{formData.design}</p>
              )}
            </div>
          )}
          {formData.colorScheme && (
            <div>
              <span className="text-sm font-medium text-slate-600">
                Esquema de colores:
              </span>
              <p className="text-slate-900 capitalize">{formData.colorScheme}</p>
            </div>
          )}
          {formData.budget && (
            <div>
              <span className="text-sm font-medium text-slate-600">Presupuesto:</span>
              <p className="text-slate-900">
                {formData.budget === "low"
                  ? "$500 - $1,500"
                  : formData.budget === "medium"
                    ? "$1,500 - $5,000"
                    : "$5,000+"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Step 4: Payment
  const renderPaymentStep = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Completa tu compra
          </h3>
          <p className="text-slate-600">
            Ingresa tus datos de contacto y selecciona el método de pago
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent"
              placeholder="juan@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent"
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">
              Método de pago
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" value="transfer" defaultChecked />
                <span>Transferencia bancaria</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" value="card" />
                <span>Tarjeta de crédito/débito</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" value="mercado-pago" />
                <span>Mercado Pago</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDesignStep();
      case 1:
        return renderConfigurationStep();
      case 2:
        return renderReviewStep();
      case 3:
        return renderPaymentStep();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.design;
      case 1:
        return !!formData.colorScheme && !!formData.budget;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {serviceNames[serviceType]}
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Stepper */}
      <div className="py-1 sm:py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        <Stepper steps={stepperSteps} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 sm:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-0"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-200 bg-white max-w-4xl mx-auto w-full flex-shrink-0">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            currentStep === 0
              ? "text-slate-400 cursor-not-allowed"
              : "text-slate-700 hover:bg-slate-200 cursor-pointer"
          }`}
        >
          Atrás
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={() => {
              // Aquí iría la lógica de pago
              alert("¡Gracias por tu compra! Te contactaremos pronto.");
              handleClose();
            }}
            className="px-4 sm:px-6 py-2 bg-[#6B5BCC] text-white rounded-lg font-medium hover:bg-[#5a4ab8] transition-colors cursor-pointer text-sm sm:text-base"
          >
            Finalizar compra
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              canProceed()
                ? "bg-[#6B5BCC] text-white hover:bg-[#5a4ab8] cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}
