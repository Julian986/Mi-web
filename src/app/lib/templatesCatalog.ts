export type ServiceType = "web" | "ecommerce" | "custom";

export type TemplateCatalogItem = {
  id: string;
  title: string;
  tags: string[];
  thumb: string;
  gallery: string[];
};

const PLACEHOLDER_THUMB = "/amo-mi-casa.png";
const PLACEHOLDER_GALLERY = [
  "/amo-mi-casa.png",
  "/amo-mi-casa.png",
  "/amo-mi-casa.png",
  "/amo-mi-casa.png",
];

function makeTemplates(prefix: string, titles: string[]): TemplateCatalogItem[] {
  return titles.map((title, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    return {
      id: `${prefix}-${n}`,
      title,
      // Tags de ejemplo (vacíos por defecto). Luego podés poner tags reales tipo: "minimal", "corporativo", etc.
      tags: [],
      thumb: PLACEHOLDER_THUMB,
      gallery: PLACEHOLDER_GALLERY,
    };
  });
}

export const TEMPLATE_CATALOG: Record<ServiceType, TemplateCatalogItem[]> = {
  web: makeTemplates("web", [
    "Minimal Clean",
    "Modern Studio",
    "Bold Agency",
    "Corporate Pro",
    "Portfolio Light",
    "Restaurant Warm",
    "Real Estate",
    "Medical Care",
    "Creative Dark",
    "Landing SaaS",
    "Consulting",
    "Event Promo",
  ]).map((t) => {
    // web-01: reemplazo real de imágenes (primer diseño)
    if (t.id !== "web-01") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768918872/home_2_twtrzo.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768918872/home_2_twtrzo.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768918872/services_vdyexs.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768918873/projects_xejhdd.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768918872/pricings_dowihp.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768918872/contact_ld5gje.webp",
      ],
    };
  }).map((t) => {
    // web-02: reemplazo real de imágenes (segundo diseño)
    if (t.id !== "web-02") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768924161/home_3_cy7tsn.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768924161/home_3_cy7tsn.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768924161/about_us_kwalmw.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768924161/services_2_zd3l1d.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768924161/prices_ajxnvj.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768924164/testimonials_jojmvg.webp",
      ],
    };
  }).map((t) => {
    // web-03: reemplazo real de imágenes (tercer diseño)
    if (t.id !== "web-03") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768927788/home_4_nxnlfj.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768927788/home_4_nxnlfj.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768927788/aboutus_cufkpe.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768927788/services_3_sgoukv.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768927788/preguntas_frecuentes_e74rqs.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768927788/contacto_mxnxla.webp",
      ],
    };
  }).map((t) => {
    // web-04: reemplazo real de imágenes (cuarto diseño)
    if (t.id !== "web-04") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768928537/home_5_gcdvca.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768928537/home_5_gcdvca.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768928537/aboutus_2_otfcgj.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768928538/habilidades_qk6sxs.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768928537/faq_q7xlhl.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768928538/footer_pmtyks.webp",
      ],
    };
  }).map((t) => {
    // web-05: reemplazo real de imágenes (quinto diseño)
    if (t.id !== "web-05") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768929273/home_6_lx5ykv.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768929273/home_6_lx5ykv.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768929272/aboutus_3_ijmzzr.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768929272/trabajos_dczzn1.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768929275/servicios_icvmdz.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768929274/testimonios_y9hmcf.webp",
      ],
    };
  }),
  ecommerce: makeTemplates("ecommerce", [
    "Fashion Store",
    "Electronics Shop",
    "Beauty & Care",
    "Home Decor",
    "Sports Gear",
    "Food Market",
    "Kids Store",
    "Pet Shop",
    "Jewelry",
    "Minimal Commerce",
    "Premium Brand",
    "Marketplace",
  ]),
  custom: makeTemplates("custom", [
    "Dashboard Minimal",
    "Admin Classic",
    "Analytics Pro",
    "CRM Light",
    "Operations",
    "FinTech",
    "Logistics",
    "HR Suite",
    "Support Desk",
    "Project Manager",
    "Inventory",
    "Scheduling",
  ]),
};

export function getTemplatesForServiceType(serviceType: ServiceType): TemplateCatalogItem[] {
  return TEMPLATE_CATALOG[serviceType] ?? [];
}

export function getTemplateById(
  serviceType: ServiceType,
  templateId: string
): TemplateCatalogItem | null {
  const list = getTemplatesForServiceType(serviceType);
  return list.find((t) => t.id === templateId) ?? null;
}

