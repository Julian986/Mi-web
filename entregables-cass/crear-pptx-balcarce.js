/**
 * Jornada Balcarce — Programa CASS
 * Guía: BLOQUES.docx (cliente)
 * Título: "Juego patológico en adolescentes: detección, intervención y derivación"
 * Público: Profesionales de salud y docentes | 60 min
 * Sin logo oficial. Estética programacass.com: azul noche + dorado.
 * Cada dato con referencia bibliográfica al pie.
 */

const PptxGenJS = require("pptxgenjs");
const path = require("path");

const C = {
  bg: "0D1B2A",
  bgAlt: "132840",
  panel: "16304C",
  panelSoft: "1B3855",
  gold: "C5A059",
  goldSoft: "E0C68A",
  text: "D3E4FB",
  textDim: "9FB4D4",
  footer: "7C90AC",
  white: "FFFFFF",
};

const F = { serif: "Georgia", sans: "Calibri" };
const W = 13.333;
const H = 7.5;
const M = 0.7;

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "CASS16x9", width: W, height: H });
pptx.layout = "CASS16x9";
pptx.author = "Programa CASS — Lic. Alejandro G. Sánchez";
pptx.company = "Programa CASS — Conductas Adictivas Sin Sustancia";
pptx.title =
  "Juego patológico en adolescentes: detección, intervención y derivación";

const DECK = [];

function newSlide(dark) {
  const s = pptx.addSlide();
  s.background = { color: dark ? C.bgAlt : C.bg };
  DECK.push(s);
  return s;
}

function goldRule(s, x, y, w) {
  s.addShape(pptx.shapes.RECTANGLE, {
    x, y, w, h: 0.022,
    fill: { color: C.gold },
    line: { color: C.gold },
  });
}

function eyebrow(s, text) {
  s.addText(String(text).toUpperCase(), {
    x: M, y: 0.38, w: W - M * 2, h: 0.28,
    fontFace: F.sans, fontSize: 11, bold: true, color: C.gold, charSpacing: 2.2,
  });
}

function title(s, text) {
  s.addText(text, {
    x: M, y: 0.68, w: W - M * 2, h: 0.72,
    fontFace: F.serif, fontSize: 28, bold: true, color: C.white,
  });
  goldRule(s, M, 1.42, 1.8);
}

function ref(s, text) {
  goldRule(s, M, 6.55, W - M * 2);
  s.addText(text, {
    x: M, y: 6.62, w: W - M * 2, h: 0.7,
    fontFace: F.sans, fontSize: 9, color: C.footer, italic: true,
  });
}

function panel(s, o) {
  s.addShape(pptx.shapes.RECTANGLE, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || C.panel },
    line: { color: o.fill || C.panel },
  });
  s.addShape(pptx.shapes.RECTANGLE, {
    x: o.x, y: o.y, w: 0.07, h: o.h,
    fill: { color: C.gold },
    line: { color: C.gold },
  });
  if (o.head) {
    s.addText(String(o.head).toUpperCase(), {
      x: o.x + 0.28, y: o.y + 0.18, w: o.w - 0.45, h: 0.35,
      fontFace: F.sans, fontSize: 11, bold: true, color: C.gold, charSpacing: 0.6,
    });
  }
  if (o.body) {
    s.addText(o.body, {
      x: o.x + 0.28, y: o.y + (o.head ? 0.55 : 0.25), w: o.w - 0.45,
      h: o.h - (o.head ? 0.75 : 0.4),
      fontFace: F.sans, fontSize: o.size || 13.5, color: C.text,
      lineSpacingMultiple: 1.15,
    });
  }
  if (o.items) {
    s.addText(
      o.items.map((t) => ({
        text: t,
        options: { bullet: { code: "2022", indent: 10 }, breakLine: true },
      })),
      {
        x: o.x + 0.28, y: o.y + (o.head ? 0.55 : 0.25), w: o.w - 0.45,
        h: o.h - (o.head ? 0.75 : 0.4),
        fontFace: F.sans, fontSize: o.size || 13, color: C.text,
        paraSpacingAfter: o.gap || 6,
      },
    );
  }
}

function quote(s, o) {
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: o.y, w: W - M * 2, h: o.h,
    fill: { color: C.panel },
    line: { color: C.panel },
  });
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: o.y, w: 0.08, h: o.h,
    fill: { color: C.gold },
    line: { color: C.gold },
  });
  s.addText(`“${o.text}”`, {
    x: M + 0.35, y: o.y + 0.2, w: W - M * 2 - 0.55, h: o.h - (o.source ? 0.55 : 0.35),
    fontFace: F.serif, fontSize: o.size || 17, italic: true, color: C.white,
    lineSpacingMultiple: 1.15,
  });
  if (o.source) {
    s.addText(o.source, {
      x: M + 0.35, y: o.y + o.h - 0.38, w: W - M * 2 - 0.55, h: 0.28,
      fontFace: F.sans, fontSize: 11, color: C.gold,
    });
  }
}

function twoColList(s, left, right, y0, h0) {
  const w = (W - M * 2 - 0.4) / 2;
  panel(s, { x: M, y: y0, w, h: h0, head: left.head, items: left.items, size: left.size || 13 });
  panel(s, {
    x: M + w + 0.4, y: y0, w, h: h0,
    head: right.head, items: right.items, size: right.size || 13, fill: C.panelSoft,
  });
}

/* ================================================================== 1 PORTADA */
{
  const s = newSlide();
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.14,
    fill: { color: C.gold }, line: { color: C.gold },
  });
  s.addText("PROGRAMA CASS", {
    x: M, y: 1.45, w: W - M * 2, h: 0.35,
    fontFace: F.sans, fontSize: 13, bold: true, color: C.gold,
    align: "center", charSpacing: 3,
  });
  s.addText("Juego patológico en adolescentes:\ndetección, intervención y derivación", {
    x: 0.9, y: 1.95, w: W - 1.8, h: 1.7,
    fontFace: F.serif, fontSize: 34, bold: true, color: C.white,
    align: "center", lineSpacingMultiple: 1.08,
  });
  goldRule(s, (W - 2.2) / 2, 3.85, 2.2);
  s.addText("Capacitación para profesionales de salud y docentes", {
    x: M, y: 4.15, w: W - M * 2, h: 0.4,
    fontFace: F.serif, fontSize: 18, color: C.text, align: "center",
  });
  s.addText("Concejo Deliberante de Balcarce  ·  martes 18 de agosto de 2026  ·  14:00 a 15:00 h", {
    x: M, y: 5.0, w: W - M * 2, h: 0.35,
    fontFace: F.sans, fontSize: 13, color: C.textDim, align: "center",
  });
  s.addText("Lic. Alejandro G. Sánchez — Director del Programa CASS", {
    x: M, y: 5.4, w: W - M * 2, h: 0.35,
    fontFace: F.sans, fontSize: 13, color: C.gold, align: "center",
  });
  s.addText("Conductas Adictivas Sin Sustancia · Mar del Plata, desde 2007 · programacass.com", {
    x: M, y: 6.55, w: W - M * 2, h: 0.3,
    fontFace: F.sans, fontSize: 11, color: C.footer, align: "center",
  });
}

/* ================================================================== 2 ENCUADRE */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 1 — Apertura y encuadre");
  title(s, "De qué vamos a hablar y de qué no");
  quote(s, {
    y: 1.75, h: 1.55, size: 17,
    text: "Hoy no vamos a hablar de si el juego es bueno o malo. Vamos a hablar de qué hacemos nosotros —como profesionales de salud y educación— cuando lo vemos aparecer en un adolescente.",
  });
  s.addText("Tres cosas para llevarse de esta hora", {
    x: M, y: 3.55, w: W - M * 2, h: 0.35,
    fontFace: F.sans, fontSize: 13, bold: true, color: C.gold,
  });
  const w = (W - M * 2 - 0.4 * 2) / 3;
  [
    ["01", "Reconocer una señal", "Qué mirar en el aula, el EOE o el consultorio."],
    ["02", "Hacer una pregunta", "Lie/Bet, DSM-5 y tamizaje según el rol."],
    ["03", "Saber a quién derivar", "Intervención breve (EM) + red local."],
  ].forEach((c, i) => {
    const x = M + i * (w + 0.4);
    panel(s, {
      x, y: 4.05, w, h: 1.9,
      head: c[0] + "  " + c[1],
      body: c[2],
      size: 14,
    });
  });
}

/* ================================================================== 3 BALCARCE */
{
  const s = newSlide();
  eyebrow(s, "Bloque 1 — Contexto local");
  title(s, "Por qué el primer detector es crítico en Balcarce");
  twoColList(
    s,
    {
      head: "La situación de Balcarce",
      items: [
        "Municipio sin recursos especializados en adicciones conductuales.",
        "El circuito de derivación pasa por Mar del Plata (~68 km).",
        "La detección temprana es el recurso más valioso que tiene la ciudad.",
      ],
    },
    {
      head: "Quiénes están en esta sala",
      items: [
        "Profesionales de salud: pediatría, salud mental, atención primaria.",
        "Docentes, equipos directivos y EOE.",
        "Quienes ven al adolescente antes de que llegue a un especialista.",
      ],
    },
    1.75,
    3.5,
  );
  s.addText(
    "Nadie tiene que diagnosticar. Todos pueden ser el adulto que se dio cuenta a tiempo.",
    {
      x: M, y: 5.55, w: W - M * 2, h: 0.55,
      fontFace: F.serif, fontSize: 16, italic: true, color: C.goldSoft, align: "center",
    },
  );
}

/* ================================================================== 4 TIMELINE 1 */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 2 — Historia y clasificación");
  title(s, "Línea de tiempo (1/2)");
  const rows = [
    ["1938", "Skinner describe la recompensa variable e intermitente — base del enganche al azar."],
    ["1980", "DSM-III: primera inclusión del juego patológico (trastorno del control de impulsos)."],
    ["1994", "DSM-IV: incorpora el juego como vía de escape de estados disfóricos."],
    ["2012", "España regula el juego online — primer marco europeo de referencia."],
    ["2013", "DSM-5: el trastorno por juego pasa al capítulo de adicciones. Primera conducta sin sustancia reconocida como adicción."],
  ];
  rows.forEach((r, i) => {
    const y = 1.7 + i * 0.85;
    s.addText(r[0], {
      x: M, y, w: 1.2, h: 0.7,
      fontFace: F.serif, fontSize: 20, bold: true, color: C.gold, valign: "middle",
    });
    s.addText(r[1], {
      x: M + 1.35, y, w: W - M * 2 - 1.35, h: 0.7,
      fontFace: F.sans, fontSize: 15, color: C.text, valign: "middle",
    });
  });
  ref(
    s,
    "Skinner, B. F. (1938). The Behavior of Organisms. Appleton-Century-Crofts.  ·  American Psychiatric Association (1980/1994/2013). DSM-III, DSM-IV, DSM-5.  ·  Ley 13/2011 de regulación del juego (España).",
  );
}

/* ================================================================== 5 TIMELINE 2 */
{
  const s = newSlide();
  eyebrow(s, "Bloque 2 — Historia y clasificación");
  title(s, "Línea de tiempo (2/2)");
  const rows = [
    ["2018", "EE.UU. habilita apuestas deportivas online. CIE-11: trastorno por juego y por videojuegos."],
    ["2022", "Qatar 2022: primer Mundial con apuestas online masivas en Argentina. Edad de consulta baja de 45+ a 15-25."],
    ["2022", "Argentina: juego online legalizado en 20 de 24 provincias. Explosión publicitaria."],
    ["2023", "Brasil: casos en el sistema público pasan de 108 a 1.200 en 5 años (+1.011%)."],
    ["Nov. 2024", "Argentina: media sanción en Diputados — Ley de Prevención de Ludopatía y Regulación de Apuestas en Línea."],
  ];
  rows.forEach((r, i) => {
    const y = 1.7 + i * 0.85;
    s.addText(r[0], {
      x: M, y, w: 1.55, h: 0.7,
      fontFace: F.serif, fontSize: 18, bold: true, color: C.gold, valign: "middle",
    });
    s.addText(r[1], {
      x: M + 1.7, y, w: W - M * 2 - 1.7, h: 0.7,
      fontFace: F.sans, fontSize: 14.5, color: C.text, valign: "middle",
    });
  });
  ref(
    s,
    "World Health Organization (2018). ICD-11.  ·  Cámara de Diputados de la Nación Argentina (2024), media sanción.  ·  Datos Brasil: sistema público de salud (SUS), 2018–2023.  ·  Reportes clínicos locales post-Qatar 2022 (prensa especializada).",
  );
}

/* ================================================================== 6 DSM-5 */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 2 — Criterios diagnósticos");
  title(s, "DSM-5 — Trastorno por Juego (312.31)");
  s.addText("Cuatro o más de los siguientes criterios en 12 meses:", {
    x: M, y: 1.6, w: W - M * 2, h: 0.35,
    fontFace: F.sans, fontSize: 14, color: C.goldSoft, italic: true,
  });
  const criterios = [
    "Necesidad de apostar cantidades crecientes para conseguir la excitación",
    "Irritabilidad al intentar reducir o abandonar el juego",
    "Esfuerzos repetidos fallidos para controlar el juego",
    "Mente ocupada en las apuestas de manera persistente",
    "Apuesta cuando siente desasosiego, ansiedad o depresión",
    "Vuelve a jugar para intentar recuperar pérdidas",
    "Miente para ocultar su implicación en el juego",
    "Ha puesto en riesgo relaciones, empleo o carrera académica",
    "Cuenta con otros para aliviar la situación financiera provocada por el juego",
  ];
  const half = Math.ceil(criterios.length / 2);
  const w = (W - M * 2 - 0.4) / 2;
  [criterios.slice(0, half), criterios.slice(half)].forEach((col, i) => {
    s.addText(
      col.map((t, idx) => ({
        text: `${i * half + idx + 1}.  ${t}`,
        options: { breakLine: true },
      })),
      {
        x: M + i * (w + 0.4), y: 2.1, w, h: 4.0,
        fontFace: F.sans, fontSize: 13.5, color: C.text, paraSpacingAfter: 10,
      },
    );
  });
  ref(s, "American Psychiatric Association (2013). DSM-5: Diagnostic and Statistical Manual of Mental Disorders (5ª ed.). Washington DC: APA.");
}

/* ================================================================== 7 ONLINE */
{
  const s = newSlide();
  eyebrow(s, "Bloque 2 — Marco conceptual");
  title(s, "Por qué el online es cualitativamente distinto");
  const items = [
    ["Anonimato", "Sin testigos sociales que frenen o detecten."],
    ["Acceso 24/7", "El casino está en el bolsillo, siempre abierto."],
    ["Alta frecuencia", "Muchos eventos de apuesta por minuto."],
    ["Dinero virtual", "Sin peso emocional del billete físico."],
    ["Entorno inmersivo", "Diseño pensado para retener."],
    ["Sin barreras físicas", "Desaparecen los frenos del juego presencial."],
  ];
  const w = (W - M * 2 - 0.35 * 2) / 3;
  items.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    panel(s, {
      x: M + col * (w + 0.35),
      y: 1.75 + row * 2.15,
      w, h: 1.95,
      head: it[0],
      body: it[1],
      size: 15,
    });
  });
  ref(
    s,
    "Griffiths, M. D., & Parke, J. (2002). “The social impact of internet gambling”. Social Science Computer Review, 20(3), 312-320.  ·  Gainsbury, S. M. (2015). Current Addiction Reports, 2(2), 185-193.",
  );
}

/* ================================================================== 8 MECANISMO */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 2 — Mecanismo neurobiológico");
  title(s, "Lo que engancha no es ganar: es no saber");
  quote(s, {
    y: 1.7, h: 1.45, size: 16,
    text: "El pico de dopamina empieza a ocurrir antes de tocar la palanca, no después. Lo que los vuelve adictos ya no es que van a comer, sino la incertidumbre de qué va a pasar.",
    source: "Santiago Bilinkis — Futuro en Construcción, T13 E10 (divulgación; fuentes académicas abajo)",
  });
  const w = (W - M * 2 - 0.4) / 2;
  panel(s, {
    x: M, y: 3.4, w, h: 2.5,
    head: "Skinner, 1938 — refuerzo intermitente",
    body: "Cuando la recompensa es variable e impredecible, la conducta se vuelve más resistente a la extinción que con recompensa fija. Es el principio de diseño de tragamonedas, slots y apps de apuestas.",
    size: 14,
  });
  panel(s, {
    x: M + w + 0.4, y: 3.4, w, h: 2.5,
    head: "Schultz, Dayan y Montague, 1997",
    body: "Las neuronas dopaminérgicas no responden al premio en sí, sino a la predicción del premio. La respuesta se dispara cuando el resultado es incierto: la anticipación pesa más que el resultado.",
    size: 14,
    fill: C.panelSoft,
  });
  ref(
    s,
    "Skinner, B. F. (1938). The Behavior of Organisms.  ·  Schultz, W., Dayan, P., & Montague, P. R. (1997). Science, 275(5306), 1593-1599.  ·  Griffiths, M. D. (1993). Journal of Gambling Studies, 9(2), 101-120.  ·  Bilinkis, S. (2024). Futuro en Construcción, T13 E10.",
  );
}

/* ================================================================== 9 DINÁMICA */
{
  const s = newSlide();
  eyebrow(s, "Bloque 3 — Dinámica 1");
  title(s, "El adolescente en riesgo");
  s.addText(
    "Voy a describir un perfil. Mientras lo hago, piensen si reconocen a alguien: un alumno, un paciente, un chico del club. No hace falta decirlo en voz alta.",
    {
      x: M, y: 1.65, w: W - M * 2, h: 0.55,
      fontFace: F.sans, fontSize: 15, color: C.textDim, italic: true,
    },
  );
  panel(s, {
    x: M, y: 2.35, w: W - M * 2, h: 3.5,
    head: "Perfil",
    items: [
      "Varón, 14–20 años.",
      "Impulsivo, baja tolerancia a la frustración, estado de ánimo disfórico o inestable.",
      "Búsqueda intensa de sensaciones, baja autoestima.",
      "Entorno familiar con escasa supervisión o antecedentes de juego.",
      "Acceso irrestricto al celular y billetera virtual.",
      "Grupo de pares que apuesta.",
    ],
    size: 15,
  });
}

/* ================================================================== 10 FACTORES */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 3 — Factores de vulnerabilidad");
  title(s, "Riesgo y protección");
  twoColList(
    s,
    {
      head: "Factores individuales",
      items: [
        "Estado de ánimo disfórico",
        "Baja tolerancia al malestar",
        "Impulsividad / búsqueda de sensaciones",
        "Baja autoestima",
        "Estilos de afrontamiento inadecuados",
        "Inestabilidad afectiva",
      ],
      size: 13.5,
    },
    {
      head: "Factores psicosociales",
      items: [
        "Características familiares desfavorables",
        "Presión del grupo de pares",
        "Acceso fácil al objeto adictivo",
        "Recompensas inmediatas disponibles",
        "Estrés crónico / vacío existencial",
      ],
      size: 13.5,
    },
    1.7,
    3.4,
  );
  s.addText(
    "Factores protectores: autoestima adecuada · vínculos con supervisión · actividades alternativas · adultos referentes · habilidades sociales.",
    {
      x: M, y: 5.35, w: W - M * 2, h: 0.7,
      fontFace: F.sans, fontSize: 14, color: C.goldSoft,
    },
  );
  ref(
    s,
    "Programa CASS (2009). Factores de vulnerabilidad a las adicciones — conferencia Lic. Alejandro G. Sánchez.  ·  Echeburúa, E., & Corral, P. (2010). Adicciones, 22(2), 91-96.  ·  Derevensky, J. L., & Gilbeau, L. (2019). Canadian Journal of Addiction, 10(1), 10-20.",
  );
}

/* ================================================================== 11 DISEÑO */
{
  const s = newSlide();
  eyebrow(s, "Bloque 3 — Entorno digital");
  title(s, "No es falta de voluntad. Es diseño.");
  s.addText(
    "El entorno digital es un factor de riesgo en sí mismo. Las plataformas maximizan retención:",
    {
      x: M, y: 1.7, w: W - M * 2, h: 0.4,
      fontFace: F.sans, fontSize: 15, color: C.text,
    },
  );
  const chips = [
    "Scroll infinito",
    "Recompensa variable",
    "Algoritmos que aprenden vulnerabilidades",
    "Notificaciones por defecto",
  ];
  chips.forEach((t, i) => {
    const w = (W - M * 2 - 0.3 * 3) / 4;
    const x = M + i * (w + 0.3);
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.35, w, h: 1.1,
      fill: { color: C.panel }, line: { color: C.gold, width: 1 }, rectRadius: 0.08,
    });
    s.addText(t, {
      x: x + 0.1, y: 2.5, w: w - 0.2, h: 0.8,
      fontFace: F.serif, fontSize: 15, color: C.white, align: "center", valign: "middle",
    });
  });
  panel(s, {
    x: M, y: 3.8, w: W - M * 2, h: 2.1,
    head: "Cerebro adolescente",
    body: "El córtex prefrontal —que regula impulsos y evalúa consecuencias a largo plazo— completa su maduración alrededor de los 25 años. El sistema de recompensa, en cambio, está hiperactivo en la adolescencia. Esa combinación genera vulnerabilidad biológica documentada. La ventana útil de detección está en la secundaria y en el club, no en el consultorio de adultos.",
    size: 14.5,
  });
  ref(
    s,
    "Bilinkis, S. (2024). Futuro en Construcción / Guía para sobrevivir al presente.  ·  Fogg, B. J. (2003). Persuasive Technology. Morgan Kaufmann.  ·  Alter, A. (2017). Irresistible. Penguin.  ·  Casey, B. J., Jones, R. M., & Hare, T. A. (2008). Annals of the NY Academy of Sciences, 1124, 111-126.  ·  Steinberg, L. (2008). Developmental Review, 28(1), 78-106.",
  );
}

/* ================================================================== 12 ESPAÑA ESTUDES */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 4 — Datos epidemiológicos · España");
  title(s, "ESTUDES 2023 — estudiantes 14 a 18 años");
  s.addText("n = 42.208  ·  fuente más rigurosa disponible en español (OEDA 2024)", {
    x: M, y: 1.6, w: W - M * 2, h: 0.3,
    fontFace: F.sans, fontSize: 13, color: C.goldSoft, italic: true,
  });
  const stats = [
    ["10,7 %", "jugó online en últimos 12 meses — máximo histórico de la serie"],
    ["14,7", "años: edad media de inicio online (14,8 presencial)"],
    ["4,0 %", "posible juego problemático (Lie/Bet) — 6,0 % en varones"],
    ["31,5 %", "de quienes juegan online gastó más de 60 € en un solo día"],
  ];
  stats.forEach((st, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const w = (W - M * 2 - 0.4) / 2;
    const x = M + col * (w + 0.4);
    const y = 2.1 + row * 1.9;
    panel(s, {
      x, y, w, h: 1.7,
      head: st[0],
      body: st[1],
      size: 15,
      fill: row === 0 ? C.panel : C.panelSoft,
    });
  });
  ref(
    s,
    "Observatorio Español de las Drogas y las Adicciones (OEDA). Informe sobre Adicciones Comportamentales y Otros Trastornos Adictivos 2024. Madrid: Ministerio de Sanidad / DGPNSD. Encuesta ESTUDES 2023.",
  );
}

/* ================================================================== 13 ESPAÑA EDADES */
{
  const s = newSlide();
  eyebrow(s, "Bloque 4 — Datos epidemiológicos · España");
  title(s, "EDADES 2024 — población 15 a 64 años");
  const w = (W - M * 2 - 0.4) / 2;
  panel(s, {
    x: M, y: 1.75, w, h: 4.1,
    head: "Magnitud",
    items: [
      "5,5 % jugó online en últimos 12 meses (hombres 8,2 % · mujeres 2,7 %).",
      "Juego online: prevalencia de juego problemático 4× superior al presencial (18,4 % vs 4,3 %).",
      "Juegos tipo III (deportivas y slots): 5× más probabilidad de juego problemático que loterías.",
      "Entre online con juego problemático: 9,7 % juega a diario.",
    ],
    size: 14,
  });
  panel(s, {
    x: M + w + 0.4, y: 1.75, w, h: 4.1,
    head: "Severidad clínica",
    items: [
      "Apuesta máxima en un día (online con trastorno): 2.606 €.",
      "Deuda media al inicio de tratamiento: 26.546 €.",
      "Admitidos a tratamiento (2022): 90,2 % hombres · edad media 38,5 · inicio 26,2.",
      "20,2 % patología dual. Consecuencias: económicas 28,1 %, familiares 26,5 %, salud 16,8 %.",
    ],
    size: 14,
    fill: C.panelSoft,
  });
  ref(
    s,
    "OEDA (2024). Informe sobre Adicciones Comportamentales… EDADES 2024 (n = 26.878) y perfil de admitidos a tratamiento 2022. Madrid: Ministerio de Sanidad.",
  );
}

/* ================================================================== 14 ARGENTINA */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 4 — Datos epidemiológicos · Argentina");
  title(s, "Qué sabemos en nuestro país");
  const stats = [
    ["60 %", "de adolescentes expuesto a plataformas de apuestas (Cruz Roja 2025, n=11.400, 16 provincias). 69 % ansiedad · 12 % endeudado."],
    ["12,5 %", "de jóvenes 15–24 apostó online (Observatorio Adicciones / Defensoría PBA)."],
    ["+250 %", "crecimiento de consultas a la Línea 141 por juego compulsivo entre 2023 y 2024 (SEDRONAR)."],
    ["23,3 %", "de universitarios apostó en el último año; 1 de cada 5 preocupado por su forma de apostar (SEDRONAR 2023)."],
  ];
  stats.forEach((st, i) => {
    const y = 1.7 + i * 1.05;
    s.addText(st[0], {
      x: M, y, w: 1.7, h: 0.9,
      fontFace: F.serif, fontSize: 26, bold: true, color: C.goldSoft, valign: "middle",
    });
    s.addText(st[1], {
      x: M + 1.9, y, w: W - M * 2 - 1.9, h: 0.9,
      fontFace: F.sans, fontSize: 14.5, color: C.text, valign: "middle",
    });
  });
  ref(
    s,
    "Cruz Roja Argentina (2025). Encuesta nacional sobre apuestas online en adolescentes.  ·  Observatorio de Adicciones y Consumos Problemáticos — Defensoría del Pueblo PBA (2024).  ·  SEDRONAR — Línea 141 y encuesta universitarios 2023.",
  );
}

/* ================================================================== 15 LATAM */
{
  const s = newSlide();
  eyebrow(s, "Bloque 4 — Latinoamérica");
  title(s, "Brasil como espejo regional");
  twoColList(
    s,
    {
      head: "El salto documentado",
      items: [
        "Casos en el SUS: de 108 a 1.200 entre 2018 y 2023 (+1.011 %).",
        "Agosto 2024: beneficiarios de Bolsa Família destinaron 3.000 millones de reales a apuestas vía PIX.",
        "Ley 14.790/2023: primer marco regulatorio integral de la región.",
      ],
      size: 14,
    },
    {
      head: "Qué implica para nosotros",
      items: [
        "La literatura latinoamericana es escasa y heterogénea.",
        "OEDA 2024 es la referencia más sólida en español para extrapolar tendencias.",
        "Patrones consistentes: vulnerabilidad masculina, inicio adolescente, comorbilidad.",
      ],
      size: 14,
    },
    1.75,
    3.8,
  );
  ref(
    s,
    "Datos Brasil: sistema público de salud (SUS) 2018–2023; Ley 14.790/2023.  ·  OEDA (2024) como referencia metodológica para habla hispana.",
  );
}

/* ================================================================== 16 SEÑALES */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 5 — Detección");
  title(s, "Señales según el ámbito");
  twoColList(
    s,
    {
      head: "Lo que ve el docente",
      items: [
        "Caída del rendimiento sin causa aparente",
        "Ausentismo o llegadas tarde recurrentes",
        "Distracción persistente con el celular",
        "Cambios de humor inexplicables",
        "Grupos que comparten resultados o códigos",
        "Pedidos de dinero a compañeros",
        "Desinterés por actividades anteriores",
      ],
      size: 13,
    },
    {
      head: "Lo que ve el profesional de salud",
      items: [
        "Alteraciones del sueño sin causa orgánica",
        "Ansiedad o irritabilidad sin causa aparente",
        "Consultas por deudas o conflictos por dinero",
        "Movimientos inusuales en cuentas (familia)",
        "Minimización o negación al preguntar",
        "La frase: “estoy por recuperar lo que perdí”",
        "Patología dual: el juego como síntoma de fondo",
      ],
      size: 13,
    },
    1.7,
    4.2,
  );
  ref(
    s,
    "Derevensky, J. L., & Gilbeau, L. (2019). Canadian Journal of Addiction, 10(1), 10-20.  ·  Echeburúa, E., & Corral, P. (2010). Adicciones, 22(2), 91-96.  ·  APA (2013). DSM-5, criterios de Trastorno por Juego.",
  );
}

/* ================================================================== 17 FRASE CLAVE */
{
  const s = newSlide();
  eyebrow(s, "Bloque 5 — Señal verbal específica");
  s.addText("“Estoy por recuperar\nlo que perdí”", {
    x: M, y: 1.8, w: W - M * 2, h: 1.8,
    fontFace: F.serif, fontSize: 40, bold: true, color: C.white, align: "center",
  });
  goldRule(s, (W - 2.2) / 2, 3.85, 2.2);
  s.addText(
    "Es la persecución de la pérdida: criterio del DSM-5. Convierte cada pérdida en una razón para seguir apostando. Un adulto sin formación clínica especializada puede reconocerla.",
    {
      x: M + 0.8, y: 4.2, w: W - M * 2 - 1.6, h: 1.4,
      fontFace: F.sans, fontSize: 16, color: C.text, align: "center",
    },
  );
  ref(
    s,
    "American Psychiatric Association (2013). DSM-5.  ·  Ladouceur, R., & Walker, M. (1996). En Trends in Cognitive and Behavioural Therapies. Wiley.",
  );
}

/* ================================================================== 18 LIE/BET */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 5 — Instrumentos");
  title(s, "Lie/Bet: dos preguntas que cualquiera puede hacer");
  s.addText(
    "Cribado ultracorto (Johnson et al., 1997). Lo usan ESTUDES en España y ESPAD en Europa. Ideal para docentes y médicos de cabecera.",
    {
      x: M, y: 1.65, w: W - M * 2, h: 0.5,
      fontFace: F.sans, fontSize: 14, color: C.textDim,
    },
  );
  const w = (W - M * 2 - 0.4) / 2;
  [
    ["01", "¿Alguna vez ha sentido la necesidad de apostar cantidades de dinero cada vez mayores?"],
    ["02", "¿Ha mentido alguna vez a personas importantes en su vida sobre cuánto juega?"],
  ].forEach((q, i) => {
    const x = M + i * (w + 0.4);
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.35, w, h: 2.2,
      fill: { color: C.panel }, line: { color: C.gold, width: 1.25 }, rectRadius: 0.06,
    });
    s.addText(q[0], {
      x: x + 0.3, y: 2.55, w: w - 0.6, h: 0.4,
      fontFace: F.serif, fontSize: 22, bold: true, color: C.gold,
    });
    s.addText(q[1], {
      x: x + 0.3, y: 3.15, w: w - 0.6, h: 1.15,
      fontFace: F.serif, fontSize: 16, color: C.white,
    });
  });
  s.addText(
    "Una respuesta afirmativa = cribado positivo. No diagnostica: abre una conversación.",
    {
      x: M, y: 4.8, w: W - M * 2, h: 0.4,
      fontFace: F.sans, fontSize: 15, italic: true, color: C.goldSoft, align: "center",
    },
  );
  s.addText(
    "Si se abre: ¿Jugás a las apuestas online? · ¿Con qué frecuencia? · ¿Alguna vez sentiste que gastaste más de lo que querías?",
    {
      x: M, y: 5.35, w: W - M * 2, h: 0.55,
      fontFace: F.sans, fontSize: 14, color: C.text, align: "center",
    },
  );
  ref(
    s,
    "Johnson, E. E. et al. (1997). “The Lie/Bet Questionnaire…”. Psychological Reports, 80(1), 83-88.  ·  OEDA (2024), encuesta ESTUDES 2023.",
  );
}

/* ================================================================== 19 INSTRUMENTOS */
{
  const s = newSlide();
  eyebrow(s, "Bloque 5 — Instrumentos");
  title(s, "Qué instrumento según el rol");
  const headers = ["Instrumento", "Ítems", "Quién lo usa", "Para qué"];
  const rows = [
    ["Lie/Bet", "2", "Docente, club, médico de cabecera", "Cribado. Una positiva → explorar."],
    ["SOGS", "20", "Profesional de salud", "Punto de corte ≥5 = probable problema."],
    ["DSM-5 (9 criterios)", "9", "Clínico", "Guía de entrevista. ≥4 en 12 meses."],
  ];
  const colW = [2.8, 1.2, 3.6, W - M * 2 - 7.6];
  let x = M;
  headers.forEach((h, i) => {
    s.addText(h.toUpperCase(), {
      x, y: 1.85, w: colW[i], h: 0.4,
      fontFace: F.sans, fontSize: 12, bold: true, color: C.gold,
    });
    x += colW[i];
  });
  goldRule(s, M, 2.3, W - M * 2);
  rows.forEach((r, ri) => {
    const y = 2.5 + ri * 1.0;
    let xx = M;
    r.forEach((cell, i) => {
      s.addText(cell, {
        x: xx, y, w: colW[i], h: 0.85,
        fontFace: i === 0 ? F.serif : F.sans,
        fontSize: i === 0 ? 16 : 14,
        bold: i === 0,
        color: C.text,
        valign: "middle",
      });
      xx += colW[i];
    });
  });
  s.addText(
    "La regla: usen el instrumento de su rol. Nadie espera que un docente administre el SOGS.",
    {
      x: M, y: 5.7, w: W - M * 2, h: 0.4,
      fontFace: F.serif, fontSize: 15, italic: true, color: C.goldSoft,
    },
  );
  ref(
    s,
    "Lesieur, H. R., & Blume, S. B. (1987). SOGS. American Journal of Psychiatry, 144(9), 1184-1188.  ·  Johnson et al. (1997). Psychol Rep.  ·  APA (2013). DSM-5.",
  );
}

/* ================================================================== 20 CASO DIEGO */
{
  const s = newSlide(true);
  eyebrow(s, "Caso clínico compuesto");
  title(s, "Diego, 21 años — el juego no era el motivo de consulta");
  s.addText("Datos identificatorios modificados. Fragmentos de más de un paciente.", {
    x: M, y: 1.6, w: W - M * 2, h: 0.3,
    fontFace: F.sans, fontSize: 12, italic: true, color: C.textDim,
  });
  panel(s, {
    x: M, y: 2.05, w: W - M * 2, h: 3.85,
    head: "Lo que importa recordar",
    items: [
      "Consulta por ansiedad / bajo rendimiento; el juego aparece “al pasar”.",
      "Entorno cercano que también apuesta (normalización).",
      "Promesa de parar que funciona… hasta que cambia el contexto (Mundial).",
      "Patología dual: el juego como síntoma de fondo, no siempre como queja principal.",
      "Volvemos a Diego al cerrar el bloque de intervención.",
    ],
    size: 15,
  });
}

/* ================================================================== 21 CONFRONTACIÓN */
{
  const s = newSlide();
  eyebrow(s, "Bloque 6 — Intervención");
  title(s, "La trampa de la confrontación");
  quote(s, {
    y: 1.7, h: 1.55, size: 16,
    text: "La diferencia entre obligar y manipular es que cuando te obligan te das cuenta. Cuando te manipulan sentís que sos el que toma las decisiones.",
    source: "Miller y Rollnick, La entrevista motivacional (1999)",
  });
  const w = (W - M * 2 - 0.4) / 2;
  panel(s, {
    x: M, y: 3.5, w, h: 2.35,
    head: "El error más frecuente",
    body: "Asumir la postura pro-cambio frente a un adolescente ambivalente hace que defienda el statu quo. “No tengo un problema” no es mentira: es el otro plato de la balanza.",
    size: 14,
  });
  panel(s, {
    x: M + w + 0.4, y: 3.5, w, h: 2.35,
    head: "La clave",
    body: "La resistencia no está en el paciente. Está en la estrategia. Si aparece resistencia, hay que cambiar lo que estamos haciendo.",
    size: 14,
    fill: C.panelSoft,
  });
  ref(
    s,
    "Miller, W. R., & Rollnick, S. (1999). La entrevista motivacional: preparar para el cambio de conductas adictivas. Barcelona: Paidós, cap. 8.",
  );
}

/* ================================================================== 22 MOTIVACIÓN */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 6 — Entrevista motivacional");
  title(s, "La motivación no es un rasgo");
  quote(s, {
    y: 1.7, h: 1.7, size: 15,
    text: "La motivación no se debe entender como un problema de personalidad, o como un rasgo que una persona lleva consigo… Más bien, la motivación es un estado de disponibilidad o deseo de cambiar, el cual puede fluctuar de un momento a otro o de una situación a otra.",
    source: "Miller y Rollnick, La entrevista motivacional",
  });
  const w = (W - M * 2 - 0.4) / 2;
  panel(s, {
    x: M, y: 3.65, w, h: 2.2,
    head: "Lo que solemos pensar",
    body: "“Este chico no quiere cambiar.” La motivación se lee como característica fija: la tiene o no la tiene.",
    size: 14.5,
  });
  panel(s, {
    x: M + w + 0.4, y: 3.65, w, h: 2.2,
    head: "Lo que muestra la evidencia",
    body: "La motivación es un estado influido por cómo lo tratamos. El “no quiere” no es un caso perdido: es alguien cuya disposición podemos mover.",
    size: 14.5,
    fill: C.panelSoft,
  });
  ref(
    s,
    "Miller, W. R., & Rollnick, S. (1999). La entrevista motivacional. Barcelona: Paidós, cap. 1 y 2.",
  );
}

/* ================================================================== 23 PROCHASKA */
{
  const s = newSlide();
  eyebrow(s, "Bloque 6 — Etapas del cambio");
  title(s, "Prochaska y DiClemente — tarea del profesional");
  const rows = [
    ["Precontemplación", "Aumentar la duda. Que perciba riesgos sin confrontar."],
    ["Contemplación", "Inclinar la balanza. Explorar ambivalencia."],
    ["Determinación", "Ayudar a encontrar el mejor curso de acción."],
    ["Acción", "Acompañar los pasos concretos."],
    ["Mantenimiento", "Prevención de recaídas."],
    ["Recaída", "Renovar el proceso sin desmoralización."],
  ];
  rows.forEach((r, i) => {
    const y = 1.7 + i * 0.7;
    s.addText(r[0], {
      x: M, y, w: 3.2, h: 0.6,
      fontFace: F.serif, fontSize: 15, bold: true, color: C.gold, valign: "middle",
    });
    s.addText(r[1], {
      x: M + 3.3, y, w: W - M * 2 - 3.3, h: 0.6,
      fontFace: F.sans, fontSize: 15, color: C.text, valign: "middle",
    });
  });
  ref(
    s,
    "Prochaska, J. O., & DiClemente, C. C. (1983). Journal of Consulting and Clinical Psychology, 51(3), 390-395.  ·  Miller & Rollnick (1999), cap. 2. La recaída es etapa normal del proceso (3–7 ciclos en fumadores; análogo en juego).",
  );
}

/* ================================================================== 24 FRAMES */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 6 — Intervención breve");
  title(s, "FRAMES — 15 a 20 minutos para no especializados");
  const rows = [
    ["F", "Feedback", "Información personalizada sobre la situación"],
    ["R", "Responsibility", "Énfasis en la responsabilidad personal del cambio"],
    ["A", "Advice", "Consejo claro, una sola vez, sin sermón"],
    ["M", "Menu", "Alternativas disponibles, no una sola opción"],
    ["E", "Empathy", "Estilo empático: el que más predice el resultado"],
    ["S", "Self-efficacy", "Creencia de que el cambio es posible"],
  ];
  rows.forEach((r, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const w = (W - M * 2 - 0.35 * 2) / 3;
    const x = M + col * (w + 0.35);
    const y = 1.75 + row * 2.1;
    panel(s, {
      x, y, w, h: 1.9,
      head: `${r[0]}  —  ${r[1]}`,
      body: r[2],
      size: 14,
    });
  });
  ref(
    s,
    "Hodgins, D. C., Currie, S. R., & el-Guebaly, N. (2001). Journal of Consulting and Clinical Psychology, 69(1), 50-57.  ·  Miller & Rollnick (1999), cap. 3 “La intervención breve”.",
  );
}

/* ================================================================== 25 EVIDENCIA EM */
{
  const s = newSlide();
  eyebrow(s, "Bloque 6 — Evidencia");
  title(s, "Efectividad de la EM en juego patológico");
  const items = [
    ["Yakovenko et al., 2015", "Meta-análisis (n=730): reducción significativa de frecuencia de juego hasta 12 meses."],
    ["García-Caballero et al., 2018", "EM+TCC: reducción significativa (p<.000) en problemas de juego, impulsividad y calidad de vida."],
    ["Josephson et al., 2016", "Juego + alcohol riesgoso: se benefician más de EM que de TCC grupal."],
    ["Forman & Boughter, 2024", "EM+TCC superior a TCC sola. EM sola útil en etapas tempranas y casos leves/moderados. Lectura cauta: no sobreestimar."],
  ];
  items.forEach((it, i) => {
    const y = 1.7 + i * 1.05;
    s.addText(it[0], {
      x: M, y, w: 4.2, h: 0.9,
      fontFace: F.serif, fontSize: 14, bold: true, color: C.gold, valign: "middle",
    });
    s.addText(it[1], {
      x: M + 4.35, y, w: W - M * 2 - 4.35, h: 0.9,
      fontFace: F.sans, fontSize: 14, color: C.text, valign: "middle",
    });
  });
  ref(
    s,
    "Yakovenko et al. (2015). Addictive Behaviors, 43, 72-82.  ·  García-Caballero et al. (2018). Adicciones, 30(3), 219-224.  ·  Josephson et al. (2016). PeerJ, e1899.  ·  Forman & Boughter (2024).",
  );
}

/* ================================================================== 26 ROLES */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 6 — Por rol");
  title(s, "Qué le corresponde a cada uno");
  twoColList(
    s,
    {
      head: "El docente",
      items: [
        "No diagnostica.",
        "Nombra lo que observa sin acusar.",
        "Comunica a la familia con datos concretos.",
        "Deriva al gabinete / EOE.",
        "Registra los cambios observados.",
      ],
      size: 14,
    },
    {
      head: "El profesional de salud",
      items: [
        "Puede aplicar Lie/Bet o usar DSM-5 como guía.",
        "Puede dar psicoeducación básica y FRAMES.",
        "Puede derivar a tratamiento especializado.",
        "Debe conocer los recursos de la región.",
      ],
      size: 14,
    },
    1.75,
    3.8,
  );
  ref(
    s,
    "Miller & Rollnick (1999).  ·  Johnson et al. (1997).  ·  Hodgins et al. (2001).",
  );
}

/* ================================================================== 27 DERIVACIÓN */
{
  const s = newSlide();
  eyebrow(s, "Bloque 6 — Red de derivación");
  title(s, "Balcarce / Mar del Plata");
  const rows = [
    ["Línea 141 — SEDRONAR", "Gratuita · confidencial · 24 hs · todo el país"],
    ["Programa CASS — MdP", "Consultorios FADE · referencia regional · WhatsApp +54 9 223 522-0806"],
    ["SEMDA — MdP", "Av. Jara 1661 · (0223) 473-2037"],
    ["Casa Caracol — SEDRONAR", "Ituzaingó 8055 · (0223) 478-6384"],
    ["CPA Mar del Plata", "Centro Provincial de Atención (verificar operatividad antes de derivar)"],
    ["HIGA Mar del Plata", "Servicio de Salud Mental · (0223) 499-9300"],
  ];
  rows.forEach((r, i) => {
    const y = 1.65 + i * 0.72;
    s.addText(r[0], {
      x: M, y, w: 4.3, h: 0.6,
      fontFace: F.serif, fontSize: 14, bold: true, color: C.gold, valign: "middle",
    });
    s.addText(r[1], {
      x: M + 4.4, y, w: W - M * 2 - 4.4, h: 0.6,
      fontFace: F.sans, fontSize: 13.5, color: C.text, valign: "middle",
    });
  });
  ref(
    s,
    "Fuentes institucionales públicas SEDRONAR / municipio. Confirmar operatividad del CPA antes de mencionarlo en público (criterio Echeburúa / Jiménez Murcia).",
  );
}

/* ================================================================== 28 CIERRE */
{
  const s = newSlide(true);
  eyebrow(s, "Bloque 7 — Cierre");
  s.addText("No necesitan ser especialistas\nen adicciones para hacer algo.", {
    x: M, y: 1.6, w: W - M * 2, h: 1.5,
    fontFace: F.serif, fontSize: 32, bold: true, color: C.white, align: "center",
  });
  goldRule(s, (W - 2.2) / 2, 3.3, 2.2);
  s.addText(
    "Necesitan saber reconocer una señal, saber hacer una pregunta\ny saber a quién derivar. Eso es exactamente lo que trabajamos hoy.",
    {
      x: M, y: 3.6, w: W - M * 2, h: 1.0,
      fontFace: F.serif, fontSize: 17, color: C.text, align: "center",
    },
  );
  s.addText("En Balcarce, ustedes son el primer eslabón.", {
    x: M, y: 4.9, w: W - M * 2, h: 0.55,
    fontFace: F.serif, fontSize: 22, bold: true, italic: true, color: C.goldSoft, align: "center",
  });
  s.addText("Gracias.", {
    x: M, y: 5.7, w: W - M * 2, h: 0.4,
    fontFace: F.serif, fontSize: 18, color: C.textDim, align: "center",
  });
}

/* ================================================================== 29 CONTACTO */
{
  const s = newSlide();
  eyebrow(s, "Contacto");
  title(s, "Programa CASS");
  const w = (W - M * 2 - 0.35 * 2) / 3;
  panel(s, {
    x: M, y: 1.85, w, h: 3.0,
    head: "Consultas profesionales",
    items: [
      "WhatsApp: +54 9 223 522-0806",
      "Mail: alesan23@gmail.com",
      "Web: programacass.com",
      "Instagram: @programacass",
    ],
    size: 13.5,
  });
  panel(s, {
    x: M + w + 0.35, y: 1.85, w, h: 3.0,
    head: "Sedes MdP",
    items: [
      "FADE — Moreno 3215, 1º of. 2 · 223 4940697",
      "Lucero — Córdoba 2893 · 223 522-0806 / 223 544-6072",
    ],
    size: 13,
    fill: C.panelSoft,
  });
  panel(s, {
    x: M + (w + 0.35) * 2, y: 1.85, w, h: 3.0,
    head: "Derivar hoy",
    items: [
      "Línea 141 — SEDRONAR, 24 hs",
      "WhatsApp CASS para coordinar derivación institucional",
    ],
    size: 13.5,
  });
  s.addText("Preguntas", {
    x: M, y: 5.3, w: W - M * 2, h: 0.6,
    fontFace: F.serif, fontSize: 28, bold: true, color: C.goldSoft, align: "center",
  });
}

/* ================================================================== 30-31 REFS */
const refsA = [
  "American Psychiatric Association (2013). DSM-5. Washington DC: APA.",
  "Alter, A. (2017). Irresistible. Nueva York: Penguin Press.",
  "Bilinkis, S. (2024). “Apuestas online…”. Futuro en Construcción, T13 E10.",
  "Casey, B. J., Jones, R. M., & Hare, T. A. (2008). Annals of the NY Academy of Sciences, 1124, 111-126.",
  "Cruz Roja Argentina (2025). Encuesta nacional sobre apuestas online en adolescentes.",
  "Derevensky, J. L., & Gilbeau, L. (2019). Canadian Journal of Addiction, 10(1), 10-20.",
  "Echeburúa, E., & Corral, P. (2010). Adicciones, 22(2), 91-96.",
  "Fogg, B. J. (2003). Persuasive Technology. Morgan Kaufmann.",
  "Forman, D. P., & Boughter, J. R. (2024). Meta-análisis EM en juego patológico.",
  "García-Caballero, A. et al. (2018). Adicciones, 30(3), 219-224.",
  "Griffiths, M. D., & Parke, J. (2002). Social Science Computer Review, 20(3), 312-320.",
  "Hodgins, D. C., Currie, S. R., & el-Guebaly, N. (2001). J. Consult. Clin. Psychol., 69(1), 50-57.",
];
const refsB = [
  "Johnson, E. E. et al. (1997). Psychological Reports, 80(1), 83-88.",
  "Josephson, H. et al. (2016). PeerJ, e1899.",
  "Lesieur, H. R., & Blume, S. B. (1987). American Journal of Psychiatry, 144(9), 1184-1188.",
  "Miller, W. R., & Rollnick, S. (1999). La entrevista motivacional. Barcelona: Paidós.",
  "OEDA (2024). Informe sobre Adicciones Comportamentales… Madrid: Ministerio de Sanidad.",
  "Observatorio de Adicciones PBA / Defensoría del Pueblo PBA (2024).",
  "Prochaska, J. O., & DiClemente, C. C. (1983). J. Consult. Clin. Psychol., 51(3), 390-395.",
  "Schultz, W., Dayan, P., & Montague, P. R. (1997). Science, 275(5306), 1593-1599.",
  "SEDRONAR (2023/2024). Encuesta universitarios y Línea 141.",
  "Skinner, B. F. (1938). The Behavior of Organisms. Appleton-Century-Crofts.",
  "Steinberg, L. (2008). Developmental Review, 28(1), 78-106.",
  "Yakovenko, I. et al. (2015). Addictive Behaviors, 43, 72-82.",
];

[refsA, refsB].forEach((list, idx) => {
  const s = newSlide(idx === 1);
  eyebrow(s, "Referencias bibliográficas");
  title(s, idx === 0 ? "Referencias (1 de 2)" : "Referencias (2 de 2)");
  const half = Math.ceil(list.length / 2);
  const w = (W - M * 2 - 0.4) / 2;
  [list.slice(0, half), list.slice(half)].forEach((col, i) => {
    s.addText(
      col.map((t) => ({
        text: t,
        options: { bullet: { code: "2022", indent: 10 }, breakLine: true },
      })),
      {
        x: M + i * (w + 0.4), y: 1.75, w, h: 4.5,
        fontFace: F.sans, fontSize: 11.5, color: C.text, paraSpacingAfter: 6,
      },
    );
  });
});

/* ------------------------------------------------------------------ save */
const OUT = path.join(
  __dirname,
  "CASS_Balcarce_Juego_patologico_adolescentes.pptx",
);
pptx
  .writeFile({ fileName: OUT })
  .then(() => {
    console.log("OK ->", OUT);
    console.log("Diapositivas:", DECK.length);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
