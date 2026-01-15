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

  // Colores según el estado - paleta blanco/negro/gris
  const getStepStyles = (step: Step) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Versión Mobile - Compacta sin flechas */}
      <div className="md:hidden bg-slate-100 rounded-lg p-2">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const styles = getStepStyles(step);
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  {/* Circle Indicator */}
                  <div className="flex-shrink-0 mb-1">
                    {step.status === "completed" ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: styles.circleBg }}
                      >
                        <Check className="h-4 w-4" style={{ color: styles.circleText }} />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: styles.circleBorder,
                          backgroundColor: styles.circleBg,
                        }}
                      >
                        <span
                          className="text-xs font-semibold"
                          style={{ color: styles.circleText }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Label - Solo mostrar en mobile si hay espacio */}
                  <span
                    className={`text-[10px] sm:text-xs text-center truncate w-full ${
                      step.status === "completed" ? "font-bold" : "font-medium"
                    }`}
                    style={{ color: styles.text }}
                    title={step.label}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Conector entre pasos */}
                {!isLast && (
                  <div className="flex-shrink-0 w-4 h-0.5 mx-1" style={{ backgroundColor: styles.border }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Versión Desktop - Con flechas */}
      <div className="hidden md:block bg-slate-100 rounded-lg p-2 sm:p-3">
        <div className="relative flex items-center gap-0 border-t border-b border-slate-300 rounded-lg" style={{ height: "56px" }}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isFirst = index === 0;
            const styles = getStepStyles(step);
            const prevStep = index > 0 ? steps[index - 1] : null;
            const prevStepCompleted = prevStep?.status === "completed";
            
            // El color de la flecha izquierda debe coincidir con el color del step actual
            // Solo si el step anterior está completado, aplicamos el overlay con el color del step actual
            const arrowLeftBg = !isFirst && prevStepCompleted ? styles.bg : null;
            // Borde del pico de la flecha en gris claro para resaltar
            const arrowBorderColor = "#cbd5e1"; // Gris claro (slate-300)

            // Clip-path para crear la forma de flecha perfectamente encastrada
            // Si el step anterior está completado, extendemos el clip-path para cubrir el área triangular izquierda
            const getClipPath = () => {
              if (isFirst && !isLast) {
                // Primer paso: redondeado izquierda, flecha derecha alargada
                return `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%)`;
              } else if (!isFirst && !isLast) {
                // Pasos intermedios: si el anterior está completado, extendemos para cubrir el área triangular
                if (prevStepCompleted) {
                  return `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%)`;
                } else {
                  return `polygon(${arrowSize}px 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, ${arrowSize}px 100%)`;
                }
              } else if (!isFirst && isLast) {
                // Último paso: si el anterior está completado, extendemos para cubrir el área triangular
                if (prevStepCompleted) {
                  return `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
                } else {
                  return `polygon(${arrowSize}px 0, 100% 0, 100% 100%, ${arrowSize}px 100%)`;
                }
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
                  marginLeft: !isFirst && !prevStepCompleted ? `-${arrowSize}px` : (!isFirst ? `-${arrowSize}px` : "0"),
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
                
                
                {/* Borde del pico de la flecha izquierda en gris claro */}
                {!isFirst && (
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${arrowSize}px`,
                      borderLeft: `1px solid ${arrowBorderColor}`,
                      clipPath: `polygon(100% 0, 0 50%, 100% 100%)`,
                      WebkitClipPath: `polygon(100% 0, 0 50%, 100% 100%)`,
                      zIndex: 3,
                      pointerEvents: "none",
                    }}
                  />
                )}
                
                {/* Borde del pico de la flecha derecha en gris claro */}
                {!isLast && (
                  <div
                    className="absolute"
                    style={{
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${arrowSize}px`,
                      borderRight: `1px solid ${arrowBorderColor}`,
                      clipPath: `polygon(0 0, 100% 50%, 0 100%)`,
                      WebkitClipPath: `polygon(0 0, 100% 50%, 0 100%)`,
                      zIndex: 3,
                      pointerEvents: "none",
                    }}
                  />
                )}
                
                {/* Contenedor interno con contenido */}
                <div
                  className="relative w-full h-full flex items-center z-10"
                  style={{
                    height: "56px",
                    paddingLeft: isFirst ? "16px" : (prevStepCompleted ? `${arrowSize + 16}px` : `${arrowSize + 12}px`),
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
