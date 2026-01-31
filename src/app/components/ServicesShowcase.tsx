"use client";

import React, { useMemo } from "react";
import { Check, ShieldCheck, User } from "lucide-react";

type Service = {
  id: "web" | "ecommerce" | "custom";
  name: string;
  description: string;
  features: string[];
  ctaLabel: string;
  featured: boolean;
};

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function ServicesShowcase() {
  const services = useMemo<Service[]>(
    () => [
      {
        id: "web",
        name: "Sitios web",
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
      },
    ],
    []
  );

  return (
    <div className="relative isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-indigo-400">Servicios</h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
          Elegí el servicio que necesitás
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-400 sm:text-xl leading-8">
        Soluciones diseñadas para hacer crecer tu negocio, desde sitios web hasta software personalizado.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-5xl lg:grid-cols-3">
        {services.map((service, serviceIdx) => (
          <div
            key={service.id}
            className={classNames(
              service.featured ? "relative bg-gray-800" : "bg-white/2.5 sm:mx-8 lg:mx-0",
              service.featured
                ? ""
                : serviceIdx === 0
                  ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl lg:rounded-br-none"
                  : serviceIdx === 2
                    ? "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none lg:rounded-br-3xl"
                    : "sm:rounded-t-none lg:rounded-none",
              "rounded-3xl p-8 ring-1 ring-white/10 sm:p-10"
            )}
          >
            <h3
              id={service.id}
              className={classNames(
                service.featured ? "text-indigo-400" : "text-indigo-400",
                "text-base font-semibold leading-7"
              )}
            >
              {service.name}
            </h3>
            <p
              className={classNames(
                service.featured ? "text-gray-300" : "text-gray-300",
                "mt-6 text-base leading-7"
              )}
            >
              {service.description}
            </p>
            <ul
              role="list"
              className={classNames(
                service.featured ? "text-gray-300" : "text-gray-300",
                "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
              )}
            >
              {service.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  {feature === "Certificado SSL" ? (
                    <ShieldCheck
                      aria-hidden="true"
                      className={classNames(
                        service.featured ? "text-indigo-400" : "text-indigo-400",
                        "h-5 w-5 flex-none"
                      )}
                    />
                  ) : feature === "Cuenta premium" ? (
                    <User
                      aria-hidden="true"
                      className={classNames(
                        service.featured ? "text-indigo-400" : "text-indigo-400",
                        "h-5 w-5 flex-none"
                      )}
                    />
                  ) : (
                    <Check
                      aria-hidden="true"
                      className={classNames(
                        service.featured ? "text-indigo-400" : "text-indigo-400",
                        "h-5 w-5 flex-none"
                      )}
                    />
                  )}
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              aria-describedby={service.id}
              className={classNames(
                service.featured
                  ? "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500"
                  : "bg-white/10 text-white ring-1 ring-inset ring-white/10 hover:bg-white/20 focus-visible:outline-white/75",
                "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
              )}
            >
              {service.ctaLabel}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
