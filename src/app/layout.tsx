import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Renderiza con fallback inmediatamente, luego intercambia
  preload: true,
  adjustFontFallback: true, // Ajusta métricas de fallback para evitar layout shift
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"], // Fuentes del sistema como fallback inmediato
  weight: ["400", "500", "600", "700"], // Solo cargar pesos necesarios
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Mono no es crítico
});

export const metadata: Metadata = {
  title: "Glomun",
  description: "Glomun es una empresa de desarrollo de software en Argentina especializada en sitios web, tiendas online y aplicaciones a medida de alto rendimiento.",
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp",
        type: "image/webp",
      },
    ],
    apple: [
      {
        url: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp",
        type: "image/webp",
      },
    ],
  },
  other: {
    // Preload crítico para mejorar LCP
    "dns-prefetch": "https://fonts.googleapis.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
