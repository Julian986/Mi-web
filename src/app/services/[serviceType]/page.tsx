"use client";

import Image from "next/image";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, PenTool, AlertTriangle } from "lucide-react";
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
  const [showAlert, setShowAlert] = useState(false);

  const templates = useMemo(() => getTemplatesForServiceType(serviceType), [serviceType]);

  // Validar que el serviceType sea válido
  useEffect(() => {
    if (!["web", "ecommerce", "custom"].includes(serviceType)) {
      router.push("/");
    }
  }, [serviceType, router]);

  // Si volvemos desde la página de detalle con ?template=..., sincronizamos selección y hacemos scroll
  useEffect(() => {
    const templateFromUrl = searchParams.get("template");
    if (templateFromUrl && formData.design !== templateFromUrl) {
      setFormData((prev) => ({ ...prev, design: templateFromUrl }));
      
      // Hacer scroll al diseño seleccionado después de actualizar el estado
      if (currentStep === 0) {
        const scrollToSelected = () => {
          const selectedElement = document.getElementById(`design-${templateFromUrl}`);
          if (selectedElement) {
            // Buscar el contenedor scrollable (el div con overflow-y-auto)
            const scrollContainer = selectedElement.closest('.overflow-y-auto');
            if (scrollContainer) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const elementRect = selectedElement.getBoundingClientRect();
              const yOffset = -120; // Offset para que no quede pegado arriba
              const scrollTop = scrollContainer.scrollTop + (elementRect.top - containerRect.top) + yOffset;
              scrollContainer.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
            } else {
              // Fallback: usar window scroll si no encontramos el contenedor
              const yOffset = -120;
              const y = selectedElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
            }
          }
        };
        
        // Intentar múltiples veces para asegurar que el elemento esté disponible
        setTimeout(scrollToSelected, 200);
        setTimeout(scrollToSelected, 400);
        setTimeout(scrollToSelected, 600);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, serviceType, currentStep]);

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
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
          return; // No avanzar si no hay descripción
        }
      } else {
        // Para web y ecommerce, requerir que haya un diseño seleccionado
        if (!formData.design) {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent resize-y min-h-[200px]"
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
          {/* Opción Personalizado - Primera posición */}
          <button
            id="design-personalizado"
            type="button"
            onClick={() => {
              handleInputChange("design", "personalizado");
            }}
            className={[
              "group overflow-hidden rounded-xl border text-left transition-all cursor-pointer",
              "bg-white hover:bg-slate-50",
              formData.design === "personalizado"
                ? "border-[#84b9ed] ring-2 ring-[#84b9ed]/20"
                : "border-slate-300 border-dashed",
            ].join(" ")}
          >
            <div className="relative aspect-[16/10] bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                <PenTool className="w-12 h-12" strokeWidth={1.5} />
                <p className="text-sm font-medium">Diseño personalizado</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900">Diseño personalizado</h4>
                  <p className="mt-1 text-xs text-slate-500">Crea algo único para tu negocio</p>
                </div>
                {formData.design === "personalizado" && (
                  <span className="shrink-0 rounded-full bg-[#84b9ed]/10 px-2 py-1 text-xs font-semibold text-[#84b9ed]">
                    Seleccionado
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Resto de los diseños del catálogo */}
          {templates.slice(0, 12).map((template) => {
            const selected = formData.design === template.id;
            return (
              <button
                id={`design-${template.id}`}
                key={template.id}
                type="button"
                onClick={() => router.push(`/services/${serviceType}/templates/${template.id}`)}
                className={[
                  "group overflow-hidden rounded-xl border text-left transition-all cursor-pointer",
                  "bg-white hover:bg-slate-50",
                  selected ? "border-[#84b9ed] ring-2 ring-[#84b9ed]/20" : "border-slate-200",
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
                      <span className="shrink-0 rounded-full bg-[#84b9ed]/10 px-2 py-1 text-xs font-semibold text-[#84b9ed]">
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
              <span className="font-semibold text-[#84b9ed]">Seleccionado:</span>{" "}
              {formData.design === "personalizado" ? "Diseño personalizado" : formData.design}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formData.design === "personalizado"
                ? "Diseñaremos algo único para tu negocio."
                : "Tip: podés abrir otro diseño y cambiar la selección cuando vuelvas."}
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
            <div className="relative">
              <select
                value={formData.colorScheme || ""}
                onChange={(e) => handleInputChange("colorScheme", e.target.value)}
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer appearance-none bg-white ${
                  !formData.colorScheme ? "text-slate-400" : "text-slate-900"
                }`}
              >
                <option value="" className="hidden">Selecciona un esquema</option>
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="custom">Personalizado</option>
              </select>
              {!formData.colorScheme && (
                <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                  <span className="text-slate-400">Selecciona un esquema</span>
                </div>
              )}
            </div>
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent resize-none"
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
                <p className="text-slate-900 capitalize">
                  {formData.design === "personalizado" ? "Personalizado" : formData.design}
                </p>
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
          <div>
            <span className="text-sm font-medium text-slate-600">
              Mensualidad:
            </span>
            <p className="text-slate-900">
              {serviceType === "web" ? (
                <>
                  <span className="font-semibold">$25.000 ARS</span> / $21 USD mensuales
                </>
              ) : serviceType === "ecommerce" ? (
                <>
                  <span className="font-semibold">$35.000 ARS</span> / $29 USD mensuales
                </>
              ) : (
                "Consultar"
              )}
            </p>
          </div>
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
              placeholder="juan@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
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
        return !!formData.colorScheme;
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

      {/* Alerta modal cuando no hay diseño seleccionado */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAlert(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-yellow-100 p-8 max-w-md mx-4 relative"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" strokeWidth={2} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Diseño requerido
                  </h3>
                  <p className="text-sm text-slate-600">
                    Debes seleccionar un diseño para continuar con el proceso
                  </p>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="mt-2 px-6 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors text-sm"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 sm:p-8 pb-24 sm:pb-28 max-w-4xl mx-auto w-full">
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between p-4 sm:p-6">
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
            className="px-4 sm:px-6 py-2 bg-[#84b9ed] text-white rounded-lg font-medium hover:bg-[#6ba3d9] transition-colors cursor-pointer text-sm sm:text-base"
          >
            Finalizar compra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              canProceed()
                ? "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-pointer"
            }`}
          >
            Continuar
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
