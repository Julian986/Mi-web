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
    "Capital Prime",
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
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1770038121/home_6_lx5ykv_1_bqwxmk.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1770038121/home_6_lx5ykv_1_bqwxmk.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1770038132/aboutus_3_ijmzzr_1_isn4lx.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1770038131/trabajos_dczzn1_1_tsxv2v.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1770038131/servicios_icvmdz_1_zrmwat.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1770038131/testimonios_y9hmcf_1_ncqzrs.webp",
      ],
    };
  }).map((t) => {
    // web-06: reemplazo real de imágenes (sexto diseño)
    if (t.id !== "web-06") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769009129/home_7_z1ozoo.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769009129/home_7_z1ozoo.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769009129/about_z4b9cn.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769009129/servicios_2_atfimv.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769009129/precios_q5j5a6.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769009129/footer_2_hwmmfk.webp",
      ],
    };
  }).map((t) => {
    // web-07: reemplazo real de imágenes (séptimo diseño)
    if (t.id !== "web-07") return t;
    return {
      ...t,
      title: "Portafolio Personal",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769010208/home_8_wjpryr.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769010208/home_8_wjpryr.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769010208/about_2_pub2gx.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769010207/educacion_x5vgzi.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769010207/trabajos_2_z4kp14.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769010208/testimonios_2_m0oano.webp",
      ],
    };
  }).map((t) => {
    // web-08: reemplazo real de imágenes (octavo diseño - restaurante)
    if (t.id !== "web-08") return t;
    return {
      ...t,
      title: "Restaurante",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769011060/Captura_de_pantalla_458_zgcwxm.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769011060/Captura_de_pantalla_458_zgcwxm.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769011061/Captura_de_pantalla_459_utnkeu.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769011060/Captura_de_pantalla_461_ejm92w.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769011060/Captura_de_pantalla_460_wjvyte.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769011060/Captura_de_pantalla_462_sw48ds.webp",
      ],
    };
  }).map((t) => {
    // web-09: reemplazo real de imágenes (noveno diseño)
    if (t.id !== "web-09") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012099/Home_9_tuphte.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012099/Home_9_tuphte.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012100/about_3_y8aauc.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012100/servicios_3_wjkwtu.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012099/Trabajos_3_ezcsps.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012100/testimonios_3_we2tih.webp",
      ],
    };
  }).map((t) => {
    // web-10: reemplazo real de imágenes (décimo diseño)
    if (t.id !== "web-10") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012965/home_10_bhwkoq.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012965/home_10_bhwkoq.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012965/about_4_owmwkq.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012964/servicios_4_fstgec.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012964/trabajadores_tqeax8.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769012965/footer_4_vwamda.webp",
      ],
    };
  }).map((t) => {
    // web-11: reemplazo real de imágenes (onceavo diseño - salud)
    if (t.id !== "web-11") return t;
    return {
      ...t,
      title: "Salud",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769013879/home_11_jyns74.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769013879/home_11_jyns74.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769013880/servicios_5_zvhx9j.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769013879/team_cweski.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769013880/contacto_2_io45u8.webp",
      ],
    };
  }).map((t) => {
    // web-12: reemplazo real de imágenes (doceavo diseño - salud mental)
    if (t.id !== "web-12") return t;
    return {
      ...t,
      title: "Salud mental",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769085713/home_12_ggt098.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769085713/home_12_ggt098.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769085712/testimonials_2_qlkns4.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769085713/faq_2_hgg1bo.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769085712/footer_3_xqnhn2.webp",
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
  ]).map((t) => {
    // ecommerce-01: reemplazo real de imágenes (primer diseño)
    if (t.id !== "ecommerce-01") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769086689/home_13_wjmh82.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769086689/home_13_wjmh82.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769086689/productos_p2pqrf.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769086688/productos2_srzbld.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769086688/testimonios_4_nmxgmy.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769086689/footer_5_yhiy3e.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-02: reemplazo real de imágenes (segundo diseño)
    if (t.id !== "ecommerce-02") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769087788/home_14_pbo2ta.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769087788/home_14_pbo2ta.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769087788/productos_2_rj7gff.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769087853/historia_mzsfc9.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769087788/servicios_6_drmhgb.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769087787/testimonios_5_ijtq3z.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-03: reemplazo real de imágenes (tercer diseño)
    if (t.id !== "ecommerce-03") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769088885/home_15_pmcdyn.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769088885/home_15_pmcdyn.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769088885/productos_3_x572ge.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769088885/por_que_elegirnos_xyxojk.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769088884/testimonios_6_txokxk.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769088885/contacto_3_dd2vzw.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-04: reemplazo real de imágenes (cuarto diseño)
    if (t.id !== "ecommerce-04") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769089692/home_16_gsevii.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769089692/home_16_gsevii.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769089691/productos_4_ltclzw.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769089692/por_que_elegirnos_2_rrmbra.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769089691/footer_6_kdoprt.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-05: reemplazo real de imágenes (quinto diseño)
    if (t.id !== "ecommerce-05") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769090297/home_17_hzknzy.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769090297/home_17_hzknzy.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769090297/productos_5_jvchle.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769090298/productos2_2_iotvsk.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769090298/productDetail_cvqban.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769090298/productos3_g8sdil.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-06: reemplazo real de imágenes (sexto diseño)
    if (t.id !== "ecommerce-06") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769093007/home_18_li4tj1.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769093007/home_18_li4tj1.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769093007/productos_6_u056oh.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769093008/servicios_7_mwsx8n.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769093008/blog_sreq9v.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769093007/footer_7_lfeqvd.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-07: reemplazo real de imágenes (séptimo diseño)
    if (t.id !== "ecommerce-07") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769122140/home_19_fqjnhs.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769122140/home_19_fqjnhs.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769122142/productos_7_l1ci3f.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769122140/historia_2_ggublu.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769122139/marcas_lokhx4.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769122139/footer_8_rmzabj.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-08: reemplazo real de imágenes (octavo diseño - electronic devices)
    if (t.id !== "ecommerce-08") return t;
    return {
      ...t,
      title: "Electronic devices",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769185752/home_20_pnvpyc.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769185752/home_20_pnvpyc.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769185752/categorias_q5ep92.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769185752/productos_8_j6cyv4.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769185752/servicios_8_ikuy4z.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769185752/footer_9_uiznzn.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-09: reemplazo real de imágenes (noveno diseño)
    if (t.id !== "ecommerce-09") return t;
    return {
      ...t,
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769189499/home_21_cjmriz.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769189499/home_21_cjmriz.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769189499/about_5_a3ex4x.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769189500/productos_9_cbv1m4.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769189499/contact_2_wgcueh.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769189499/footer_10_ymspdr.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-10: reemplazo real de imágenes (décimo diseño - perfumería)
    if (t.id !== "ecommerce-10") return t;
    return {
      ...t,
      title: "Perfumería",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769256037/home_22_yrrahi.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769256037/home_22_yrrahi.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769256038/categorias_2_gkysun.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769256034/productos_10_dtgqpn.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769256036/blog_2_eyiali.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769256034/footer_11_b7o0b2.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-11: reemplazo real de imágenes (onceavo diseño - home & deco)
    if (t.id !== "ecommerce-11") return t;
    return {
      ...t,
      title: "Home & Deco",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769259707/home_23_k9yqvg.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769259707/home_23_k9yqvg.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769259707/categorias_3_tzegv9.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769259707/productos_11_ak67oj.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769259707/testimonios_7_tk16hd.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769259707/footer_12_dbzjl9.webp",
      ],
    };
  }).map((t) => {
    // ecommerce-12: reemplazo real de imágenes (doceavo diseño - auriculares)
    if (t.id !== "ecommerce-12") return t;
    return {
      ...t,
      title: "Auriculares",
      tags: [],
      thumb: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769260705/home_24_xybttc.webp",
      gallery: [
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769260705/home_24_xybttc.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769260705/productos2_3_mvnv9v.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769260704/productDetail_2_zgeckh.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769260704/productos_12_hwdebo.webp",
        "https://res.cloudinary.com/dzoupwn0e/image/upload/v1769260705/footer_13_f4i6rj.webp",
      ],
    };
  }),
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

