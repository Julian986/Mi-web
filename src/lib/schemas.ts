import { z } from "zod";

/**
 * Esquema para datos de cliente en compra/suscripción.
 * Usado en frontend (validación antes de enviar) y backend (validación API Mercado Pago).
 *
 * WhatsApp: No existe API pública oficial para verificar si un número está registrado en WhatsApp.
 * Solo validamos formato E.164 (10-15 dígitos) para que el enlace wa.me funcione correctamente.
 */
export const customerNameSchema = z
  .string()
  .min(1, "El nombre es requerido")
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(120, "El nombre es demasiado largo")
  .transform((s) => s.trim());

export const customerEmailSchema = z
  .string()
  .min(1, "El email es requerido")
  .email("Ingresá un email válido")
  .transform((s) => s.trim().toLowerCase());

/** Formato E.164: solo dígitos, 10-15 caracteres. Compatible con wa.me/5491112345678 */
export const customerPhoneSchema = z
  .string()
  .min(1, "El celular es requerido")
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    },
    { message: "Ingresá un número válido (10-15 dígitos). Ej: +54 9 11 1234-5678" }
  )
  .transform((s) => s.trim());

export const serviceTypeSchema = z.enum(["web", "ecommerce", "custom"], {
  message: "Tipo de servicio inválido",
});

/** Body para crear suscripción en Mercado Pago */
export const subscriptionBodySchema = z.object({
  serviceType: serviceTypeSchema,
  customerEmail: customerEmailSchema,
  customerName: customerNameSchema,
  customerPhone: customerPhoneSchema,
  upgradeFromPreapprovalId: z.string().trim().optional().transform((v) => (v === "" ? undefined : v)),
});

export type SubscriptionBody = z.infer<typeof subscriptionBodySchema>;

/** Validación solo de campos de contacto (para frontend antes de enviar) */
export const paymentFieldsSchema = z.object({
  customerName: customerNameSchema,
  customerEmail: customerEmailSchema,
  customerPhone: customerPhoneSchema,
});

export type PaymentFields = z.infer<typeof paymentFieldsSchema>;
