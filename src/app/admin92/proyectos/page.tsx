"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, FolderKanban, GripVertical, BarChart3, X } from "lucide-react";

type ProyectoStatus =
  | "en_desarrollo"
  | "en_revision"
  | "en_produccion"
  | "archivado";

type Proyecto = {
  id: string;
  name: string;
  clientName: string;
  status: ProyectoStatus;
  type: string;
  fechaInicio: string;
  ultimaActualizacion?: string;
  /** Última solicitud puntual del cliente (ej. pedido de cambio) */
  ultimaSolicitud?: string;
  /** Prioridad/orden manual (0 = más prioritario) */
  prioridad?: number;
  notes?: string;
};

const TIPOS = ["App", "Tienda", "Web", "Mantenimiento", "Otro"] as const;

const STATUS_LABELS: Record<ProyectoStatus, string> = {
  en_desarrollo: "En desarrollo",
  en_revision: "En revisión",
  en_produccion: "En producción",
  archivado: "Archivado",
};

const STATUS_COLORS: Record<ProyectoStatus, string> = {
  en_desarrollo: "bg-amber-100 text-amber-800",
  en_revision: "bg-blue-100 text-blue-800",
  en_produccion: "bg-green-100 text-green-800",
  archivado: "bg-slate-100 text-slate-600",
};

function formatLocalDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR");
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type SortKey = "name" | "clientName" | "fechaInicio" | "ultimaActualizacion" | "status" | "prioridad";

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formType, setFormType] = useState("Web");
  const [formFechaInicio, setFormFechaInicio] = useState(todayStr);
  const [formUltimaActualizacion, setFormUltimaActualizacion] = useState("");
  const [formUltimaSolicitud, setFormUltimaSolicitud] = useState(todayStr);
  const [formStatus, setFormStatus] = useState<ProyectoStatus>("en_desarrollo");
  const [formNotes, setFormNotes] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editType, setEditType] = useState("Web");
  const [editFechaInicio, setEditFechaInicio] = useState("");
  const [editUltimaActualizacion, setEditUltimaActualizacion] = useState("");
  const [editUltimaSolicitud, setEditUltimaSolicitud] = useState("");
  const [editStatus, setEditStatus] = useState<ProyectoStatus>("en_desarrollo");
  const [editNotes, setEditNotes] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState<ProyectoStatus | "">("");
  const [sortBy, setSortBy] = useState<SortKey>("prioridad");
  const [sortDesc, setSortDesc] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const fetchProyectos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/proyectos", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar");
      setProyectos(Array.isArray(data.proyectos) ? data.proyectos : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  // Bloquea scroll de la página cuando el modal está abierto (móvil y desktop).
  useEffect(() => {
    if (!showAddModal) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyLeft = document.body.style.left;
    const prevBodyRight = document.body.style.right;
    const prevBodyWidth = document.body.style.width;

    const scrollY = window.scrollY;

    // Evita que el scroll ocurra aunque el navegador lo intente en mobile/touch.
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventTouchMove);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;
      document.body.style.width = prevBodyWidth;
      // Restaurar scroll donde estaba.
      window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
    };
  }, [showAddModal]);

  // Fallback para proyectos viejos sin `prioridad`: usamos el orden que devuelve Mongo
  // (ordenado por `ultimaActualizacion` + `createdAt` en `listProyectos`).
  const fallbackPriorityById = useMemo(() => {
    const map = new Map<string, number>();
    proyectos.forEach((p, idx) => map.set(p.id, idx));
    return map;
  }, [proyectos]);

  const getEffectivePriority = (p: Proyecto): number => {
    if (typeof p.prioridad === "number" && Number.isFinite(p.prioridad)) return p.prioridad;
    return fallbackPriorityById.get(p.id) ?? 0;
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...proyectos];
    if (filterStatus) {
      list = list.filter((p) => p.status === filterStatus);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "prioridad") {
        // 0 es el más prioritario
        cmp = getEffectivePriority(a) - getEffectivePriority(b);
      } else {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (typeof aVal === "string" && typeof bVal === "string") {
          cmp = aVal.localeCompare(bVal);
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
      }
      return sortDesc ? -cmp : cmp;
    });
    return list;
  }, [proyectos, filterStatus, sortBy, sortDesc, fallbackPriorityById]);

  const visibleProjects = filteredAndSorted;
  const visibleIds = visibleProjects.map((p) => p.id);
  const dragEnabled = sortBy === "prioridad" && !loading && editingId === null && !reordering && !showAddModal;

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!dragEnabled) return;
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const oldIndex = visibleIds.indexOf(activeId);
    const newIndex = visibleIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newVisibleIds = arrayMove(visibleIds, oldIndex, newIndex);

    // Orden global por prioridad efectiva (prioridad guardada o fallback)
    const globalOrder = [...proyectos].sort((a, b) => getEffectivePriority(a) - getEffectivePriority(b));
    const idToProject = new Map(globalOrder.map((p) => [p.id, p]));

    const visibleSet = new Set(visibleIds);
    const slotIndices = globalOrder
      .map((p, idx) => ({ id: p.id, idx }))
      .filter((x) => visibleSet.has(x.id))
      .map((x) => x.idx);

    const newGlobalOrder = [...globalOrder];
    for (let i = 0; i < newVisibleIds.length; i++) {
      const id = newVisibleIds[i];
      const slotIdx = slotIndices[i];
      const proj = idToProject.get(id);
      if (proj && typeof slotIdx === "number") {
        newGlobalOrder[slotIdx] = proj;
      }
    }

    const newPriorityById = new Map<string, number>();
    newGlobalOrder.forEach((p, idx) => newPriorityById.set(p.id, idx));

    setReordering(true);
    setError("");
    try {
      await Promise.all(
        newGlobalOrder.map((p) =>
          fetch(`/api/admin/proyectos/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prioridad: newPriorityById.get(p.id) }),
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              const msg = typeof data?.error === "string" ? data.error : "Error reordenando";
              throw new Error(msg);
            }
          }),
        ),
      );
      await fetchProyectos();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo reordenar");
    } finally {
      setReordering(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formClient.trim()) {
      setError("Nombre y cliente son requeridos.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          clientName: formClient.trim(),
          type: formType,
          fechaInicio: formFechaInicio,
          ultimaActualizacion: formUltimaActualizacion || undefined,
          ultimaSolicitud: formUltimaSolicitud,
          status: formStatus,
          notes: formNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setFormName("");
      setFormClient("");
      setFormNotes("");
      setFormFechaInicio(todayStr());
      setFormUltimaActualizacion("");
      setFormUltimaSolicitud(todayStr());
      setShowAddModal(false);
      fetchProyectos();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  function SortableProjectRow({ p }: { p: Proyecto }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: p.id, disabled: !dragEnabled });

    const style = {
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition,
    };

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={isDragging ? "bg-slate-50" : undefined}
      >
        <td className="py-3 px-2 w-10">
          <button
            type="button"
            aria-label="Reordenar proyecto"
            title="Arrastrá para cambiar prioridad"
            className={`p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 touch-none select-none ${
              !dragEnabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
            }`}
            {...attributes}
            {...listeners}
            disabled={!dragEnabled}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </td>
        <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
        <td className="py-3 px-4 text-slate-600">{p.clientName}</td>
        <td className="py-3 px-4 text-slate-600">{p.type}</td>
        <td className="py-3 px-4 text-slate-600">{formatLocalDate(p.fechaInicio)}</td>
        <td className="py-3 px-4 text-slate-600">{formatLocalDate(p.ultimaSolicitud || "")}</td>
        <td className="py-3 px-4 text-slate-600">{formatLocalDate(p.ultimaActualizacion || "")}</td>
        <td className="py-3 px-4">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
            {STATUS_LABELS[p.status]}
          </span>
        </td>
        <td className="py-3 px-4 text-slate-600 max-w-[120px] truncate" title={p.notes || ""}>
          {p.notes || "—"}
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1 flex-wrap">
            {p.status !== "en_produccion" && (
              <button
                type="button"
                onClick={() => handleChangeStatus(p.id, "en_produccion")}
                className="rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                title="Marcar en producción"
              >
                En producción
              </button>
            )}
            {p.status !== "archivado" && (
              <button
                type="button"
                onClick={() => handleChangeStatus(p.id, "archivado")}
                className="rounded px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                title="Archivar"
              >
                Archivar
              </button>
            )}
            <button
              type="button"
              onClick={() => handleStartEdit(p)}
              title="Editar"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#84b9ed] transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(p)}
              title="Eliminar"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const handleStartEdit = (p: Proyecto) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditClient(p.clientName);
    setEditType(p.type);
    setEditFechaInicio(p.fechaInicio);
    setEditUltimaActualizacion(p.ultimaActualizacion || "");
    setEditUltimaSolicitud(p.ultimaSolicitud || "");
    setEditStatus(p.status);
    setEditNotes(p.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editName.trim() || !editClient.trim()) {
      setError("Nombre y cliente son requeridos.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/proyectos/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          clientName: editClient.trim(),
          type: editType,
          fechaInicio: editFechaInicio,
          // Enviamos string (incluido vacío) para que backend pueda limpiar con $unset.
          ultimaActualizacion: editUltimaActualizacion,
          ultimaSolicitud: editUltimaSolicitud,
          status: editStatus,
          notes: editNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setEditingId(null);
      fetchProyectos();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (id: string, newStatus: ProyectoStatus) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/proyectos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ultimaActualizacion: todayStr(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      if (editingId === id) setEditingId(null);
      fetchProyectos();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Proyecto) => {
    if (!window.confirm(`¿Eliminar el proyecto "${p.name}" de ${p.clientName}?`)) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      if (editingId === p.id) setEditingId(null);
      fetchProyectos();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin</h1>
          <div className="flex w-full rounded-lg border border-slate-200 p-1 overflow-x-auto sm:overflow-x-visible">
            <Link
              href="/admin92?tab=webhooks"
              className="rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap text-slate-600 hover:bg-slate-100"
            >
              Webhooks
            </Link>
            <Link
              href="/admin92?tab=contabilidad"
              className="rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap text-slate-600 hover:bg-slate-100"
            >
              Contabilidad
            </Link>
            <Link
              href="/admin92?tab=suscripciones"
              className="rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-slate-600 hover:bg-slate-100"
            >
              <BarChart3 className="w-4 h-4" />
              Suscripciones
            </Link>
            <Link
              href="/admin92/proyectos"
              className="rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-slate-900 text-white"
            >
              <FolderKanban className="w-4 h-4" />
              Proyectos
            </Link>
          </div>
        </div>

        <div className="mb-6 flex items-start justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-[#84b9ed]" />
            Proyectos
          </h2>
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#84b9ed] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors cursor-pointer"
            >
              Nuevo proyecto
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Modal: Nuevo proyecto */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
              aria-hidden
            />
            <div className="relative w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Nuevo proyecto</h2>
              <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del desarrollo</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Tienda online"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProyectoStatus)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                  >
                    {(Object.entries(STATUS_LABELS) as [ProyectoStatus, string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={formFechaInicio}
                    onChange={(e) => setFormFechaInicio(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Última solicitud</label>
                  <input
                    type="date"
                    value={formUltimaSolicitud}
                    onChange={(e) => setFormUltimaSolicitud(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Última actualización</label>
                  <input
                    type="date"
                    value={formUltimaActualizacion}
                    onChange={(e) => setFormUltimaActualizacion(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                      submitting
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9]"
                    }`}
                  >
                    {submitting ? "Guardando..." : "Agregar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filtros y orden */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm font-medium text-slate-700">Filtrar por estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus((e.target.value || "") as ProyectoStatus | "")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent min-w-[140px] cursor-pointer"
          >
            <option value="">Todos</option>
            {(Object.entries(STATUS_LABELS) as [ProyectoStatus, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <label className="text-sm font-medium text-slate-700 ml-2">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              const next = e.target.value as SortKey;
              setSortBy(next);
              if (next === "prioridad") setSortDesc(false);
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent min-w-[160px] cursor-pointer"
          >
            <option value="prioridad">Prioridad</option>
            <option value="ultimaActualizacion">Última actualización</option>
            <option value="fechaInicio">Fecha inicio</option>
            <option value="name">Nombre</option>
            <option value="clientName">Cliente</option>
            <option value="status">Estado</option>
          </select>
          <button
            type="button"
            onClick={() => {
              if (sortBy === "prioridad") return;
              setSortDesc((d) => !d);
            }}
            disabled={sortBy === "prioridad"}
            className={`text-sm font-medium hover:text-slate-900 ${sortBy === "prioridad" ? "text-slate-300 cursor-not-allowed" : "text-slate-600"} `}
          >
            {sortDesc ? "↑ Desc" : "↑ Asc"}
          </button>
          <button
            type="button"
            onClick={fetchProyectos}
            disabled={loading}
            className="ml-auto text-sm font-medium text-[#84b9ed] hover:text-[#6ba3d9] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {loading && proyectos.length === 0 ? (
            <p className="py-12 text-center text-slate-500">Cargando...</p>
          ) : filteredAndSorted.length === 0 ? (
            <p className="py-12 text-center text-slate-500">
              No hay proyectos. Agregá uno con el formulario de arriba.
            </p>
          ) : (
            <div className="overflow-x-auto">
              {dragEnabled ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="w-10 py-3 px-2" />
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Proyecto</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Tipo</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha inicio</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Últ. solicitud</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Últ. actualización</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Notas</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
                        {visibleProjects.map((p) => (
                          <SortableProjectRow key={p.id} p={p} />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </DndContext>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-10 py-3 px-2" />
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Proyecto</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha inicio</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Últ. solicitud</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Últ. actualización</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Notas</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSorted.map((p) => (
                      <tr key={p.id}>
                        {editingId === p.id ? (
                          <td colSpan={10} className="p-4 bg-slate-50/80">
                            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Cliente</label>
                                <input
                                  type="text"
                                  value={editClient}
                                  onChange={(e) => setEditClient(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                                <select
                                  value={editType}
                                  onChange={(e) => setEditType(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm cursor-pointer"
                                >
                                  {TIPOS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as ProyectoStatus)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm cursor-pointer"
                                >
                                  {(Object.entries(STATUS_LABELS) as [ProyectoStatus, string][]).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Últ. solicitud</label>
                                <input
                                  type="date"
                                  value={editUltimaSolicitud}
                                  onChange={(e) => setEditUltimaSolicitud(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Últ. actualización</label>
                                <input
                                  type="date"
                                  value={editUltimaActualizacion}
                                  onChange={(e) => setEditUltimaActualizacion(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <button
                                  type="submit"
                                  disabled={submitting}
                                  className="rounded-lg px-4 py-2 text-sm font-semibold bg-[#84b9ed] text-white hover:bg-[#6ba3d9] disabled:opacity-50 cursor-pointer"
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha inicio</label>
                                <input
                                  type="date"
                                  value={editFechaInicio}
                                  onChange={(e) => setEditFechaInicio(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div className="sm:col-span-4">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                                <input
                                  type="text"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td className="py-3 px-2 w-10">
                              <button
                                type="button"
                                aria-label="Reordenar proyecto"
                                title="Elegí 'Prioridad' para reordenar"
                                className="p-2 rounded-lg text-slate-300 cursor-not-allowed"
                                disabled
                              >
                                <GripVertical className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
                            <td className="py-3 px-4 text-slate-600">{p.clientName}</td>
                            <td className="py-3 px-4 text-slate-600">{p.type}</td>
                            <td className="py-3 px-4 text-slate-600">{formatLocalDate(p.fechaInicio)}</td>
                            <td className="py-3 px-4 text-slate-600">{formatLocalDate(p.ultimaSolicitud || "")}</td>
                            <td className="py-3 px-4 text-slate-600">{formatLocalDate(p.ultimaActualizacion || "")}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}
                              >
                                {STATUS_LABELS[p.status]}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-[120px] truncate" title={p.notes || ""}>
                              {p.notes || "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {p.status !== "en_produccion" && (
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(p.id, "en_produccion")}
                                    className="rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                    title="Marcar en producción"
                                  >
                                    En producción
                                  </button>
                                )}
                                {p.status !== "archivado" && (
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(p.id, "archivado")}
                                    className="rounded px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                    title="Archivar"
                                  >
                                    Archivar
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(p)}
                                  title="Editar"
                                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#84b9ed] transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(p)}
                                  title="Eliminar"
                                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {filteredAndSorted.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-2 text-sm text-slate-500">
              {filteredAndSorted.length} proyecto{filteredAndSorted.length !== 1 ? "s" : ""}
              {filterStatus && ` (filtrado por ${STATUS_LABELS[filterStatus as ProyectoStatus]})`}
            </div>
          )}
        </div>

        {proyectos.length > 0 && filterStatus === "" && (
          <p className="mt-4 text-sm text-slate-600">
            Los proyectos archivados siguen en la lista. Filtrá por estado para ver solo los activos.
          </p>
        )}
      </div>
    </main>
  );
}
