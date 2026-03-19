import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Glomun Proyectos",
    short_name: "Proyectos",
    description: "Acceso directo al panel de proyectos de Glomun.",
    start_url: "/admin92/proyectos",
    scope: "/admin92/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#84b9ed",
    icons: [
      {
        src: "/admin92/proyectos/app-icon/192?v=proyectos-v3",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/admin92/proyectos/app-icon/512?v=proyectos-v3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

