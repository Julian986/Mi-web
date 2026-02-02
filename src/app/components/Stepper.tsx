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

      {/* Versión Desktop - Sin flechas entre pasos */}
      <div className="hidden md:block bg-slate-100 rounded-lg p-2 sm:p-3">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const styles = getStepStyles(step);

            return (
              <React.Fragment key={step.id}>
                <div
                  className="flex-1 flex items-center rounded-lg border px-4"
                  style={{
                    borderColor: styles.border,
                    backgroundColor: styles.bg,
                    height: "56px",
                    minHeight: "56px",
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
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
