/**
 * Mensajes guardados para Acciones de hoy (Cuaderno de cobros).
 * Se reutilizan en Recordatorio de pago y Estadísticas.
 */

/** Plantilla para recordatorio de pago. __MONTO__ se reemplaza por el monto formateado. */
export const MENSAJE_RECORDATORIO_PAGO = `Hola 😊
Te escribo para recordarte que ya venció la mensualidad del servicio web.

Monto: __MONTO__
Alias: julian.desarrollador

Cuando realices la transferencia, por favor enviame el comprobante.

Gracias.`;

/** Mensaje para enviar junto con las estadísticas del sitio. */
export const MENSAJE_ESTADISTICAS = `Hola 😊
Te comparto las estadísticas del sitio correspondientes a este período.

Cualquier duda o cambio que quieras hacer, avisame y lo vemos.

¡Gracias!`;

export function formatRecordatorioMensaje(amount: number): string {
  const montoStr = `$${amount.toLocaleString("es-AR")}`;
  return MENSAJE_RECORDATORIO_PAGO.replace("__MONTO__", montoStr);
}
