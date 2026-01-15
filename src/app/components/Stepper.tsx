"use client";

import React from "react";
import { Check } from "lucide-react";

type StepStatus = "completed" | "active" | "inactive";

type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

type StepperProps = {
  steps: Step[];
  activeColor?: string;
};

export default function Stepper({ steps, activeColor = "#000000" }: StepperProps) {
  const arrowSize = 20; // Tamaño de la flecha más alargada

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-100 rounded-lg p-4">
        {/* Contenedor con borde continuo superior e inferior */}
        <div className="relative flex items-center gap-0 border-t border-b border-slate-300 rounded-lg" style={{ height: "56px" }}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isFirst = index === 0;

            // Colores según el estado - paleta blanco/negro/gris
            const getStepStyles = () => {
              if (step.status === "completed") {
                return {
                  bg: "#000000", // Negro
                  text: "#ffffff", // Blanco
                  border: "#000000", // Negro
                  circleBg: "#000000",
                  circleText: "#ffffff",
                };
              } else if (step.status === "active") {
                return {
                  bg: "#ffffff", // Blanco
                  text: "#000000", // Negro
                  border: "#000000", // Negro
                  circleBg: "transparent",
                  circleText: "#000000",
                  circleBorder: "#000000",
                };
              } else {
                return {
                  bg: "#f1f5f9", // Gris muy claro (slate-100)
                  text: "#64748b", // Gris medio (slate-500)
                  border: "#cbd5e1", // Gris claro (slate-300)
                  circleBg: "transparent",
                  circleText: "#64748b",
                  circleBorder: "#cbd5e1", // Gris claro (slate-300)
                };
              }
            };

            const styles = getStepStyles();

            // Clip-path para crear la forma de flecha perfectamente encastrada
            const getClipPath = () => {
              if (isFirst && !isLast) {
                // Primer paso: redondeado izquierda, flecha derecha alargada
                return `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%)`;
              } else if (!isFirst && !isLast) {
                // Pasos intermedios: recorte izquierdo (para recibir flecha) y flecha derecha alargada
                return `polygon(${arrowSize}px 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, ${arrowSize}px 100%)`;
              } else if (!isFirst && isLast) {
                // Último paso: solo recorte izquierdo (para recibir flecha), redondeado derecha
                return `polygon(${arrowSize}px 0, 100% 0, 100% 100%, ${arrowSize}px 100%)`;
              } else {
                // Solo un paso: completamente redondeado
                return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
              }
            };

            const clipPathValue = getClipPath();

            return (
              <div
                key={step.id}
                className="relative flex items-center flex-1"
                style={{
                  marginLeft: !isFirst ? `-${arrowSize}px` : "0",
                  zIndex: steps.length - index,
                  height: "56px",
                }}
              >
                {/* Contenedor con clip-path, borde y fondo */}
                <div
                  className="absolute inset-0"
                  style={{
                    border: `1px solid ${styles.border}`,
                    backgroundColor: styles.bg,
                    clipPath: clipPathValue,
                    WebkitClipPath: clipPathValue,
                  }}
                />
                
                {/* Contenedor interno con contenido */}
                <div
                  className="relative w-full h-full flex items-center z-10"
                  style={{
                    height: "56px",
                    paddingLeft: isFirst ? "16px" : `${arrowSize + 12}px`,
                    paddingRight: isLast ? "16px" : `${arrowSize + 12}px`,
                    clipPath: clipPathValue,
                    WebkitClipPath: clipPathValue,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Indicator */}
                    <div className="flex-shrink-0">
                      {step.status === "completed" ? (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: styles.circleBg }}
                        >
                          <Check className="h-5 w-5" style={{ color: styles.circleText }} />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: styles.circleBorder,
                            backgroundColor: styles.circleBg,
                          }}
                        >
                          <span
                            className="text-sm font-semibold"
                            style={{ color: styles.circleText }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm ${
                        step.status === "completed" ? "font-bold" : "font-medium"
                      }`}
                      style={{ color: styles.text }}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
