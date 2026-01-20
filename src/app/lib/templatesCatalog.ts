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
      tags: ["placeholder", prefix],
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
  ]),
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

