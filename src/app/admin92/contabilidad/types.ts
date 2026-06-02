export type AccountingType = "ingreso" | "gasto" | "inversion";

export type AccountingRecord = {
  _id?: string;
  type: AccountingType;
  amount: number;
  description: string;
  category?: string;
  date: string;
  createdAt: string;
};

export type Cobro = {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidAt?: string;
  fechaCobro?: string;
  servicio?: string;
  origen?: "manual" | "suscripcion_mp";
  notes?: string;
  estadisticasEnviadas?: boolean;
  recordatorioEnviado?: boolean;
  accountingRecordId?: string;
};

export const typeLabels: Record<AccountingType, string> = {
  ingreso: "Ingreso",
  gasto: "Gasto",
  inversion: "Inversión",
};

export const typeColors: Record<AccountingType, string> = {
  ingreso: "bg-green-100 text-green-800",
  gasto: "bg-red-100 text-red-800",
  inversion: "bg-blue-100 text-blue-800",
};

export const MARKER_COLORS = {
  ingreso: "#84b9ed",
  gasto: "#ef4444",
  inversion: "#6366f1",
  cuotaPendiente: "#f97316",
  cuotaRecordada: "#3b82f6",
  cuotaPagada: "#22c55e",
} as const;
