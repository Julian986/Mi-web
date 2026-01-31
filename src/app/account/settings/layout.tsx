import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración | Mi cuenta | Glomun",
  description:
    "Idioma, tema y otras preferencias de tu cuenta Glomun.",
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
