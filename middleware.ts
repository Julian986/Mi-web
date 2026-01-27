import { NextRequest, NextResponse } from "next/server";

type RateEntry = {
  firstFailAt: number;
  fails: number;
  blockedUntil: number;
};

const RATE_KEY = "__glomun_admin_rate_limit__";

function getRateStore(): Map<string, RateEntry> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[RATE_KEY]) g[RATE_KEY] = new Map<string, RateEntry>();
  return g[RATE_KEY] as Map<string, RateEntry>;
}

function getClientIp(req: NextRequest) {
  // En Vercel suele venir `req.ip`. Fallback: x-forwarded-for
  const ipFromReq = (req as any).ip as string | undefined;
  if (ipFromReq) return ipFromReq;
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0]?.trim() : "unknown";
}

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Glomun Admin", charset="UTF-8"',
    },
  });
}

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASS;

  // Si no está configurado, no dejamos abierto por accidente.
  if (!user || !pass) {
    return new NextResponse("Admin credentials not configured.", { status: 500 });
  }

  // Rate limit (best-effort): cuenta intentos fallidos por IP
  const ip = getClientIp(req);
  const now = Date.now();
  const maxFails = Number(process.env.ADMIN_RATE_LIMIT_MAX || 3); // 3 intentos
  const windowMs = Number(process.env.ADMIN_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000); // 10 min
  const blockMs = Number(process.env.ADMIN_RATE_LIMIT_BLOCK_MS || 24 * 60 * 60 * 1000); // 24 hs

  const store = getRateStore();
  const entry = store.get(ip) || { firstFailAt: now, fails: 0, blockedUntil: 0 };
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return new NextResponse("Too many attempts.", {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    });
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("basic ")) {
    // Registrar fallo
    if (now - entry.firstFailAt > windowMs) {
      entry.firstFailAt = now;
      entry.fails = 0;
    }
    entry.fails += 1;
    if (entry.fails >= maxFails) {
      entry.blockedUntil = now + blockMs;
    }
    store.set(ip, entry);
    return unauthorized();
  }

  const base64 = auth.slice(6).trim();
  let decoded = "";
  try {
    decoded = Buffer.from(base64, "base64").toString("utf8");
  } catch {
    // Registrar fallo
    if (now - entry.firstFailAt > windowMs) {
      entry.firstFailAt = now;
      entry.fails = 0;
    }
    entry.fails += 1;
    if (entry.fails >= maxFails) {
      entry.blockedUntil = now + blockMs;
    }
    store.set(ip, entry);
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) {
    // Registrar fallo
    if (now - entry.firstFailAt > windowMs) {
      entry.firstFailAt = now;
      entry.fails = 0;
    }
    entry.fails += 1;
    if (entry.fails >= maxFails) {
      entry.blockedUntil = now + blockMs;
    }
    store.set(ip, entry);
    return unauthorized();
  }

  const u = decoded.slice(0, idx);
  const p = decoded.slice(idx + 1);

  if (u !== user || p !== pass) {
    // Registrar fallo
    if (now - entry.firstFailAt > windowMs) {
      entry.firstFailAt = now;
      entry.fails = 0;
    }
    entry.fails += 1;
    if (entry.fails >= maxFails) {
      entry.blockedUntil = now + blockMs;
    }
    store.set(ip, entry);
    return unauthorized();
  }

  // Éxito: resetear contador para esta IP
  store.delete(ip);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin92/:path*", "/api/admin/:path*"],
};

