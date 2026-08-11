"use client";

import { useState } from "react";
import SolicitudTasksEditor from "@/app/admin92/contabilidad/components/SolicitudTasksEditor";
import CuotaCalendarDot from "@/app/admin92/contabilidad/components/CuotaCalendarDot";
import type { Desarrollo50Item } from "@/app/admin92/contabilidad/lib/desarrollos50";
import type { SolicitudTask } from "@/app/admin92/contabilidad/lib/cuotaOperativa";
import { todayYmd } from "@/app/admin92/contabilidad/lib/utils";

type Props = {
  desarrollo: Desarrollo50Item;
  onUpdated: () => void;
};

export default function Desarrollo50TasksBlock({ desarrollo, onUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const cambioPendiente = Boolean(desarrollo.cambioPendiente);
  const anchorDate =
    desarrollo.fechaCobro50 && /^\d{4}-\d{2}-\d{2}$/.test(desarrollo.fechaCobro50)
      ? desarrollo.fechaCobro50
      : todayYmd();

  const patchDesarrollo = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/desarrollos-50/${desarrollo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar el desarrollo.");
      onUpdated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar.");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCambioPendiente = async () => {
    try {
      await patchDesarrollo({ cambioPendiente: !cambioPendiente });
    } catch {
      /* error ya mostrado */
    }
  };

  const handleSaveTasks = async (nextTasks: SolicitudTask[]) => {
    await patchDesarrollo({
      solicitudTasks: nextTasks,
      cambioPendiente: true,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cambioPendiente}
            disabled={saving}
            onChange={() => void handleToggleCambioPendiente()}
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
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">Vista calendario:</span>
          <CuotaCalendarDot
            estado="pagada"
            border={cambioPendiente ? "cambio" : "none"}
            size="md"
          />
        </div>
      </div>

      <SolicitudTasksEditor
        tasks={desarrollo.solicitudTasks ?? []}
        anchorDate={anchorDate}
        title="Tareas del desarrollo"
        disabled={saving}
        onSave={handleSaveTasks}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
