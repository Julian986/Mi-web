const fs = require("fs");
const path = require("path");

const xmlPath = path.join(__dirname, "_bloques_unzip", "word", "document.xml");
const xml = fs.readFileSync(xmlPath, "utf8");

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

const parts = xml.split(/<w:p[ >]/);
const paras = [];
for (const part of parts.slice(1)) {
  const ts = [...part.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) =>
    decode(m[1]),
  );
  const line = ts.join("").trim();
  if (line) paras.push(line);
}

const out = path.join(__dirname, "BLOQUES.txt");
fs.writeFileSync(out, paras.join("\n\n"), "utf8");
console.log("Wrote", out, "paras:", paras.length);
console.log(paras.join("\n---\n"));
