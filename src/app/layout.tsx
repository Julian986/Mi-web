import type { Metadata } from "next";
import Script from "next/script";
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

// Imagen Open Graph: 1200x630 PNG para vista previa nítida en Facebook/Messenger (evita pixelado)
const OG_IMAGE_URL =
  "https://res.cloudinary.com/dzoupwn0e/image/upload/w_1200,h_630,c_fit,f_png/v1768140895/gotita_loca_iskndh.webp";

const SITE_URL = "https://glomun.com";

export const metadata: Metadata = {
  title: "Glomun",
  description:
    "Glomun es una empresa de desarrollo de software en Argentina especializada en sitios web, tiendas online y aplicaciones a medida de alto rendimiento.",
  metadataBase: new URL(SITE_URL),
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
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "Glomun",
    title: "Glomun",
    description:
      "Glomun es una empresa de desarrollo de software en Argentina especializada en sitios web, tiendas online y aplicaciones a medida de alto rendimiento.",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Glomun - Desarrollo de software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glomun",
    description:
      "Glomun es una empresa de desarrollo de software en Argentina especializada en sitios web, tiendas online y aplicaciones a medida de alto rendimiento.",
    images: [OG_IMAGE_URL],
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Google Analytics 4 - Glomun */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1MMSD9D0BN"
          strategy="afterInteractive"
        />
        <Script id="ga4-glomun" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1MMSD9D0BN');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
