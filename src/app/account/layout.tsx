import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi cuenta | Glomun",
  description:
    "Gestioná tu suscripción Glomun: plan, mensualidad, próximos cobros, preferencias y accesos rápidos a soporte, dominio y Analytics.",
};

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
