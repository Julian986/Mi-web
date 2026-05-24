"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Pencil, Trash2, Check, BarChart3, Calendar, FolderKanban, Copy, FileText } from "lucide-react";
import { getRemindersToday, getRemindersWeekBefore, getStatsToday } from "@/app/lib/cobrosWorkflow";
import { formatRecordatorioMensaje, MENSAJE_ESTADISTICAS, MENSAJE_RECORDATORIO_PAGO } from "@/app/lib/cobrosMensajes";
import MonthCalendar from "@/app/admin92/contabilidad/components/MonthCalendar";
import HerramientasPanel from "@/app/admin92/contabilidad/components/HerramientasPanel";
import { buildCalendarMarkers } from "@/app/admin92/contabilidad/lib/calendarMarkers";
import {
  formatMonthLabel,
  formatLocalDate,
  getMonthKey,
  getMonthKeySafe,
  getRecordDateStr,
  shiftMonth,
  todayYmd,
} from "@/app/admin92/contabilidad/lib/utils";

const SERVICIO_OPTIONS = ["", "App", "Tienda", "Web", "Mantenimiento", "Otro"] as const;

const WORD_ONLINE_URL =
  process.env.NEXT_PUBLIC_ENLACE_WORD?.trim() ||
  process.env.NEXT_PUBLIC_PROYECTOS_WORD_URL?.trim() ||
  "";

type WebhookEvent = {
  receivedAt: string;
  path: string;
  provider: "mp" | "resend";
  type?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
  signatureVerified?: boolean;
  summary?: { amount?: number; currency?: string; payerEmail?: string; status?: string };
};

type AccountingType = "ingreso" | "gasto" | "inversion";

type AccountingRecord = {
  _id?: string;
  type: AccountingType;
  amount: number;
  description: string;
  category?: string;
  date: string;
  createdAt: string;
};

/** Cuota del Cuaderno de cobros */
type Cobro = {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  paidAt?: string;
  /** Fecha real del cobro (ingreso contable) */
  fechaCobro?: string;
  servicio?: string;
  origen?: "manual" | "suscripcion_mp";
  notes?: string;
  estadisticasEnviadas?: boolean;
  recordatorioEnviado?: boolean;
  accountingRecordId?: string;
};

const typeLabels: Record<AccountingType, string> = {
  ingreso: "Ingreso",
  gasto: "Gasto",
  inversion: "Inversión",
};

const typeColors: Record<AccountingType, string> = {
  ingreso: "bg-green-100 text-green-800",
  gasto: "bg-red-100 text-red-800",
  inversion: "bg-blue-100 text-blue-800",
};

type SubscriptionAdmin = {
  preapprovalId: string;
  email: string;
  name?: string;
  plan: string;
  status: string;
  createdAt?: string;
  ga4PropertyId: string | null;
};

function Admin92PageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isContabilidadPwa = pathname?.startsWith("/admin92/contabilidad") ?? false;

  const [activeTab, setActiveTab] = useState<"webhooks" | "contabilidad" | "suscripciones">("contabilidad");

  // Ruta dedicada /admin92/contabilidad (PWA) → siempre contabilidad. Si no, `?tab=` en /admin92.
  useEffect(() => {
    if (isContabilidadPwa) {
      setActiveTab("contabilidad");
      return;
    }
    const tab = searchParams.get("tab");
    if (tab === "webhooks" || tab === "contabilidad" || tab === "suscripciones") {
      setActiveTab(tab);
    }
  }, [searchParams, isContabilidadPwa]);

  // Webhooks state
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [webhookProviderFilter, setWebhookProviderFilter] = useState<"all" | "mp" | "resend">("all");
  const [webhookTypeFilter, setWebhookTypeFilter] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"mongo" | "memory" | "unknown">("unknown");

  // Contabilidad state
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [accLoading, setAccLoading] = useState(false);
  const [accError, setAccError] = useState<string>("");
  const [formType, setFormType] = useState<AccountingType>("ingreso");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AccountingRecord | null>(null);
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [contabilidadMonth, setContabilidadMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [contabilidadToolPanel, setContabilidadToolPanel] = useState<
    null | "objetivos" | "mantenimientos" | "buscar-clientes"
  >(null);
  const [pendingPaidCobro, setPendingPaidCobro] = useState<Cobro | null>(null);
  const [paidFechaIngreso, setPaidFechaIngreso] = useState("");

  // Cuaderno de cobros
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [cobroLoading, setCobroLoading] = useState(false);
  const [cobroError, setCobroError] = useState("");
  const [cobroSubmitting, setCobroSubmitting] = useState(false);
  const [cobroFormMode, setCobroFormMode] = useState<"single" | "recurrent" | "actions">("single");
  const [showSingleCobroForm, setShowSingleCobroForm] = useState(false);
  const [cobroClient, setCobroClient] = useState("");
  const [cobroAmount, setCobroAmount] = useState("");
  const [cobroServicio, setCobroServicio] = useState("");
  const [cobroOrigen, setCobroOrigen] = useState<"manual" | "suscripcion_mp">("manual");
  const [cobroDueDate, setCobroDueDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [cobroDayOfMonth, setCobroDayOfMonth] = useState("1");
  const [cobroFromMonth, setCobroFromMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [cobroMonthsToGenerate, setCobroMonthsToGenerate] = useState("12");
  const [editingCobro, setEditingCobro] = useState<Cobro | null>(null);
  const [editCobroAmount, setEditCobroAmount] = useState("");
  const [editCobroServicio, setEditCobroServicio] = useState("");
  const [editCobroDueDate, setEditCobroDueDate] = useState("");
  const [editCobroUpdateFuture, setEditCobroUpdateFuture] = useState(false);
  const [cobroFilterClient, setCobroFilterClient] = useState("");
  const [cobroFilterPaid, setCobroFilterPaid] = useState<"" | "paid" | "pending">("");
  const [cobroFilterOrigen, setCobroFilterOrigen] = useState<"" | "manual" | "suscripcion_mp">("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Suscripciones (GA4 Property ID)
  const [subscriptions, setSubscriptions] = useState<SubscriptionAdmin[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");
  const [editingSub, setEditingSub] = useState<SubscriptionAdmin | null>(null);
  const [editGa4PropertyId, setEditGa4PropertyId] = useState("");
  const [subSaving, setSubSaving] = useState(false);
  const [subStatusFilter, setSubStatusFilter] = useState<"all" | "pending" | "authorized" | "other">("all");

  const fetchSubscriptions = async () => {
    setSubLoading(true);
    setSubError("");
    try {
      const res = await fetch("/api/admin/subscriptions", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar");
      setSubscriptions(data.subscriptions ?? []);
    } catch (e: any) {
      setSubError(e?.message || "Error al cargar suscripciones");
    } finally {
      setSubLoading(false);
    }
  };

  const handleSaveGa4PropertyId = async () => {
    if (!editingSub) return;
    setSubSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${encodeURIComponent(editingSub.preapprovalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ga4PropertyId: editGa4PropertyId.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.preapprovalId === editingSub.preapprovalId
            ? { ...s, ga4PropertyId: editGa4PropertyId.trim() || null }
            : s
        )
      );
      setEditingSub(null);
    } catch (e: any) {
      setSubError(e?.message || "Error al guardar");
    } finally {
      setSubSaving(false);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (subStatusFilter === "all") return subscriptions;
    if (subStatusFilter === "pending") return subscriptions.filter((s) => s.status === "pending");
    if (subStatusFilter === "authorized") return subscriptions.filter((s) => s.status === "authorized");
    return subscriptions.filter((s) => s.status !== "pending" && s.status !== "authorized");
  }, [subscriptions, subStatusFilter]);

  const pendingSubscriptionsCount = useMemo(
    () => subscriptions.filter((s) => s.status === "pending").length,
    [subscriptions],
  );

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (webhookProviderFilter !== "all") params.set("provider", webhookProviderFilter);
      const res = await fetch(`/api/admin/webhooks?${params.toString()}`, { method: "GET" });
      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }
      if (!res.ok) {
        setError(data?.error || "No se pudo cargar el panel.");
        return;
      }
      setEvents(Array.isArray(data?.events) ? data.events : []);
      setSource(data?.source === "mongo" || data?.source === "memory" ? data.source : "unknown");
    } catch (e: any) {
      setError(e?.message || "Error de red.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setAccLoading(true);
    setAccError("");
    try {
      const res = await fetch("/api/admin/accounting", { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        setAccError(data?.error || "No se pudieron cargar los registros.");
        return;
      }
      setRecords(Array.isArray(data?.records) ? data.records : []);
    } catch (e: any) {
      setAccError(e?.message || "Error de red.");
    } finally {
      setAccLoading(false);
    }
  };

  const fetchCobros = async () => {
    setCobroLoading(true);
    setCobroError("");
    try {
      const res = await fetch("/api/admin/cobros", { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudieron cargar los cobros.");
        return;
      }
      const list = Array.isArray(data?.cobros) ? data.cobros : [];
      setCobros(
        list.map((c: Cobro & { _id?: string }) => ({
          ...c,
          id: c.id || c._id || "",
          origen: c.origen === "suscripcion_mp" ? "suscripcion_mp" : "manual",
          accountingRecordId: c.accountingRecordId,
          fechaCobro: c.fechaCobro,
        })),
      );
    } catch (e: any) {
      setCobroError(e?.message || "Error de red.");
    } finally {
      setCobroLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "contabilidad") {
      fetchRecords();
      fetchCobros();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "webhooks") fetchEvents();
    if (activeTab === "suscripciones") fetchSubscriptions();
  }, [activeTab, webhookProviderFilter]);

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setAccError("El monto debe ser un número positivo.");
      return;
    }
    if (!formDescription.trim()) {
      setAccError("La descripción es requerida.");
      return;
    }
    setSubmitting(true);
    setAccError("");
    try {
      if (editingRecord?._id) {
        const res = await fetch(`/api/admin/accounting/${editingRecord._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formType,
            amount,
            description: formDescription.trim(),
            category: formCategory.trim() || undefined,
            date: formDate || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAccError(data?.error || "No se pudo actualizar.");
          return;
        }
        setEditingRecord(null);
      } else {
        const res = await fetch("/api/admin/accounting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formType,
            amount,
            description: formDescription.trim(),
            category: formCategory.trim() || undefined,
            date: formDate || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAccError(data?.error || "No se pudo guardar.");
          return;
        }
      }
      setFormAmount("");
      setFormDescription("");
      setFormCategory("");
      setFormDate(new Date().toISOString().slice(0, 10));
      fetchRecords();
    } catch (e: any) {
      setAccError(e?.message || "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r: AccountingRecord) => {
    setEditingRecord(r);
    setFormType(r.type);
    setFormAmount(String(r.amount));
    setFormDescription(r.description);
    setFormCategory(r.category || "");
    setFormDate(
      typeof r.date === "string" && r.date.length >= 10
        ? r.date.slice(0, 10)
        : new Date(r.date).toISOString().slice(0, 10)
    );
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setFormType("ingreso");
    setFormAmount("");
    setFormDescription("");
    setFormCategory("");
    setFormDate(new Date().toISOString().slice(0, 10));
  };

  const handleDelete = async (r: AccountingRecord) => {
    if (!r._id) return;
    if (!window.confirm(`¿Eliminar este registro?\n${r.description} - ${r.amount} ARS`)) return;
    try {
      const res = await fetch(`/api/admin/accounting/${r._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setAccError(data?.error || "No se pudo eliminar.");
        return;
      }
      fetchRecords();
    } catch (e: any) {
      setAccError(e?.message || "Error al eliminar.");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => getMonthKey(r.date) === contabilidadMonth);
  }, [records, contabilidadMonth]);

  const cobrosPendientesMes = useMemo(
    () => cobros.filter((c) => !c.paid && getMonthKeySafe(c.dueDate) === contabilidadMonth),
    [cobros, contabilidadMonth],
  );

  const calendarMarkers = useMemo(
    () => buildCalendarMarkers(filteredRecords, cobrosPendientesMes),
    [filteredRecords, cobrosPendientesMes],
  );

  const dayRecords = useMemo(() => {
    if (selectedDate) {
      return filteredRecords.filter((r) => getRecordDateStr(r.date) === selectedDate);
    }
    return filteredRecords;
  }, [filteredRecords, selectedDate]);

  const dayCuotasPendientes = useMemo(() => {
    if (selectedDate) {
      return cobros
        .filter((c) => !c.paid && c.dueDate === selectedDate)
        .sort((a, b) => a.clientName.localeCompare(b.clientName));
    }
    return cobrosPendientesMes;
  }, [cobros, selectedDate, cobrosPendientesMes]);

  const cuotaEsperadaLabel = (c: Cobro) =>
    c.servicio ? `${c.clientName} (${c.servicio}) - Cuota` : `${c.clientName} - Cuota`;

  const recordsById = useMemo(
    () => new Map(records.filter((r) => r._id).map((r) => [r._id!, r])),
    [records],
  );

  const cobranzaKpis = useMemo(() => {
    const inMonth = cobros.filter((c) => getMonthKeySafe(c.dueDate) === contabilidadMonth);
    const esperado = inMonth.reduce((sum, c) => sum + c.amount, 0);
    const pendiente = inMonth.filter((c) => !c.paid).reduce((sum, c) => sum + c.amount, 0);
    const cobrado = cobros
      .filter((c) => {
        if (!c.paid) return false;
        if (c.accountingRecordId) {
          const rec = recordsById.get(c.accountingRecordId);
          if (rec) return getMonthKey(rec.date) === contabilidadMonth;
        }
        const fechaContable = c.fechaCobro || c.dueDate;
        return getMonthKeySafe(fechaContable) === contabilidadMonth;
      })
      .reduce((sum, c) => sum + c.amount, 0);
    return { esperado, cobrado, pendiente };
  }, [cobros, contabilidadMonth, recordsById]);

  /** Ganado vs restante del mes, según fecha contable de cobros y corte (hoy o día seleccionado). */
  const cobranzaProgreso = useMemo(() => {
    const inMonth = cobros.filter((c) => getMonthKeySafe(c.dueDate) === contabilidadMonth);
    const esperadoTotal = inMonth.reduce((sum, c) => sum + c.amount, 0);
    const hoy = todayYmd();
    const mesActual = getMonthKey(hoy);

    let asOfDate = hoy;
    if (selectedDate && getMonthKeySafe(selectedDate) === contabilidadMonth) {
      asOfDate = selectedDate;
    } else if (contabilidadMonth < mesActual) {
      const [y, m] = contabilidadMonth.split("-").map(Number);
      asOfDate = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
    } else if (contabilidadMonth > mesActual) {
      return { esperadoTotal, ganadoHasta: 0, esperadoRestante: esperadoTotal, asOfDate: null as string | null };
    }

    const ganadoHasta = cobros
      .filter((c) => {
        if (!c.paid) return false;
        let fechaContable: string;
        if (c.accountingRecordId) {
          const rec = recordsById.get(c.accountingRecordId);
          if (!rec) return false;
          fechaContable = getRecordDateStr(rec.date);
        } else {
          fechaContable = c.fechaCobro || c.dueDate;
        }
        if (getMonthKeySafe(fechaContable) !== contabilidadMonth) return false;
        return fechaContable <= asOfDate;
      })
      .reduce((sum, c) => sum + c.amount, 0);

    const esperadoRestante = Math.max(0, esperadoTotal - ganadoHasta);
    return { esperadoTotal, ganadoHasta, esperadoRestante, asOfDate };
  }, [cobros, contabilidadMonth, recordsById, selectedDate]);

  // Meses para formulario de cuotas recurrentes (desde hace 12 meses hasta +24)
  const cobroMonthOptions = useMemo(() => {
    const now = new Date();
    const options: string[] = [];
    for (let i = -12; i <= 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      options.push(getMonthKey(d));
    }
    return options;
  }, []);

  const cobroClients = useMemo(() => {
    const names = new Set(cobros.map((c) => c.clientName));
    return Array.from(names).sort();
  }, [cobros]);

  const filteredCobros = useMemo(() => {
    let list = [...cobros];
    if (cobroFilterClient) {
      list = list.filter((c) => c.clientName === cobroFilterClient);
    }
    list = list.filter((c) => getMonthKeySafe(c.dueDate) === contabilidadMonth);
    if (cobroFilterPaid === "paid") list = list.filter((c) => c.paid);
    if (cobroFilterPaid === "pending") list = list.filter((c) => !c.paid);
    if (cobroFilterOrigen) list = list.filter((c) => c.origen === cobroFilterOrigen);
    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [cobros, cobroFilterClient, contabilidadMonth, cobroFilterPaid, cobroFilterOrigen]);

  const totalCobrosFiltrados = useMemo(
    () => filteredCobros.reduce((sum, c) => sum + c.amount, 0),
    [filteredCobros],
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const remindersToday = useMemo(
    () => getRemindersToday(cobros),
    [cobros]
  );
  const remindersWeekBefore = useMemo(
    () => getRemindersWeekBefore(cobros),
    [cobros]
  );
  const statsToday = useMemo(
    () => getStatsToday(cobros),
    [cobros]
  );

  const handleAddSingleCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cobroAmount);
    if (!cobroClient.trim() || isNaN(amount) || amount <= 0) return;
    setCobroSubmitting(true);
    setCobroError("");
    try {
      const res = await fetch("/api/admin/cobros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: cobroClient.trim(),
          amount,
          dueDate: cobroDueDate,
          servicio: cobroServicio || undefined,
          origen: cobroOrigen,
          paid: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudo guardar.");
        return;
      }
      const d = new Date();
      setCobroClient("");
      setCobroAmount("");
      setCobroServicio("");
      setCobroOrigen("manual");
      setCobroDueDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al guardar.");
    } finally {
      setCobroSubmitting(false);
    }
  };

  const handleAddRecurrentCobros = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cobroAmount);
    const day = Math.min(31, Math.max(1, parseInt(cobroDayOfMonth, 10) || 1));
    const months = Math.min(60, Math.max(1, parseInt(cobroMonthsToGenerate, 10) || 12));
    if (!cobroClient.trim() || isNaN(amount) || amount <= 0) return;
    const [y, m] = cobroFromMonth.split("-").map(Number);
    const toInsert: {
      clientName: string;
      amount: number;
      dueDate: string;
      servicio?: string;
      origen: "manual" | "suscripcion_mp";
    }[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(y, m - 1 + i, Math.min(day, new Date(y, m + i, 0).getDate()));
      const dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const exists = cobros.some((c) => c.clientName === cobroClient.trim() && c.dueDate === dueDate);
      if (!exists) {
        toInsert.push({
          clientName: cobroClient.trim(),
          amount,
          dueDate,
          servicio: cobroServicio || undefined,
          origen: cobroOrigen,
        });
      }
    }
    if (toInsert.length === 0) {
      setCobroError("Todas las cuotas ya existen.");
      return;
    }
    setCobroSubmitting(true);
    setCobroError("");
    try {
      const res = await fetch("/api/admin/cobros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cobros: toInsert }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudieron guardar las cuotas.");
        return;
      }
      setCobroClient("");
      setCobroAmount("");
      setCobroServicio("");
      setCobroOrigen("manual");
      setCobroDayOfMonth("1");
      const now = new Date();
      setCobroFromMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
      setCobroMonthsToGenerate("12");
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al guardar.");
    } finally {
      setCobroSubmitting(false);
    }
  };

  const handleTogglePaid = async (c: Cobro) => {
    if (c.paid) {
      try {
        const res = await fetch(`/api/admin/cobros/${c.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paid: false }),
        });
        const data = await res.json();
        if (!res.ok) {
          setCobroError(data?.error || "No se pudo actualizar.");
          return;
        }
        fetchCobros();
      } catch (e: any) {
        setCobroError(e?.message || "Error al actualizar.");
      }
      return;
    }
    setPendingPaidCobro(c);
    setPaidFechaIngreso(todayYmd());
  };

  const handleConfirmMarkPaid = async () => {
    if (!pendingPaidCobro) return;
    try {
      const res = await fetch(`/api/admin/cobros/${pendingPaidCobro.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: true, fechaIngreso: paidFechaIngreso }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudo actualizar.");
        return;
      }
      setPendingPaidCobro(null);
      setPaidFechaIngreso("");
      fetchCobros();
      fetchRecords();
    } catch (e: any) {
      setCobroError(e?.message || "Error al actualizar.");
    }
  };

  const handleToggleEstadisticas = async (c: Cobro) => {
    try {
      const res = await fetch(`/api/admin/cobros/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estadisticasEnviadas: !c.estadisticasEnviadas }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudo actualizar.");
        return;
      }
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al actualizar.");
    }
  };

  const handleToggleRecordatorio = async (c: Cobro) => {
    try {
      const res = await fetch(`/api/admin/cobros/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordatorioEnviado: !c.recordatorioEnviado }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudo actualizar.");
        return;
      }
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al actualizar.");
    }
  };

  const handleEditCobro = (c: Cobro) => {
    setEditingCobro(c);
    setEditCobroAmount(String(c.amount));
    setEditCobroServicio(c.servicio || "");
    setEditCobroDueDate(c.dueDate);
    setEditCobroUpdateFuture(false);
  };

  const handleCancelEditCobro = () => {
    setEditingCobro(null);
    setEditCobroAmount("");
    setEditCobroServicio("");
    setEditCobroDueDate("");
    setEditCobroUpdateFuture(false);
  };

  const handleSaveEditCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCobro) return;
    const newAmount = parseFloat(editCobroAmount);
    if (isNaN(newAmount) || newAmount <= 0) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editCobroDueDate)) {
      setCobroError("La fecha debe tener formato YYYY-MM-DD.");
      return;
    }
    setCobroSubmitting(true);
    setCobroError("");
    try {
      const res = await fetch(`/api/admin/cobros/${editingCobro.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: newAmount,
          servicio: editCobroServicio || undefined,
          dueDate: editCobroDueDate,
          updateFuture: editCobroUpdateFuture,
          clientName: editCobroUpdateFuture ? editingCobro.clientName : undefined,
          dueDateFrom: editCobroUpdateFuture ? editingCobro.dueDate : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudo actualizar.");
        return;
      }
      setEditingCobro(null);
      setEditCobroAmount("");
      setEditCobroServicio("");
      setEditCobroDueDate("");
      setEditCobroUpdateFuture(false);
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al actualizar.");
    } finally {
      setCobroSubmitting(false);
    }
  };

  const handleDeleteCobro = async (c: Cobro) => {
    if (!window.confirm(`¿Eliminar cuota de ${c.clientName} - ${formatLocalDate(c.dueDate)} - $${c.amount.toLocaleString("es-AR")}?`)) return;
    try {
      const res = await fetch(`/api/admin/cobros/${c.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudo eliminar.");
        return;
      }
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al eliminar.");
    }
  };

  const handleDeleteAllCobrosOfClient = async (clientName: string) => {
    if (!window.confirm(`¿Eliminar todas las cuotas de ${clientName}?`)) return;
    try {
      const res = await fetch(`/api/admin/cobros?client=${encodeURIComponent(clientName)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setCobroError(data?.error || "No se pudieron eliminar.");
        return;
      }
      setCobroFilterClient("");
      fetchCobros();
    } catch (e: any) {
      setCobroError(e?.message || "Error al eliminar.");
    }
  };

  const totalIngresos = filteredRecords
    .filter((r) => r.type === "ingreso")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalGastos = filteredRecords
    .filter((r) => r.type === "gasto")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalInversion = filteredRecords
    .filter((r) => r.type === "inversion")
    .reduce((sum, r) => sum + r.amount, 0);
  const resultado = totalIngresos - totalGastos - totalInversion;

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString("es-AR")} ARS`;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin</h1>
          {isContabilidadPwa ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-1 pl-3">
              <div className="flex min-w-0 items-center gap-2">
                <FolderKanban className="h-5 w-5 shrink-0 text-[#84b9ed]" aria-hidden />
                <span className="truncate text-sm font-semibold text-slate-900">Contabilidad</span>
              </div>
              <Link
                href="/admin92"
                className="shrink-0 rounded-md px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                Panel completo
              </Link>
            </div>
          ) : (
            <div className="flex w-full rounded-lg border border-slate-200 p-1 overflow-x-auto sm:overflow-x-visible">
              <button
                type="button"
                onClick={() => setActiveTab("webhooks")}
                className={`rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "webhooks"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Webhooks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contabilidad")}
                className={`rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "contabilidad"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Contabilidad
              </button>
              <Link
                href="/admin92/contabilidad"
                className="rounded-md px-2 sm:px-3 py-2 text-xs font-medium text-[#84b9ed] hover:bg-slate-100 whitespace-nowrap self-center"
                title="Abrir en vista app (ideal para instalar acceso directo)"
              >
                App contabilidad
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab("suscripciones")}
                className={`rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "suscripciones"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Suscripciones
              </button>
              <Link
                href="/admin92/proyectos"
                className="rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-slate-600 hover:bg-slate-100"
              >
                <FolderKanban className="w-4 h-4" />
                Proyectos
              </Link>
            </div>
          )}
        </div>

        {activeTab === "webhooks" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-slate-600">
                  Fuente: <span className="font-semibold text-slate-900">{source}</span>
                </p>
                <select
                  value={webhookProviderFilter}
                  onChange={(e) => setWebhookProviderFilter(e.target.value as "all" | "mp" | "resend")}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                >
                  <option value="all">Todos (MP + Resend)</option>
                  <option value="mp">Mercado Pago</option>
                  <option value="resend">Resend</option>
                </select>
                <select
                  value={webhookTypeFilter}
                  onChange={(e) => setWebhookTypeFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                >
                  <option value="">Todos los tipos</option>
                  {webhookProviderFilter !== "resend" && (
                    <>
                      <option value="payment">MP: pagos (payment)</option>
                      <option value="subscription_preapproval">MP: preapproval</option>
                      <option value="subscription_authorized_payment">MP: pago autorizado</option>
                    </>
                  )}
                  {webhookProviderFilter !== "mp" && (
                    <>
                      <option value="email.sent">Resend: email.sent</option>
                      <option value="email.delivered">Resend: email.delivered</option>
                      <option value="email.failed">Resend: email.failed</option>
                      <option value="email.bounced">Resend: email.bounced</option>
                      <option value="email.opened">Resend: email.opened</option>
                      <option value="email.clicked">Resend: email.clicked</option>
                    </>
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={fetchEvents}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  loading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
                }`}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-semibold">Atención</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
                  {webhookProviderFilter === "resend"
                    ? "No hay eventos de Resend. Configurá el webhook en resend.com → Webhooks."
                    : webhookProviderFilter === "mp"
                      ? "No hay eventos de Mercado Pago. Probá el simulador o realizá una suscripción real."
                      : "No hay eventos aún."}
                </div>
              ) : (() => {
                const filtered = events.filter((evt) => {
                  if (!webhookTypeFilter) return true;
                  const t = evt.type ?? (evt.body as any)?.type ?? (evt.body as any)?.topic ?? evt.query?.type ?? "";
                  return t === webhookTypeFilter;
                });
                return filtered.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
                    No hay eventos con el filtro seleccionado. Probá otro tipo o "Todos los tipos".
                  </div>
                ) : (
                filtered.map((evt, idx) => (
                  <details
                    key={`${evt.provider}-${evt.receivedAt}-${idx}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium mr-2 ${evt.provider === "mp" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                              {evt.provider === "mp" ? "MP" : "Resend"}
                            </span>
                            {evt.path}{" "}
                            <span className="text-slate-500 font-normal">
                              • {new Date(evt.receivedAt).toLocaleString("es-AR")}
                            </span>
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {evt.provider === "mp" && (
                              <>
                                Firma:{" "}
                                <span className={evt.signatureVerified ? "text-green-600" : "text-amber-700"}>
                                  {evt.signatureVerified ? "verificada" : "no verificada"}
                                </span>
                                {" • "}
                              </>
                            )}
                            type:{" "}
                            <span className="font-mono">{evt.type ?? (evt.body as any)?.type ?? (evt.body as any)?.topic ?? "—"}</span>
                            {evt.provider === "mp" && evt.summary?.amount != null && (
                              <>
                                {" • "}
                                <span className="font-semibold text-slate-900">
                                  ${evt.summary.amount.toLocaleString("es-AR")} {evt.summary.currency || "ARS"}
                                </span>
                              </>
                            )}
                            {evt.provider === "mp" && evt.summary?.payerEmail && (
                              <>
                                {" • "}
                                <span className="text-slate-500 truncate max-w-[120px] inline-block align-bottom" title={evt.summary.payerEmail}>
                                  {evt.summary.payerEmail}
                                </span>
                              </>
                            )}
                            {evt.provider === "resend" && (evt.body as any)?.data && (
                              <>
                                {" • "}
                                <span className="text-slate-500 truncate" title={(evt.body as any).data.to?.join?.(", ") ?? (evt.body as any).data.to}>
                                  to: {(Array.isArray((evt.body as any).data.to) ? (evt.body as any).data.to[0] : (evt.body as any).data.to) ?? "—"}
                                </span>
                                {(evt.body as any).data.subject && (
                                  <span className="text-slate-500 truncate max-w-[150px] inline-block align-bottom" title={(evt.body as any).data.subject}>
                                    {" • "}{(evt.body as any).data.subject}
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 group-open:hidden">Ver</span>
                        <span className="text-xs text-slate-500 hidden group-open:inline">Cerrar</span>
                      </div>
                    </summary>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {evt.provider === "mp" && evt.summary && (evt.summary.amount != null || evt.summary.payerEmail || evt.summary.status) && (
                        <div className="rounded-xl border border-[#84b9ed]/30 bg-[#84b9ed]/5 p-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Resumen (MP)</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {evt.summary.amount != null && (
                              <span>
                                <strong>Monto:</strong> ${evt.summary.amount.toLocaleString("es-AR")} {evt.summary.currency || "ARS"}
                              </span>
                            )}
                            {evt.summary.payerEmail && (
                              <span>
                                <strong>Email:</strong> {evt.summary.payerEmail}
                              </span>
                            )}
                            {evt.summary.status && (
                              <span>
                                <strong>Estado:</strong> {evt.summary.status}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {evt.provider === "resend" && (evt.body as any)?.data && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Resumen (Resend)</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {(evt.body as any).data.from && (
                              <span><strong>From:</strong> {(evt.body as any).data.from}</span>
                            )}
                            {(evt.body as any).data.to && (
                              <span><strong>To:</strong> {Array.isArray((evt.body as any).data.to) ? (evt.body as any).data.to.join(", ") : (evt.body as any).data.to}</span>
                            )}
                            {(evt.body as any).data.subject && (
                              <span><strong>Subject:</strong> {(evt.body as any).data.subject}</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Query</p>
                        <pre className="text-xs overflow-auto text-slate-800">
                          {JSON.stringify(evt.query ?? {}, null, 2)}
                        </pre>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Headers</p>
                        <pre className="text-xs overflow-auto text-slate-800">
                          {JSON.stringify(evt.headers, null, 2)}
                        </pre>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Body</p>
                        <pre className="text-xs overflow-auto text-slate-800">
                          {JSON.stringify(evt.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                ))
                );
              })()}
            </div>
          </>
        )}

        {activeTab === "contabilidad" && (
          <div className="space-y-8">
            {/* Mes activo (sincronizado con el calendario) */}
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                {formatMonthLabel(contabilidadMonth)}
              </h2>
              <span className="text-sm text-slate-500">
                {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""} · {filteredCobros.length} cuota{filteredCobros.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Resumen contable */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Real contable</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-green-50/50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Ingresos</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalIngresos)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-red-50/50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Gastos</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalGastos)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-blue-50/50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Inversión</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(totalInversion)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Resultado</p>
                <p className={`text-xl font-bold ${resultado >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(resultado)}
                </p>
              </div>
              </div>
            </div>

            {/* Cobranza del mes */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Cobranza del mes</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-4">
                  <p className="text-xs font-medium text-slate-600 mb-1">Esperado</p>
                  <p className="text-xl font-bold text-amber-800">{formatCurrency(cobranzaKpis.esperado)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-green-50/40 p-4">
                  <p className="text-xs font-medium text-slate-600 mb-1">Cobrado</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(cobranzaKpis.cobrado)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-red-50/40 p-4">
                  <p className="text-xs font-medium text-slate-600 mb-1">Pendiente</p>
                  <p className="text-xl font-bold text-red-700">{formatCurrency(cobranzaKpis.pendiente)}</p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingRecord ? "Editar registro" : "Nuevo registro"}
                  </h2>
                  {!editingRecord && (
                    <button
                      type="button"
                      onClick={() => setShowNewRecordForm((v) => !v)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {showNewRecordForm ? "Ocultar formulario" : "Ver formulario"}
                    </button>
                  )}
                </div>
                {editingRecord && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              {!editingRecord && !showNewRecordForm ? null : (
                <form onSubmit={handleSubmitRecord} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as AccountingType)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    >
                      <option value="ingreso">Ingreso</option>
                      <option value="gasto">Gasto</option>
                      <option value="inversion">Inversión</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto (ARS)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="25000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Suscripción cliente X"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría (opcional)</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="Hosting, dominio, etc."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
                        submitting
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
                      }`}
                    >
                      {submitting
                        ? "Guardando..."
                        : editingRecord
                          ? "Guardar cambios"
                          : "Agregar"}
                    </button>
                  </div>
                </form>
              )}
              {accError && (
                <p className="mt-3 text-sm text-red-600">{accError}</p>
              )}
            </div>

            {/* Herramientas del calendario */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Herramientas</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "objetivos", label: "Objetivos" },
                    { id: "mantenimientos", label: "Mantenimientos" },
                    { id: "buscar-clientes", label: "Buscar clientes" },
                  ] as const
                ).map(({ id, label }) => {
                  const active = contabilidadToolPanel === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setContabilidadToolPanel((prev) => (prev === id ? null : id))}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? "border-[#84b9ed] bg-[#84b9ed]/10 text-[#4a7fb8] ring-2 ring-[#84b9ed]/30"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {contabilidadToolPanel === "objetivos" && (
                <HerramientasPanel
                  section="objetivos"
                  title="Objetivos"
                  monthKey={contabilidadMonth}
                  monthLabel={formatMonthLabel(contabilidadMonth)}
                  hint="Metas de ingreso, margen y cobranza del mes. Cada objetivo queda asociado al mes del calendario."
                />
              )}
              {contabilidadToolPanel === "mantenimientos" && (
                <HerramientasPanel
                  section="mantenimientos"
                  title="Mantenimientos"
                  hint="Contratos, servicios y tareas de mantenimiento de clientes."
                  wordOnlineUrl={WORD_ONLINE_URL || undefined}
                />
              )}
              {contabilidadToolPanel === "buscar-clientes" && (
                <HerramientasPanel
                  section="buscar-clientes"
                  title="Buscar clientes"
                  hint="Notas, criterios de búsqueda e ideas para el explorador de clientes."
                />
              )}
            </div>

            {/* Calendario */}
            <MonthCalendar
              month={contabilidadMonth}
              selectedDate={selectedDate}
              markers={calendarMarkers}
              onSelectDate={(date) => setSelectedDate((prev) => (prev === date ? null : date))}
              onPrevMonth={() => {
                setContabilidadMonth((m) => shiftMonth(m, -1));
                setSelectedDate(null);
              }}
              onNextMonth={() => {
                setContabilidadMonth((m) => shiftMonth(m, 1));
                setSelectedDate(null);
              }}
            />

            {/* Detalle del día / mes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedDate
                      ? `Movimientos del ${formatLocalDate(selectedDate)}`
                      : `Registros de ${formatMonthLabel(contabilidadMonth)}`}
                  </h2>
                  {cobranzaProgreso.esperadoTotal > 0 && (
                    <p className="mt-1.5 text-sm text-slate-600">
                      {selectedDate ? (
                        <>
                          Al {formatLocalDate(selectedDate)}:{" "}
                          <span className="font-medium text-green-700">
                            Ganado {formatCurrency(cobranzaProgreso.ganadoHasta)}
                          </span>
                          {" · "}
                          <span className="font-medium text-orange-700">
                            Se espera {formatCurrency(cobranzaProgreso.esperadoRestante)}
                          </span>
                        </>
                      ) : cobranzaProgreso.asOfDate ? (
                        <>
                          Ganado hasta el momento:{" "}
                          <span className="font-medium text-green-700">
                            {formatCurrency(cobranzaProgreso.ganadoHasta)}
                          </span>
                          {" · "}
                          Se espera ganar:{" "}
                          <span className="font-medium text-orange-700">
                            {formatCurrency(cobranzaProgreso.esperadoRestante)}
                          </span>
                          <span className="text-slate-400">
                            {" "}(total mes {formatCurrency(cobranzaProgreso.esperadoTotal)})
                          </span>
                        </>
                      ) : (
                        <>
                          Se espera ganar:{" "}
                          <span className="font-medium text-orange-700">
                            {formatCurrency(cobranzaProgreso.esperadoRestante)}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={fetchRecords}
                  disabled={accLoading}
                  className="text-sm font-medium text-[#84b9ed] hover:text-[#6ba3d9] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {accLoading ? "Cargando..." : "Actualizar"}
                </button>
              </div>

              {accLoading && records.length === 0 && cobroLoading && cobros.length === 0 ? (
                <p className="text-slate-600 py-8 text-center">Cargando...</p>
              ) : dayRecords.length === 0 && dayCuotasPendientes.length === 0 ? (
                <p className="text-slate-600 py-8 text-center">
                  {selectedDate
                    ? "No hay movimientos ni cuotas esperadas este día."
                    : `No hay registros ni cuotas pendientes para ${formatMonthLabel(contabilidadMonth)}.`}
                </p>
              ) : (
                <div className="space-y-6">
                  {dayCuotasPendientes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3">
                        {selectedDate ? "Cuotas esperadas" : "Cuotas pendientes del mes"}
                      </h3>
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-2 px-2 font-semibold text-slate-700">Vencimiento</th>
                              <th className="text-left py-2 px-2 font-semibold text-slate-700">Tipo</th>
                              <th className="text-left py-2 px-2 font-semibold text-slate-700">Descripción</th>
                              <th className="text-left py-2 px-2 font-semibold text-slate-700">Origen</th>
                              <th className="text-right py-2 px-2 font-semibold text-slate-700">Monto</th>
                              <th className="text-right py-2 px-2 font-semibold text-slate-700">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dayCuotasPendientes.map((c) => (
                              <tr key={c.id} className="border-b border-orange-100 bg-orange-50/30 hover:bg-orange-50/50">
                                <td className="py-2.5 px-2 text-slate-600">{formatLocalDate(c.dueDate)}</td>
                                <td className="py-2.5 px-2">
                                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                                    Cuota esperada
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-slate-900">{cuotaEsperadaLabel(c)}</td>
                                <td className="py-2.5 px-2 text-slate-500">
                                  {c.origen === "suscripcion_mp" ? "Suscripción MP" : "Manual"}
                                </td>
                                <td className="py-2.5 px-2 text-right font-medium text-orange-700">
                                  {formatCurrency(c.amount)}
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePaid(c)}
                                    className="rounded-lg border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-100 cursor-pointer"
                                  >
                                    Marcar pagada
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="sm:hidden space-y-2">
                        {dayCuotasPendientes.map((c) => (
                          <div key={c.id} className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                                Cuota esperada
                              </span>
                              <span className="text-sm font-semibold text-orange-700">{formatCurrency(c.amount)}</span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-900">{cuotaEsperadaLabel(c)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Vence {formatLocalDate(c.dueDate)} · {c.origen === "suscripcion_mp" ? "Suscripción MP" : "Manual"}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(c)}
                              className="mt-2 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100 cursor-pointer"
                            >
                              Marcar pagada
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dayRecords.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3">Registros contables</h3>
                      <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-2 font-semibold text-slate-700">Fecha</th>
                            <th className="text-left py-3 px-2 font-semibold text-slate-700">Tipo</th>
                            <th className="text-left py-3 px-2 font-semibold text-slate-700">Descripción</th>
                            <th className="text-left py-3 px-2 font-semibold text-slate-700">Categoría</th>
                            <th className="text-right py-3 px-2 font-semibold text-slate-700">Monto</th>
                            <th className="text-right py-3 px-2 font-semibold text-slate-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayRecords.map((r) => (
                            <tr
                              key={r._id || r.createdAt}
                              className="border-b border-slate-100 hover:bg-slate-50/50"
                            >
                              <td className="py-3 px-2 text-slate-600">
                                {new Date(r.date).toLocaleDateString("es-AR")}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[r.type]}`}
                                >
                                  {typeLabels[r.type]}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-slate-900">{r.description}</td>
                              <td className="py-3 px-2 text-slate-500">{r.category || "—"}</td>
                              <td className="py-3 px-2 text-right font-medium">
                                <span
                                  className={
                                    r.type === "gasto" || r.type === "inversion"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }
                                >
                                  {r.type === "gasto" || r.type === "inversion" ? "-" : "+"}
                                  {formatCurrency(r.amount)}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(r)}
                                    title="Editar"
                                    aria-label="Editar"
                                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#84b9ed] transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(r)}
                                    title="Eliminar"
                                    aria-label="Eliminar"
                                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile: cards */}
                    <div className="sm:hidden space-y-2">
                      {dayRecords.map((r) => (
                        <div
                          key={r._id || r.createdAt}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-slate-500">Fecha</p>
                              <p className="text-sm font-medium text-slate-900">
                                {new Date(r.date).toLocaleDateString("es-AR")}
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[r.type]}`}
                            >
                              {typeLabels[r.type]}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            <div>
                              <p className="text-xs text-slate-500">Descripción</p>
                              <p className="text-sm text-slate-900">{r.description}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Categoría</p>
                              <p className="text-sm text-slate-600">{r.category || "—"}</p>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs text-slate-500">Monto</p>
                              <p
                                className={`text-sm font-semibold ${
                                  r.type === "gasto" || r.type === "inversion"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {r.type === "gasto" || r.type === "inversion" ? "-" : "+"}
                                {formatCurrency(r.amount)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(r)}
                              title="Editar"
                              aria-label="Editar"
                              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#84b9ed] transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r)}
                              title="Eliminar"
                              aria-label="Eliminar"
                              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cuotas del mes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Cuotas del mes</h2>
                <div className="flex items-center gap-3">
                  {WORD_ONLINE_URL ? (
                    <a
                      href={WORD_ONLINE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[#84b9ed]" aria-hidden />
                      Word online
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={fetchCobros}
                    disabled={cobroLoading}
                    className="text-sm font-medium text-[#84b9ed] hover:text-[#6ba3d9] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {cobroLoading ? "Cargando..." : "Actualizar"}
                  </button>
                </div>
              </div>
              {cobroError && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                  {cobroError}
                </div>
              )}

              {/* Reglas del flujo */}
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Reglas:</span> Día 0 = vence · +2/+3 = recordatorio · +5 = estadísticas (solo si pagado)
              </div>

              {/* Tabs: Cuota única / Cuotas recurrentes / Acciones de hoy */}
              <div className="flex rounded-lg border border-slate-200 p-1 mb-4 w-fit flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setCobroFormMode("single")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    cobroFormMode === "single" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cuota única
                </button>
                <button
                  type="button"
                  onClick={() => setCobroFormMode("recurrent")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    cobroFormMode === "recurrent" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cuotas recurrentes
                </button>
                <button
                  type="button"
                  onClick={() => setCobroFormMode("actions")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    cobroFormMode === "actions" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Acciones de hoy
                  {(remindersToday.length + remindersWeekBefore.length + statsToday.length) > 0 && (
                    <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs ${cobroFormMode === "actions" ? "bg-white/20" : "bg-amber-100 text-amber-800"}`}>
                      {remindersToday.length + remindersWeekBefore.length + statsToday.length}
                    </span>
                  )}
                </button>
              </div>

              {cobroFormMode === "actions" ? (
                /* Vista Acciones de hoy */
                <div className="space-y-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                      <h3 className="text-sm font-semibold text-amber-900 mb-2">Recordatorio de pago (día +2 o +3 · −7 Florencia)</h3>
                      <p className="text-xs text-amber-800/80 mb-3">Enviar por WhatsApp a clientes con cuota pendiente</p>
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-amber-900">Mensaje guardado</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(MENSAJE_RECORDATORIO_PAGO, "recordatorio-plantilla")}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 hover:bg-amber-300 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === "recordatorio-plantilla" ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap rounded-lg bg-white/60 p-3 text-slate-800 text-xs border border-amber-200/50">
                          {MENSAJE_RECORDATORIO_PAGO}
                        </pre>
                        <p className="text-xs text-amber-700/80 mt-1">(__MONTO__ se reemplaza por el monto de cada cliente)</p>
                      </div>
                      {remindersToday.length === 0 ? (
                        <p className="text-sm text-amber-700/70">Nada para hoy</p>
                      ) : (
                        <ul className="space-y-4">
                          {remindersToday.map((c) => {
                            const mensaje = formatRecordatorioMensaje(c.amount);
                            return (
                              <li key={c.id} className="text-sm">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-medium text-slate-900">{c.clientName}</span>
                                  <span className="text-slate-600">{c.servicio || "—"}</span>
                                  <span className="text-slate-600">{formatLocalDate(c.dueDate)}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(mensaje, `recordatorio-${c.id}`)}
                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 hover:bg-amber-300 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    {copiedId === `recordatorio-${c.id}` ? "Copiado" : "Copiar"}
                                  </button>
                                </div>
                                <pre className="whitespace-pre-wrap rounded-lg bg-white/60 p-3 text-slate-800 text-xs border border-amber-200/50">
                                  {mensaje}
                                </pre>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {remindersWeekBefore.length > 0 && (
                        <>
                          <h4 className="text-xs font-semibold text-amber-800 mt-4 mb-2">Recordatorio semana anterior (−7 Florencia)</h4>
                          <ul className="space-y-4">
                            {remindersWeekBefore.map((c) => {
                              const mensaje = formatRecordatorioMensaje(c.amount);
                              return (
                                <li key={c.id} className="text-sm">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-medium text-slate-900">{c.clientName}</span>
                                    <span className="text-slate-600">{c.servicio || "—"}</span>
                                    <span className="text-slate-600">{formatLocalDate(c.dueDate)}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(mensaje, `recordatorio-wb-${c.id}`)}
                                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 hover:bg-amber-300 cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                      {copiedId === `recordatorio-wb-${c.id}` ? "Copiado" : "Copiar"}
                                    </button>
                                  </div>
                                  <pre className="whitespace-pre-wrap rounded-lg bg-white/60 p-3 text-slate-800 text-xs border border-amber-200/50">
                                    {mensaje}
                                  </pre>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">Estadísticas (día +5, pagados)</h3>
                      <p className="text-xs text-blue-800/80 mb-3">Enviar imágenes por WhatsApp</p>
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-900">Mensaje guardado</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(MENSAJE_ESTADISTICAS, "estadisticas")}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-blue-200 text-blue-900 hover:bg-blue-300 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === "estadisticas" ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap rounded-lg bg-white/60 p-3 text-slate-800 text-xs border border-blue-200/50">
                          {MENSAJE_ESTADISTICAS}
                        </pre>
                      </div>
                      {statsToday.length === 0 ? (
                        <p className="text-sm text-blue-700/70">Nada para hoy</p>
                      ) : (
                        <ul className="space-y-2">
                          {statsToday.map((c) => (
                            <li key={c.id} className="text-sm text-slate-800 flex flex-wrap gap-x-2 gap-y-0.5">
                              <span className="font-medium">{c.clientName}</span>
                              <span className="text-slate-600">·</span>
                              <span>{c.servicio || "—"}</span>
                              <span className="text-slate-600">·</span>
                              <span>{formatLocalDate(c.dueDate)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ) : cobroFormMode === "single" ? (
                <div className="mb-6">
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setShowSingleCobroForm((v) => !v)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {showSingleCobroForm ? "Ocultar formulario" : "Ver formulario"}
                    </button>
                  </div>
                  {!showSingleCobroForm ? null : (
                    <form onSubmit={handleAddSingleCobro} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                        <input
                          type="text"
                          value={cobroClient}
                          onChange={(e) => setCobroClient(e.target.value)}
                          placeholder="Nombre del cliente"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
                        <select
                          value={cobroServicio}
                          onChange={(e) => setCobroServicio(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                        >
                          {SERVICIO_OPTIONS.map((opt) => (
                            <option key={opt || "vacio"} value={opt}>{opt || "—"}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                        <select
                          value={cobroOrigen}
                          onChange={(e) => setCobroOrigen(e.target.value as "manual" | "suscripcion_mp")}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                        >
                          <option value="manual">Manual</option>
                          <option value="suscripcion_mp">Suscripción MP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Monto (ARS)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={cobroAmount}
                          onChange={(e) => setCobroAmount(e.target.value)}
                          placeholder="20000"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de cobro</label>
                        <input
                          type="date"
                          value={cobroDueDate}
                          onChange={(e) => setCobroDueDate(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={cobroSubmitting}
                          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                            cobroSubmitting ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9]"
                          }`}
                        >
                          {cobroSubmitting ? "Guardando..." : "Agregar"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAddRecurrentCobros} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <input
                      type="text"
                      value={cobroClient}
                      onChange={(e) => setCobroClient(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
                    <select
                      value={cobroServicio}
                      onChange={(e) => setCobroServicio(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                    >
                      {SERVICIO_OPTIONS.map((opt) => (
                        <option key={opt || "vacio"} value={opt}>{opt || "—"}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                    <select
                      value={cobroOrigen}
                      onChange={(e) => setCobroOrigen(e.target.value as "manual" | "suscripcion_mp")}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                    >
                      <option value="manual">Manual</option>
                      <option value="suscripcion_mp">Suscripción MP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto (ARS)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={cobroAmount}
                      onChange={(e) => setCobroAmount(e.target.value)}
                      placeholder="20000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Día del mes</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={cobroDayOfMonth}
                      onChange={(e) => setCobroDayOfMonth(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Desde mes</label>
                    <select
                      value={cobroFromMonth}
                      onChange={(e) => setCobroFromMonth(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                    >
                      {cobroMonthOptions.map((ym) => (
                        <option key={ym} value={ym}>
                          {formatMonthLabel(ym)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cant. meses</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={cobroMonthsToGenerate}
                      onChange={(e) => setCobroMonthsToGenerate(e.target.value)}
                      placeholder="12"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={cobroSubmitting}
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                        cobroSubmitting ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9]"
                      }`}
                    >
                      {cobroSubmitting ? "Guardando..." : "Generar cuotas"}
                    </button>
                  </div>
                </form>
              )}

              {/* Modal/panel de edición - solo en vista tabla */}
              {cobroFormMode !== "actions" && editingCobro && (
                <div className="mb-6 rounded-xl border border-[#84b9ed]/40 bg-[#84b9ed]/5 p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-3">
                    Editar cuota: {editingCobro.clientName} - {formatLocalDate(editingCobro.dueDate)}
                  </p>
                  <form onSubmit={handleSaveEditCobro} className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Monto (ARS)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={editCobroAmount}
                        onChange={(e) => setEditCobroAmount(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent w-32"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Servicio</label>
                      <select
                        value={editCobroServicio}
                        onChange={(e) => setEditCobroServicio(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                      >
                        {SERVICIO_OPTIONS.map((opt) => (
                          <option key={opt || "vacio"} value={opt}>{opt || "—"}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={editCobroDueDate}
                        onChange={(e) => setEditCobroDueDate(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCobroUpdateFuture}
                        onChange={(e) => setEditCobroUpdateFuture(e.target.checked)}
                        className="rounded border-slate-300 text-[#84b9ed] focus:ring-[#84b9ed]"
                      />
                      <span className="text-sm text-slate-700">Actualizar cuotas futuras pendientes de este cliente</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={cobroSubmitting}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer ${
                          cobroSubmitting ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9]"
                        }`}
                      >
                        {cobroSubmitting ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditCobro}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Filtros - ocultos en Acciones de hoy */}
              {cobroFormMode !== "actions" && (
                <>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <label className="text-sm font-medium text-slate-700">Filtros:</label>
                    <select
                      value={cobroFilterClient}
                      onChange={(e) => setCobroFilterClient(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent min-w-[140px] cursor-pointer"
                    >
                      <option value="">Todos los clientes</option>
                      {cobroClients.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={cobroFilterPaid}
                      onChange={(e) => setCobroFilterPaid(e.target.value as "" | "paid" | "pending")}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent min-w-[120px] cursor-pointer"
                    >
                      <option value="">Todos</option>
                      <option value="paid">Pagados</option>
                      <option value="pending">Pendientes</option>
                    </select>
                    <select
                      value={cobroFilterOrigen}
                      onChange={(e) => setCobroFilterOrigen(e.target.value as "" | "manual" | "suscripcion_mp")}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent min-w-[160px] cursor-pointer"
                    >
                      <option value="">Todos los orígenes</option>
                      <option value="manual">Manual</option>
                      <option value="suscripcion_mp">Suscripción MP</option>
                    </select>
                    {cobroFilterClient && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAllCobrosOfClient(cobroFilterClient)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Eliminar todas las cuotas de {cobroFilterClient}
                      </button>
                    )}
                  </div>
                  <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium">Total listado:</span>{" "}
                    <span className="font-semibold text-slate-900">{formatCurrency(totalCobrosFiltrados)}</span>
                    <span className="text-slate-500">{" "}· Mes: {formatMonthLabel(contabilidadMonth)}</span>
                  </div>
                </>
              )}

              {/* Confirmar pago con fecha del cobro */}
              {pendingPaidCobro && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50/60 p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Marcar pagada: {pendingPaidCobro.clientName} · {formatCurrency(pendingPaidCobro.amount)}
                  </p>
                  <p className="text-xs text-slate-600 mb-3">
                    Vencía el {formatLocalDate(pendingPaidCobro.dueDate)}. El ingreso contable usa la{" "}
                    <span className="font-medium">fecha de cobro</span>, no la de vencimiento.
                  </p>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Vencimiento</label>
                      <p className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700">
                        {formatLocalDate(pendingPaidCobro.dueDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Fecha del cobro</label>
                      <input
                        type="date"
                        value={paidFechaIngreso}
                        onChange={(e) => setPaidFechaIngreso(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 pb-0.5">
                      <button
                        type="button"
                        onClick={() => setPaidFechaIngreso(todayYmd())}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaidFechaIngreso(pendingPaidCobro.dueDate)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Mismo día del vencimiento
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirmMarkPaid}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 cursor-pointer"
                    >
                      Confirmar pago
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPendingPaidCobro(null); setPaidFechaIngreso(""); }}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla de cuotas - oculta en Acciones de hoy */}
              {cobroFormMode !== "actions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-semibold text-slate-700">Cliente</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700">Servicio</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700">Origen</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700">Fecha</th>
                      <th className="text-right py-3 px-2 font-semibold text-slate-700">Monto</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-700">Pagado</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-700">Recordatorio</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-700">Estadísticas</th>
                      <th className="text-right py-3 px-2 font-semibold text-slate-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobroLoading && cobros.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500">
                          Cargando...
                        </td>
                      </tr>
                    ) : filteredCobros.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500">
                          No hay cuotas. Agregá una cuota única o generá cuotas recurrentes.
                        </td>
                      </tr>
                    ) : (
                      filteredCobros.map((c) => (
                        <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50/50 ${c.paid ? "bg-green-50/30" : ""}`}>
                          <td className="py-3 px-2 font-medium text-slate-900">{c.clientName}</td>
                          <td className="py-3 px-2 text-slate-600">{c.servicio || "—"}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                c.origen === "suscripcion_mp" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {c.origen === "suscripcion_mp" ? "Suscripción MP" : "Manual"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{formatLocalDate(c.dueDate)}</td>
                          <td className="py-3 px-2 text-right font-medium text-slate-900">{formatCurrency(c.amount)}</td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(c)}
                              title={c.paid ? "Marcar como pendiente" : "Marcar como pagado"}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-colors cursor-pointer ${
                                c.paid
                                  ? "border-green-500 bg-green-100 text-green-700 hover:bg-green-200"
                                  : "border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50"
                              }`}
                            >
                              {c.paid ? <Check className="w-4 h-4" /> : null}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRecordatorio(c)}
                              title={
                                c.recordatorioEnviado
                                  ? "Marcar recordatorio no enviado"
                                  : "Marcar recordatorio enviado"
                              }
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-colors cursor-pointer ${
                                c.recordatorioEnviado
                                  ? "border-amber-500 bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : "border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50"
                              }`}
                            >
                              {c.recordatorioEnviado ? <Check className="w-4 h-4" /> : null}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleEstadisticas(c)}
                              title={c.estadisticasEnviadas ? "Marcar como no enviadas" : "Marcar estadísticas enviadas"}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-colors cursor-pointer ${
                                c.estadisticasEnviadas
                                  ? "border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50"
                              }`}
                            >
                              {c.estadisticasEnviadas ? <Check className="w-4 h-4" /> : null}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditCobro(c)}
                                title="Editar"
                                aria-label="Editar"
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#84b9ed] transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCobro(c)}
                                title="Eliminar"
                                aria-label="Eliminar"
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "suscripciones" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Asigná el <strong>Property ID</strong> de GA4 a cada suscripción para que el cliente vea estadísticas reales en Mi cuenta.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  Pendientes: {pendingSubscriptionsCount}
                </span>
                <button
                  type="button"
                  onClick={fetchSubscriptions}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    subLoading ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
                  }`}
                  disabled={subLoading}
                >
                  {subLoading ? "Cargando..." : "Actualizar"}
                </button>
              </div>
            </div>

            {(subError || searchParams.get("impersonate") === "error" || searchParams.get("impersonate") === "notfound") && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm">
                  {searchParams.get("impersonate") === "notfound"
                    ? "Suscripción no encontrada o cancelada."
                    : searchParams.get("impersonate") === "error"
                      ? "Error al iniciar sesión como usuario."
                      : subError}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <label className="text-sm font-medium text-slate-700">Filtrar estado:</label>
                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value as "all" | "pending" | "authorized" | "other")}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendientes</option>
                  <option value="authorized">Autorizadas</option>
                  <option value="other">Otros estados</option>
                </select>
                <span className="text-xs text-slate-500">{filteredSubscriptions.length} suscripción(es)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">GA4 Property ID</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subLoading && subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          Cargando...
                        </td>
                      </tr>
                    ) : filteredSubscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No hay suscripciones para el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscriptions.map((s) => (
                        <tr key={s.preapprovalId} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-900">{s.email}</td>
                          <td className="py-3 px-4 text-slate-600">{s.plan}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                s.status === "authorized"
                                  ? "bg-green-100 text-green-800"
                                  : s.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {editingSub?.preapprovalId === s.preapprovalId ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editGa4PropertyId}
                                  onChange={(e) => setEditGa4PropertyId(e.target.value)}
                                  placeholder="Ej. 432109876"
                                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm w-40 focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveGa4PropertyId}
                                  disabled={subSaving}
                                  className="rounded-lg bg-[#84b9ed] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#6ba3d9] disabled:opacity-60 cursor-pointer"
                                >
                                  {subSaving ? "Guardando..." : "Guardar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setEditingSub(null); setEditGa4PropertyId(""); }}
                                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 font-mono">{s.ga4PropertyId || "—"}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editingSub?.preapprovalId === s.preapprovalId ? null : (
                              <div className="flex items-center justify-end gap-2">
                                {s.status === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(
                                        `Hola ${s.name || ""}, te escribo de Glomun.\nTu suscripción figura como pendiente en Mercado Pago y falta terminar la confirmación del medio de pago para activarla.\nCuando quieras te paso el enlace para completarlo.`,
                                        `sub-pending-${s.preapprovalId}`,
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 cursor-pointer"
                                    title="Copiar mensaje de seguimiento"
                                  >
                                    {copiedId === `sub-pending-${s.preapprovalId}` ? "Copiado" : "Copiar seguimiento"}
                                  </button>
                                )}
                                <a
                                  href={`/api/admin/impersonate?preapprovalId=${encodeURIComponent(s.preapprovalId)}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#84b9ed] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#6ba3d9]"
                                  title="Entrar a Mi cuenta como este usuario"
                                >
                                  Ver como usuario
                                </a>
                                <Link
                                  href={`/admin92/suscripciones/${encodeURIComponent(s.preapprovalId)}/metricas`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                  title="Cargar métricas de performance"
                                >
                                  Métricas
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSub(s);
                                    setEditGa4PropertyId(s.ga4PropertyId || "");
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                  {s.ga4PropertyId ? "Editar GA4" : "Asignar GA4"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Admin92Page() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </main>
    }>
      <Admin92PageContent />
    </Suspense>
  );
}
