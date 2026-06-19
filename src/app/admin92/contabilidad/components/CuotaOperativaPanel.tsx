"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  getCuotaOperativaBorder,
  getStatsObjectiveDate,
  hasCambioPendiente,
  hasStatsPendientes,
  newSolicitudTaskId,
  type ProyectoOperativo,
  type SolicitudTask,
} from "@/app/admin92/contabilidad/lib/cuotaOperativa";
import CuotaCalendarDot from "@/app/admin92/contabilidad/components/CuotaCalendarDot";
import { getCuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";
import { formatLocalDate, todayYmd } from "@/app/admin92/contabilidad/lib/utils";

type CobroOperativo = {
  id: string;
  clientName: string;
  paid: boolean;
  fechaCobro?: string;
  dueDate: string;
  recordatorioEnviado?: boolean;
  estadisticasEnviadas?: boolean;
  fechaEnvioEstadisticas?: string;
  servicio?: string;
  cambioPendiente?: boolean;
  solicitudTasks?: SolicitudTask[];
};

type Props = {
  cobro: CobroOperativo;
  proyecto: ProyectoOperativo | null;
  onCobroUpdated: () => void;
  onProyectoUpdated: () => void | Promise<void>;
  compact?: boolean;
};

export default function CuotaOperativaPanel({
  cobro,
  proyecto,
  onCobroUpdated,
  onProyectoUpdated,
  compact = false,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingStats, setPendingStats] = useState(false);
  const [statsFecha, setStatsFecha] = useState(todayYmd());
  const [tasks, setTasks] = useState<SolicitudTask[]>(cobro.solicitudTasks ?? []);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    setTasks(cobro.solicitudTasks ?? []);
  }, [cobro.id, cobro.solicitudTasks]);

  const today = todayYmd();
  const objetivoStats = getStatsObjectiveDate(cobro);
  const statsPendientes = hasStatsPendientes(cobro, proyecto, today);
  const cambioPendiente = hasCambioPendiente(cobro);
  const requiereStats = Boolean(proyecto?.requiereEstadisticas);
  const border = getCuotaOperativaBorder(cobro, proyecto, today);
  const estado = getCuotaEstado(cobro);

  const patchCobro = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cobros/${cobro.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar la cuota.");
      onCobroUpdated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const patchProyecto = async (proyectoId: string, body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/proyectos/${proyectoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar el proyecto.");
      await onProyectoUpdated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  /** Crea proyecto mínimo si no hay uno vinculado al cliente */
  const ensureProyecto = async (): Promise<string | null> => {
    if (proyecto?.id) return proyecto.id;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cobro.clientName.trim(),
          clientName: cobro.clientName.trim(),
          type: cobro.servicio || "Web",
          fechaInicio: todayYmd(),
          status: "en_produccion",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo crear el proyecto.");
      }
      await onProyectoUpdated();
      return data.id as string;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al vincular proyecto.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateProyectoField = async (body: Record<string, unknown>) => {
    let id = proyecto?.id;
    if (!id) {
      id = (await ensureProyecto()) ?? undefined;
    }
    if (!id) return;
    await patchProyecto(id, body);
  };

  const handleToggleRequiereStats = async () => {
    await updateProyectoField({ requiereEstadisticas: !requiereStats });
  };

  const handleToggleCambioPendiente = async () => {
    await patchCobro({ cambioPendiente: !cambioPendiente });
  };

  const handleStatsClick = async () => {
    if (!requiereStats) return;
    if (cobro.estadisticasEnviadas) {
      await patchCobro({ estadisticasEnviadas: false });
      setPendingStats(false);
      return;
    }
    setStatsFecha(todayYmd());
    setPendingStats(true);
  };

  const handleConfirmStats = async () => {
    await patchCobro({
      estadisticasEnviadas: true,
      fechaEnvioEstadisticas: statsFecha,
    });
    setPendingStats(false);
  };

  const saveTasks = async (nextTasks: SolicitudTask[]) => {
    setTasks(nextTasks);
    await patchCobro({ solicitudTasks: nextTasks, cambioPendiente: true });
  };

  const handleToggleTask = async (taskId: string) => {
    const next = tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    await saveTasks(next);
  };

  const handleRemoveTask = async (taskId: string) => {
    const next = tasks.filter((t) => t.id !== taskId);
    await saveTasks(next);
  };

  const handleAddTask = async () => {
    const text = newTaskText.trim();
    if (!text) return;
    const next = [...tasks, { id: newSolicitudTaskId(), text, done: false }];
    setNewTaskText("");
    await saveTasks(next);
  };

  const boxClass = compact
    ? "mt-2 rounded-lg border-2 border-slate-200 bg-white p-3 space-y-3"
    : "rounded-lg border-2 border-slate-200 bg-white p-3 space-y-3 shadow-sm";

  return (
    <div className={boxClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cola operativa
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Vista calendario:</span>
          <CuotaCalendarDot estado={estado} border={border} size="md" />
        </div>
      </div>

      {/* {!proyecto && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
          Sin proyecto para <strong>{cobro.clientName}</strong>. Al marcar un checkbox se crea
          automáticamente, o creá uno en Proyectos.
        </p>
      )} */}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={requiereStats}
            disabled={saving}
            onChange={handleToggleRequiereStats}
            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
          />
          <span className={requiereStats ? "font-medium text-violet-800" : ""}>
            Requiere estadísticas
          </span>
          {requiereStats && (
            <span className="text-[10px] rounded-full border border-dashed border-violet-400 text-violet-700 px-1.5 py-0.5">
              borde violeta
            </span>
          )}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cambioPendiente}
            disabled={saving}
            onChange={handleToggleCambioPendiente}
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <span className={cambioPendiente ? "font-medium text-amber-800" : ""}>
            Cambio pendiente
          </span>
          {cambioPendiente && (
            <span className="text-[10px] rounded-full border border-dashed border-amber-400 text-amber-700 px-1.5 py-0.5">
              borde ámbar
            </span>
          )}
        </label>
      </div>

      {requiereStats && (
        <div className="flex flex-wrap items-center gap-2 text-xs border-t border-slate-100 pt-2">
          {cobro.paid ? (
            <>
              <span className="text-slate-600">
                Objetivo:{" "}
                <strong>{objetivoStats ? formatLocalDate(objetivoStats) : "—"}</strong>
              </span>
              {cobro.estadisticasEnviadas && cobro.fechaEnvioEstadisticas ? (
                <span className="text-green-700 font-medium">
                  Enviadas el {formatLocalDate(cobro.fechaEnvioEstadisticas)}
                </span>
              ) : statsPendientes ? (
                <span className="font-medium text-violet-700">Pendientes (borde activo)</span>
              ) : (
                <span className="text-slate-500">Aún no llega el objetivo</span>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={handleStatsClick}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                  cobro.estadisticasEnviadas
                    ? "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cobro.estadisticasEnviadas ? <Check className="h-3 w-3" /> : null}
                {cobro.estadisticasEnviadas ? "Quitar envío" : "Marcar enviadas"}
              </button>
              {cobro.estadisticasEnviadas && cobro.fechaEnvioEstadisticas && (
                <input
                  type="date"
                  value={cobro.fechaEnvioEstadisticas}
                  disabled={saving}
                  onChange={(e) => patchCobro({ fechaEnvioEstadisticas: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                />
              )}
            </>
          ) : (
            <span className="text-slate-500">
              El borde violeta aparece cuando la cuota está pagada y pasó el objetivo (cobro + 5).
            </span>
          )}
        </div>
      )}

      {pendingStats && (
        <div className="flex flex-wrap items-end gap-2 rounded-md border border-violet-200 bg-violet-50/60 p-2">
          <label className="text-xs text-slate-700">
            Fecha de envío
            <input
              type="date"
              value={statsFecha}
              onChange={(e) => setStatsFecha(e.target.value)}
              className="mt-1 block rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={handleConfirmStats}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50"
          >
            Confirmar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => setPendingStats(false)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-white cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      {(cambioPendiente || tasks.length > 0) && (
        <div className="border-t border-slate-100 pt-2">
          <p className="text-xs font-medium text-slate-700 mb-1.5">Tareas del cambio</p>
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  disabled={saving}
                  onChange={() => handleToggleTask(t.id)}
                  className="rounded border-slate-300 text-amber-600 cursor-pointer"
                />
                <span
                  className={`flex-1 text-xs ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleRemoveTask(t.id)}
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                  aria-label="Eliminar tarea"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              placeholder="Nueva tarea…"
              disabled={saving}
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              disabled={saving || !newTaskText.trim()}
              onClick={handleAddTask}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      {saving && <p className="text-xs text-slate-400">Guardando…</p>}
    </div>
  );
}
