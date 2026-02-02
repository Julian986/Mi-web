"use client";

import Image from "next/image";
import { ReactNode } from "react";

type Brand = {
  id: string;
  name: string;
  logoSvg?: ReactNode; // SVG inline (preferido)
  logo?: string; // URL de la imagen del logo (alternativa)
  url?: string; // URL opcional para hacer la marca clickeable
};

// Datos de marcas
const brandsData: Brand[] = [
  {
    id: "brand-google",
    name: "Google",
    url: "https://google.com",
    logoSvg: (
      <svg role="img" viewBox="0 0 24 24" className="w-8 h-8" aria-label="Google logo" fill="currentColor">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
  },
  {
    id: "brand-cursor",
    name: "Cursor",
    url: "https://cursor.com",
    logo: "/brands/cursor.svg",
  },
  {
    id: "brand-vercel",
    name: "Vercel",
    url: "https://vercel.com",
    logo: "/brands/vercel.svg",
  },
  {
    id: "brand-cloudflare",
    name: "Cloudflare",
    url: "https://cloudflare.com",
    logo: "/brands/cloudflare.svg",
  },
  {
    id: "brand-cloudinary",
    name: "Cloudinary",
    url: "https://cloudinary.com",
    logo: "/brands/cloudinary.svg",
  },
  {
    id: "brand-resend",
    name: "Resend",
    url: "https://resend.com",
    logo: "/brands/resend.svg",
  },
  {
    id: "brand-tailwindcss",
    name: "Tailwind CSS",
    url: "https://tailwindcss.com",
    logo: "/brands/tailwindcss.svg",
  },
  {
    id: "brand-mercadopago",
    name: "Mercado Pago",
    url: "https://mercadopago.com",
    logo: "/brands/mercadopago.svg",
  },
  {
    id: "brand-mongodb",
    name: "MongoDB",
    url: "https://mongodb.com",
    logo: "/brands/mongodb.svg",
  },
  {
    id: "brand-render",
    name: "Render",
    url: "https://render.com",
    logo: "/brands/render.svg",
  },
  {
    id: "brand-github",
    name: "GitHub",
    url: "https://github.com",
    logo: "/brands/github.svg",
  },
  {
    id: "brand-notion",
    name: "Notion",
    url: "https://notion.so",
    logo: "/brands/notion.svg",
  },
  {
    id: "brand-auth0",
    name: "Auth0",
    url: "https://auth0.com",
    logo: "/brands/auth0.svg",
  },
  {
    id: "brand-supabase",
    name: "Supabase",
    url: "https://supabase.com",
    logo: "/brands/supabase.svg",
  },
  {
    id: "brand-v0",
    name: "v0",
    url: "https://v0.dev",
    logo: "/brands/v0.svg",
  },
  {
    id: "brand-javascript",
    name: "JavaScript",
    url: "https://javascript.com",
    logo: "/brands/javascript.svg",
  },
  {
    id: "brand-postgresql",
    name: "PostgreSQL",
    url: "https://postgresql.org",
    logo: "/brands/postgresql.svg",
  },
  {
    id: "brand-python",
    name: "Python",
    url: "https://python.org",
    logo: "/brands/python.svg",
  },
  {
    id: "brand-icloud",
    name: "iCloud",
    url: "https://icloud.com",
    logo: "/brands/icloud.svg",
  },
  {
    id: "brand-gumroad",
    name: "Gumroad",
    url: "https://gumroad.com",
    logo: "/brands/gumroad.svg",
  },
  {
    id: "brand-platzi",
    name: "Platzi",
    url: "https://platzi.com",
    logo: "/brands/platzi.svg",
  },
  {
    id: "brand-railway",
    name: "Railway",
    url: "https://railway.app",
    logo: "/brands/railway.svg",
  },
  {
    id: "brand-speedtest",
    name: "Speedtest",
    url: "https://speedtest.net",
    logo: "/brands/speedtest.svg",
  },
  {
    id: "brand-git",
    name: "Git",
    url: "https://git-scm.com",
    logo: "/brands/git.svg",
  },
  {
    id: "brand-mariadb",
    name: "MariaDB",
    url: "https://mariadb.org",
    logo: "/brands/mariadb.svg",
  },
  {
    id: "brand-bootstrap",
    name: "Bootstrap",
    url: "https://getbootstrap.com",
    logo: "/brands/bootstrap.svg",
  },
  {
    id: "brand-claude",
    name: "Claude",
    url: "https://claude.ai",
    logo: "/brands/claude.svg",
  },
  {
    id: "brand-stripe",
    name: "Stripe",
    url: "https://stripe.com",
    logo: "/brands/stripe.svg",
  },
];

export default function Brands() {
  return (
    <section id="brands" className="border-t border-black/10 py-16 overflow-x-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Infraestructura</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Tecnología profesional, segura y escalable
          </p>
        </div>

        {/* Grid de marcas: 4 columnas en desktop, 2 en mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-200 rounded-lg overflow-hidden divide-x divide-y divide-slate-200">
          {brandsData.map((brand) => {
            const isHorizontal = 
              brand.id === "brand-cursor" || 
              brand.id === "brand-google" || 
              brand.id === "brand-vercel" ||
              brand.id === "brand-cloudflare" ||
              brand.id === "brand-cloudinary" ||
              brand.id === "brand-resend" ||
              brand.id === "brand-tailwindcss" ||
              brand.id === "brand-mercadopago" ||
              brand.id === "brand-mongodb" ||
              brand.id === "brand-render" ||
              brand.id === "brand-github" ||
              brand.id === "brand-notion" ||
              brand.id === "brand-auth0" ||
              brand.id === "brand-supabase" ||
              brand.id === "brand-v0" ||
              brand.id === "brand-javascript" ||
              brand.id === "brand-postgresql" ||
              brand.id === "brand-python" ||
              brand.id === "brand-icloud" ||
              brand.id === "brand-gumroad" ||
              brand.id === "brand-platzi" ||
              brand.id === "brand-railway" ||
              brand.id === "brand-speedtest" ||
              brand.id === "brand-git" ||
              brand.id === "brand-mariadb" ||
              brand.id === "brand-bootstrap" ||
              brand.id === "brand-claude" ||
              brand.id === "brand-stripe";
            
            const BrandContent = isHorizontal ? (
              <div className="flex items-center justify-center gap-3 text-slate-900">
                {brand.logoSvg ? (
                  <div className="flex items-center justify-center">
                    {brand.logoSvg}
                  </div>
                ) : brand.logo ? (
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                ) : null}
                <p className="text-base font-semibold text-slate-900">{brand.name}</p>
              </div>
            ) : (
              <>
                <div className="w-full max-w-[200px] h-[60px] mb-3 flex items-center justify-center text-slate-900">
                  {brand.logoSvg ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {brand.logoSvg}
                    </div>
                  ) : brand.logo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-slate-900 text-center">{brand.name}</p>
              </>
            );

            if (brand.url) {
              return (
                <a
                  key={brand.id}
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-6 py-4 sm:px-8 sm:py-5 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] hover:bg-slate-50 transition-colors"
                >
                  {BrandContent}
                </a>
              );
            }

            return (
              <div
                key={brand.id}
                className="bg-white px-6 py-4 sm:px-8 sm:py-5 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] hover:bg-slate-50 transition-colors"
              >
                {BrandContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
