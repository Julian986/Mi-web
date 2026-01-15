"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import Stepper from "./Stepper";

type ServiceType = "web" | "ecommerce" | "custom";

type ServiceFlowProps = {
  serviceType: ServiceType;
  onClose: () => void;
};

type StepData = {
  design?: string;
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

export default function ServiceFlow({ serviceType, onClose }: ServiceFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StepData>({});

  const steps = [
    { id: "design", label: "Elige el diseño" },
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof StepData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 1: Design Selection
  const renderDesignStep = () => {
    const designs = [
      { id: "modern", name: "Moderno", description: "Diseño limpio y contemporáneo" },
      { id: "classic", name: "Clásico", description: "Estilo tradicional y profesional" },
      { id: "minimalist", name: "Minimalista", description: "Simple y elegante" },
      { id: "bold", name: "Atrevido", description: "Vibrante y llamativo" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Elige el diseño para tu {serviceNames[serviceType]}
          </h3>
          <p className="text-slate-600">
            Selecciona el estilo que mejor represente tu marca
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => handleInputChange("design", design.id)}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                formData.design === design.id
                  ? "border-[#6B5BCC] bg-[#6B5BCC]/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <h4 className="font-semibold text-slate-900 mb-1">{design.name}</h4>
              <p className="text-sm text-slate-600">{design.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Step 2: Configuration
  const renderConfigurationStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Configuración
          </h3>
          <p className="text-slate-600">
            Personaliza tu {serviceNames[serviceType]}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Esquema de colores
            </label>
            <select
              value={formData.colorScheme || ""}
              onChange={(e) => handleInputChange("colorScheme", e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent"
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent"
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
              rows={4}
              placeholder="Describe cualquier personalización especial que necesites..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6B5BCC] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    );
  };

  // Step 3: Review
  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Revisa tu pedido
          </h3>
          <p className="text-slate-600">
            Verifica que todo esté correcto antes de continuar
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 space-y-4">
          <div>
            <span className="text-sm font-medium text-slate-600">Servicio:</span>
            <p className="text-lg font-semibold text-slate-900">
              {serviceNames[serviceType]}
            </p>
          </div>
          {formData.design && (
            <div>
              <span className="text-sm font-medium text-slate-600">Diseño:</span>
              <p className="text-slate-900 capitalize">{formData.design}</p>
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
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Completa tu compra
          </h3>
          <p className="text-slate-600">
            Ingresa tus datos de contacto y selecciona el método de pago
          </p>
        </div>

        <div className="space-y-4">
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
            <div className="space-y-2">
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
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">
              {serviceNames[serviceType]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <Stepper steps={stepperSteps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-white max-w-4xl mx-auto w-full">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
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
                onClose();
              }}
              className="px-6 py-2 bg-[#6B5BCC] text-white rounded-lg font-medium hover:bg-[#5a4ab8] transition-colors cursor-pointer"
            >
              Finalizar compra
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? "bg-[#6B5BCC] text-white hover:bg-[#5a4ab8] cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continuar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
