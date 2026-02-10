import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { findSubscriptionByPreapprovalId } from "@/app/lib/subscriptionsMongo";
import { listMpWebhookEventsForSubscription } from "@/app/lib/mpWebhookMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";

function formatLocalDate(dateStr?: string) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function HistorialPagosPage() {
  if (!process.env.MONGODB_URI) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header estilo WhatsApp: flecha + título */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
          <div className="flex items-center h-14 px-4">
            <Link
              href="/account"
              className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
              aria-label="Volver a Mi cuenta"
            >
              <ArrowLeft className="w-6 h-6 shrink-0" />
              <span className="text-lg font-medium">Historial</span>
            </Link>
          </div>
        </header>

        <main className="pt-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            <p className="text-sm text-slate-600">
              El historial no está disponible por el momento.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const cookieStore = await cookies();
  const preapprovalId = cookieStore.get(COOKIE_NAME)?.value;

  if (!preapprovalId) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header estilo WhatsApp: flecha + título */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
          <div className="flex items-center h-14 px-4">
            <Link
              href="/account"
              className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
              aria-label="Volver a Mi cuenta"
            >
              <ArrowLeft className="w-6 h-6 shrink-0" />
              <span className="text-lg font-medium">Historial</span>
            </Link>
          </div>
        </header>

        <main className="pt-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            <p className="text-sm text-slate-600">
              Para ver tu historial, ingresá a tu cuenta.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/account/ingresar"
                className="inline-flex items-center rounded-lg bg-[#84b9ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Volver a Mi cuenta
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const sub = await findSubscriptionByPreapprovalId(preapprovalId);
  if (!sub || sub.status === "cancelled") {
    return (
      <div className="min-h-screen bg-white">
        {/* Header estilo WhatsApp: flecha + título */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
          <div className="flex items-center h-14 px-4">
            <Link
              href="/account"
              className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
              aria-label="Volver a Mi cuenta"
            >
              <ArrowLeft className="w-6 h-6 shrink-0" />
              <span className="text-lg font-medium">Historial</span>
            </Link>
          </div>
        </header>

        <main className="pt-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            <p className="text-sm text-slate-600">
              No encontramos una suscripción activa para mostrar tu historial.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/#services"
                className="inline-flex items-center rounded-lg bg-[#84b9ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors"
              >
                Ver planes
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Volver a Mi cuenta
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const mpEvents = await listMpWebhookEventsForSubscription({
    payerEmail: sub.email,
    preapprovalId: sub.preapprovalId,
    limit: 500,
  });

  const getMpType = (evt: any) => {
    const bodyType = evt?.body?.type || evt?.body?.topic || evt?.query?.type || "";
    return String(bodyType || "mp").trim();
  };

  const getMonthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const isApprovedLike = (status: unknown) => {
    const st = String(status || "").toLowerCase().trim();
    return st === "approved" || st === "authorized";
  };

  const typeRank = (t: string) => {
    // Priorizamos pagos reales sobre eventos de suscripción.
    if (t === "payment") return 3;
    if (t === "subscription_authorized_payment") return 2;
    if (t === "subscription_preapproval") return 1;
    return 0;
  };

  type ApprovedRow = {
    date: Date;
    monthKey: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
  };

  const approvedCandidates: ApprovedRow[] = mpEvents
    .map((e) => {
      const type = getMpType(e);
      const status = (e as any)?.summary?.status;
      const amount = (e as any)?.summary?.amount;
      const currency = (e as any)?.summary?.currency || "ARS";
      const dateIso = (e as any)?.body?.date || e.receivedAt;
      const date = new Date(dateIso);
      if (!status || amount == null) return null;
      if (!isApprovedLike(status)) return null;
      if (!(date instanceof Date) || isNaN(date.getTime())) return null;
      return {
        date,
        monthKey: getMonthKey(date),
        amount: Number(amount),
        currency: String(currency || "ARS"),
        status: String(status),
        type,
      } satisfies ApprovedRow;
    })
    .filter(Boolean) as ApprovedRow[];

  // 1 pago por mes: si hay múltiples, elegimos el "mejor" (payment > authorized_payment > preapproval)
  const bestByMonth = new Map<string, ApprovedRow>();
  for (const row of approvedCandidates) {
    const existing = bestByMonth.get(row.monthKey);
    if (!existing) {
      bestByMonth.set(row.monthKey, row);
      continue;
    }
    const rA = typeRank(row.type);
    const rB = typeRank(existing.type);
    if (rA > rB || (rA === rB && row.date.getTime() > existing.date.getTime())) {
      bestByMonth.set(row.monthKey, row);
    }
  }

  const approvedRows = Array.from(bestByMonth.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const subscribedSince =
    approvedCandidates.length > 0
      ? new Date(
          Math.min(...approvedCandidates.map((r) => r.date.getTime()))
        )
      : null;

  const monthsSubscribed = (() => {
    if (!subscribedSince) return null;
    const now = new Date();
    let months =
      (now.getFullYear() - subscribedSince.getFullYear()) * 12 +
      (now.getMonth() - subscribedSince.getMonth());
    if (now.getDate() < subscribedSince.getDate()) months -= 1;
    return Math.max(0, months);
  })();

  return (
    <div className="min-h-screen bg-white">
      {/* Header estilo WhatsApp: flecha + título */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4">
          <Link
            href="/account"
            className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
            aria-label="Volver a Mi cuenta"
          >
            <ArrowLeft className="w-6 h-6 shrink-0" />
            <span className="text-lg font-medium">Historial</span>
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <p className="text-sm text-slate-600 mb-6">
            Pagos aprobados de{" "}
            <span className="font-medium text-slate-900">
              {sub.name || sub.email}
            </span>
            .
          </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500 mb-1">Pagos aprobados</p>
                <p className="text-base font-semibold text-slate-900">
                  {approvedRows.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500 mb-1">Suscripto desde</p>
                <p className="text-base font-semibold text-slate-900">
                  {subscribedSince ? subscribedSince.toLocaleDateString("es-AR") : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500 mb-1">Antigüedad</p>
                <p className="text-base font-semibold text-slate-900">
                  {monthsSubscribed == null
                    ? "—"
                    : monthsSubscribed === 0
                      ? "Menos de 1 mes"
                      : `${monthsSubscribed} ${monthsSubscribed === 1 ? "mes" : "meses"}`}
                </p>
              </div>
            </div>

            <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Movimientos (Mercado Pago)
                </h2>
                <p className="text-sm text-slate-600">
                  Si ves algo raro, escribinos por WhatsApp desde “Mi cuenta”.
                </p>
              </div>

              {approvedRows.length === 0 ? (
                <div className="p-5 sm:p-6">
                  <p className="text-sm text-slate-600">
                    Todavía no registramos pagos aprobados para tu cuenta.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3">Fecha</th>
                        <th className="text-left font-semibold px-4 py-3">
                          Monto
                        </th>
                        <th className="text-left font-semibold px-4 py-3">
                          Estado
                        </th>
                        <th className="text-left font-semibold px-4 py-3">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {approvedRows.map((r, idx) => {
                        const st = r.status;
                        const stLower = st.toLowerCase();
                        const isOk = ["approved", "authorized"].includes(stLower);
                        return (
                          <tr key={`${r.monthKey}-${idx}`}>
                            <td className="px-4 py-3 text-slate-900 whitespace-nowrap">
                              {r.date.toLocaleString("es-AR")}
                            </td>
                            <td className="px-4 py-3 text-slate-900 whitespace-nowrap">
                              {`$${Number(r.amount).toLocaleString("es-AR")} ${r.currency || "ARS"}`}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isOk ? (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                  {st}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  {st}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                              {r.type}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
        </div>
      </main>
    </div>
  );
}

