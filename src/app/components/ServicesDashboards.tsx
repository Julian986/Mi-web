"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, User } from "lucide-react";

type ServiceType = "web" | "ecommerce" | "custom";

type Service = {
  id: ServiceType;
  name: string;
  description: string;
  features: string[];
  ctaLabel: string;
  featured: boolean;
  price?: {
    ars: string;
    usd: string;
  };
};

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function ServicesDashboards() {
  const router = useRouter();

  const services = useMemo<Service[]>(
    () => [
      {
        id: "web",
        name: "Sitio web",
        description: "Más consultas con un sitio rápido y claro",
        features: [
          "Diseño que guía al cliente a contactarte",
          "SEO técnico y performance reales",
          "Medición y mejoras iterativas",
          "Dominio incluido",
          "Hosting incluido",
          "Certificado SSL",
          "Cuenta premium",
          "Versión para computadora y celular",
          "Soporte 24/7",
          "Cambios ilimitados",
        ],
        ctaLabel: "Quiero una web",
        featured: false,
        price: {
          ars: "$25.000",
          usd: "$21",
        },
      },
      {
        id: "ecommerce",
        name: "Tienda Online",
        description: "Vendé más con un checkout sin fricción",
        features: [
          "Checkout optimizado para convertir",
          "Pagos e integraciones listos",
          "Panel de pedidos, stock y envíos",
          "Dominio incluido",
          "Hosting incluido",
          "Certificado SSL",
          "Cuenta premium",
          "Versión para computadora y celular",
          "Soporte 24/7",
          "Cambios ilimitados",
        ],
        ctaLabel: "Quiero una tienda",
        featured: true,
        price: {
          ars: "$35.000",
          usd: "$29",
        },
      },
      {
        id: "custom",
        name: "Aplicación a medida",
        description: "Automatizá procesos y ganá control operativo",
        features: [
          "Dashboards y permisos por rol",
          "Integraciones con tus sistemas",
          "Workflows que ahorran horas cada semana",
          "Hosting incluido",
          "Certificado SSL",
          "Cuenta premium",
          "Versión para computadora y celular",
          "Soporte 24/7",
          "Cambios ilimitados",
        ],
        ctaLabel: "Quiero una aplicación a medida",
        featured: false,
        price: {
          ars: "Consultar",
          usd: "Consultar",
        },
      },
    ],
    []
  );

  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8 overflow-x-hidden">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-slate-600">Servicios</h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-slate-900 sm:text-6xl">
          Elegí el servicio que necesitás
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-slate-600 sm:text-xl leading-8">
        Soluciones diseñadas para hacer crecer tu negocio, desde sitios web hasta software personalizado.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-5xl lg:grid-cols-3 w-full">
        {services.map((service, serviceIdx) => (
          <div
            key={service.id}
            className={classNames(
              service.featured ? "relative bg-slate-900" : "bg-white sm:mx-8 lg:mx-0",
              service.featured
                ? ""
                : serviceIdx === 0
                  ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl lg:rounded-br-none"
                  : serviceIdx === 2
                    ? "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none lg:rounded-br-3xl"
                    : "sm:rounded-t-none lg:rounded-none",
              "rounded-3xl p-8 ring-1 ring-black/10 sm:p-10"
            )}
          >
            <h3
              id={service.id}
              className={classNames(
                service.featured ? "text-white" : "text-slate-900",
                "text-base font-semibold leading-7"
              )}
            >
              {service.name}
            </h3>
            {service.price && (
              <div className="mt-4">
                <div className={classNames(
                  service.featured ? "text-white" : "text-slate-900",
                  "text-3xl font-bold"
                )}>
                  {service.price.ars} {service.price.ars !== "Consultar" && "ARS"}
                </div>
                <div className={classNames(
                  service.featured ? "text-slate-400" : "text-slate-500",
                  "text-sm mt-1"
                )}>
                  {service.price.usd} {service.price.usd !== "Consultar" && "USD / mes"}
                </div>
              </div>
            )}
            <p
              className={classNames(
                service.featured ? "text-slate-300" : "text-slate-600",
                "mt-6 text-base leading-7"
              )}
            >
              {service.description}
            </p>
            <ul
              role="list"
              className={classNames(
                service.featured ? "text-slate-300" : "text-slate-600",
                "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
              )}
            >
              {service.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  {feature === "Certificado SSL" ? (
                    <ShieldCheck
                      aria-hidden="true"
                      className={classNames(
                        service.featured ? "text-white" : "text-slate-900",
                        "h-5 w-5 flex-none"
                      )}
                    />
                  ) : feature === "Cuenta premium" ? (
                    <User
                      aria-hidden="true"
                      className={classNames(
                        service.featured ? "text-white" : "text-slate-900",
                        "h-5 w-5 flex-none"
                      )}
                    />
                  ) : (
                    <Check
                      aria-hidden="true"
                      className={classNames(
                        service.featured ? "text-white" : "text-slate-900",
                        "h-5 w-5 flex-none"
                      )}
                    />
                  )}
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push(`/services/${service.id}`)}
              aria-describedby={service.id}
              className={classNames(
                service.featured
                  ? "bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-white"
                  : "bg-slate-900 text-white ring-1 ring-inset ring-black/10 hover:bg-slate-800 focus-visible:outline-slate-900",
                "mt-8 w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 cursor-pointer"
              )}
            >
              {service.ctaLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
