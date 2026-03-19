import type { Metadata } from "next";

const PADDED_ICON_192 =
  "https://res.cloudinary.com/dzoupwn0e/image/upload/w_192,h_192,c_pad,b_transparent,f_png,q_auto/v1768140895/gotita_loca_iskndh.webp?app=proyectos-v2";
const PADDED_ICON_512 =
  "https://res.cloudinary.com/dzoupwn0e/image/upload/w_512,h_512,c_pad,b_transparent,f_png,q_auto/v1768140895/gotita_loca_iskndh.webp?app=proyectos-v2";

export const metadata: Metadata = {
  manifest: "/admin92/proyectos/manifest.webmanifest",
  icons: {
    icon: [{ url: PADDED_ICON_192, type: "image/png" }],
    apple: [{ url: PADDED_ICON_192, type: "image/png" }],
    shortcut: [{ url: PADDED_ICON_192, type: "image/png" }],
  },
};

export default function ProyectosLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

