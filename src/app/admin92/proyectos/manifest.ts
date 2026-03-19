import type { MetadataRoute } from "next";

const PADDED_ICON_192 =
  "https://res.cloudinary.com/dzoupwn0e/image/upload/w_192,h_192,c_pad,b_transparent,f_png,q_auto/v1768140895/gotita_loca_iskndh.webp?app=proyectos-v2";
const PADDED_ICON_512 =
  "https://res.cloudinary.com/dzoupwn0e/image/upload/w_512,h_512,c_pad,b_transparent,f_png,q_auto/v1768140895/gotita_loca_iskndh.webp?app=proyectos-v2";

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
        src: PADDED_ICON_192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: PADDED_ICON_512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

