import type { Metadata } from "next";

const LOCAL_ICON_192 = "/admin92/proyectos/app-icon/192?v=proyectos-v3";
const LOCAL_ICON_512 = "/admin92/proyectos/app-icon/512?v=proyectos-v3";

export const metadata: Metadata = {
  manifest: "/manifest-proyectos.webmanifest",
  icons: {
    icon: [{ url: LOCAL_ICON_192, type: "image/png" }],
    apple: [{ url: LOCAL_ICON_192, type: "image/png" }],
    shortcut: [{ url: LOCAL_ICON_192, type: "image/png" }],
    other: [{ rel: "mask-icon", url: LOCAL_ICON_512 }],
  },
};

export default function ProyectosLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

