import { Resend } from "resend";

/** Lazy init: Resend falla en build si la API key no está (ej. Vercel) */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.trim() === "") return null;
  return new Resend(key);
}

function getBaseUrl(): string {
  const fromEnv =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;
  if (!fromEnv) return "https://glomun.com";
  if (fromEnv.startsWith("http")) return fromEnv;
  return `https://${fromEnv}`;
}

export async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[sendEmail] RESEND_API_KEY no configurado, no se envía email");
    return false;
  }
  const baseUrl = getBaseUrl();
  const link = `${baseUrl}/api/account/login/verify?token=${token}`;
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Glomun <onboarding@resend.dev>",
      to: email,
      subject: "Acceso a tu cuenta Glomun",
      html: `
        <p>Hacé clic en el siguiente enlace para acceder a tu cuenta:</p>
        <p><a href="${link}" style="color:#84b9ed;font-weight:600;">Ingresar a Mi cuenta</a></p>
        <p>El enlace expira en 15 minutos.</p>
        <p>Si no solicitaste este acceso, podés ignorar este email.</p>
      `,
    });
    if (error) {
      console.error("[sendEmail] Resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[sendEmail] failed:", e);
    return false;
  }
}

export async function sendPaymentConfirmedEmail(email: string, token: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[sendEmail] RESEND_API_KEY no configurado, no se envía email");
    return false;
  }
  const baseUrl = getBaseUrl();
  const link = `${baseUrl}/api/account/login/verify?token=${token}`;
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Glomun <onboarding@resend.dev>",
      to: email,
      subject: "Tu pago fue confirmado - Glomun",
      html: `
        <p>¡Tu pago fue confirmado!</p>
        <p>Hacé clic en el siguiente enlace para acceder a tu cuenta:</p>
        <p><a href="${link}" style="color:#84b9ed;font-weight:600;">Ingresar a Mi cuenta</a></p>
        <p>El enlace expira en 15 minutos. Si necesitás acceder más tarde, ingresá tu email en la página de Mi cuenta y te enviaremos un nuevo enlace.</p>
      `,
    });
    if (error) {
      console.error("[sendEmail] Resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[sendEmail] failed:", e);
    return false;
  }
}
