import type { SolicitudTask } from "@/app/admin92/contabilidad/lib/cuotaOperativa";

export type Desarrollo50Item = {
  id: string;
  clientName: string;
  name: string;
  type: string;
  fechaCobro50?: string;
  montoCobrado50?: number;
  accountingRecordId?: string;
  cambioPendiente?: boolean;
  solicitudTasks?: SolicitudTask[];
};

export type Desarrollo50DotMarker = {
  fechaCobro50: string;
  cambioPendiente: boolean;
};

export function mapDesarrollo50Doc(raw: {
  _id?: string;
  id?: string;
  clientName: string;
  name: string;
  servicio?: string;
  fechaCobro50?: string;
  montoCobrado50?: number;
  accountingRecordId?: string;
  cambioPendiente?: boolean;
  solicitudTasks?: SolicitudTask[];
}): Desarrollo50Item {
  return {
    id: raw._id ?? raw.id ?? "",
    clientName: raw.clientName,
    name: raw.name,
    type: raw.servicio || "—",
    fechaCobro50: raw.fechaCobro50,
    montoCobrado50: raw.montoCobrado50,
    accountingRecordId: raw.accountingRecordId,
    cambioPendiente: Boolean(raw.cambioPendiente),
    solicitudTasks: Array.isArray(raw.solicitudTasks) ? raw.solicitudTasks : undefined,
  };
}

export function sortDesarrollos50(items: Desarrollo50Item[]): Desarrollo50Item[] {
  return [...items].sort((a, b) => {
    const fa = a.fechaCobro50 || "";
    const fb = b.fechaCobro50 || "";
    if (fa !== fb) return fb.localeCompare(fa);
    return a.clientName.localeCompare(b.clientName);
  });
}
