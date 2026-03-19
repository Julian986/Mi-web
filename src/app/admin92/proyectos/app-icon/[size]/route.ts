import { NextRequest } from "next/server";

const SOURCE_ICON =
  "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp";

function getIconUrl(size: string): string | null {
  const s = Number(size);
  if (!Number.isFinite(s) || ![192, 512].includes(s)) return null;
  // c_pad agrega aire alrededor para que el ícono no se vea gigante en launcher.
  return `https://res.cloudinary.com/dzoupwn0e/image/upload/w_${s},h_${s},c_pad,b_transparent,f_png,q_auto/${SOURCE_ICON.split("/upload/")[1]}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const iconUrl = getIconUrl(size);
  if (!iconUrl) {
    return new Response("Icon size not supported", { status: 400 });
  }

  const upstream = await fetch(iconUrl, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!upstream.ok) {
    return new Response("Icon not available", { status: 502 });
  }

  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

