"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { sortSaasTareas, type SaasTarea } from "@/app/admin92/contabilidad/lib/saasTareas";
import { formatLocalDate, todayYmd } from "@/app/admin92/contabilidad/lib/utils";

type Props = {
  onCountChange?: (count: number) => void;
};

function mapApiTarea(raw: {
  _id?: string;
  id?: string;
  text: string;
  done: boolean;
  createdAt: string;
  fechaRealizada?: string;
  prioridad?: number;
}): SaasTarea {
  return {
    id: raw._id ?? raw.id ?? "",
    text: raw.text,
    done: raw.done,
    createdAt: raw.createdAt,
    fechaRealizada: raw.fechaRealizada,
    prioridad: raw.prioridad,
  };
}

export default function SaasTareasPanel({ onCountChange }: Props) {
  const [tareas, setTareas] = useState<SaasTarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(todayYmd());
  const [taskPendingDelete, setTaskPendingDelete] = useState<SaasTarea | null>(null);
  const [pendingComplete, setPendingComplete] = useState<{
    taskId: string;
    text: string;
    fecha: string;
  } | null>(null);
  const editingTextRef = useRef<string | null>(null);
  const editingDateRef = useRef<string | null>(null);
  const editingRealDateRef = useRef<string | null>(null);
  const tareasRef = useRef(tareas);
  tareasRef.current = tareas;

  const sorted = useMemo(() => sortSaasTareas(tareas), [tareas]);
  const pendingCount = tareas.filter((t) => !t.done).length;

  useEffect(() => {
    onCountChange?.(pendingCount);
  }, [pendingCount, onCountChange]);

  const loadTareas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/saas-tareas");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudieron cargar las tareas.");
      const list = Array.isArray(data.tareas) ? data.tareas.map(mapApiTarea) : [];
      if (!editingTextRef.current && !editingDateRef.current && !editingRealDateRef.current) {
        setTareas(list);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTareas();
  }, [loadTareas]);

  const patchTarea = async (id: string, body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/saas-tareas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar.");
      await loadTareas();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar.");
      await loadTareas();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (task: SaasTarea) => {
    if (task.done) {
      void patchTarea(task.id, { done: false, fechaRealizada: null });
      setPendingComplete(null);
      return;
    }
    setPendingComplete({ taskId: task.id, text: task.text, fecha: todayYmd() });
  };

  const handleConfirmComplete = async () => {
    if (!pendingComplete) return;
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(pendingComplete.fecha)
      ? pendingComplete.fecha
      : todayYmd();
    setPendingComplete(null);
    await patchTarea(pendingComplete.taskId, { done: true, fechaRealizada: fecha });
  };

  const handleAdd = async () => {
    const text = newTaskText.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/saas-tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          createdAt: /^\d{4}-\d{2}-\d{2}$/.test(newTaskDate) ? newTaskDate : todayYmd(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo crear la tarea.");
      setNewTaskText("");
      setNewTaskDate(todayYmd());
      await loadTareas();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError("");
    setTaskPendingDelete(null);
    try {
      const res = await fetch(`/api/admin/saas-tareas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo eliminar.");
      await loadTareas();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar.");
    } finally {
      setSaving(false);
    }
  };

  const commitText = async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      await loadTareas();
      return;
    }
    const saved = tareasRef.current.find((t) => t.id === id);
    if (saved?.text === trimmed) return;
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
    await patchTarea(id, { text: trimmed });
  };

  const commitDate = async (id: string, createdAt: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(createdAt)) {
      await loadTareas();
      return;
    }
    const saved = tareasRef.current.find((t) => t.id === id);
    if (saved?.createdAt === createdAt) return;
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, createdAt } : t)));
    await patchTarea(id, { createdAt });
  };

  const commitFechaRealizada = async (id: string, fechaRealizada: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaRealizada)) {
      await loadTareas();
      return;
    }
    const saved = tareasRef.current.find((t) => t.id === id);
    if (saved?.fechaRealizada === fechaRealizada) return;
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, fechaRealizada } : t)),
    );
    await patchTarea(id, { fechaRealizada });
  };

  if (loading && tareas.length === 0) {
    return <p className="text-sm text-slate-500 py-4 text-center">Cargando tareas SaaS…</p>;
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">
          {error}
        </p>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          Sin tareas del producto SaaS. Agregá la primera abajo.
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-[min(380px,45vh)] overflow-y-auto pr-0.5">
          {sorted.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-start gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/30 px-2 py-2"
            >
              <input
                type="checkbox"
                checked={t.done}
                disabled={saving}
                onChange={() => handleToggle(t)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 cursor-pointer shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  type="text"
                  value={t.text}
                  disabled={saving}
                  onFocus={() => {
                    editingTextRef.current = t.id;
                  }}
                  onChange={(e) =>
                    setTareas((prev) =>
                      prev.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)),
                    )
                  }
                  onBlur={(e) => {
                    editingTextRef.current = null;
                    void commitText(t.id, e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  className={`w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm outline-none focus:border-indigo-200 focus:bg-white disabled:opacity-50 ${
                    t.done ? "text-slate-400 line-through" : "font-medium text-slate-900"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="text-slate-400">Ped.</span>
                  <input
                    type="date"
                    value={t.createdAt}
                    disabled={saving}
                    onFocus={() => {
                      editingDateRef.current = t.id;
                    }}
                    onChange={(e) =>
                      setTareas((prev) =>
                        prev.map((x) =>
                          x.id === t.id ? { ...x, createdAt: e.target.value } : x,
                        ),
                      )
                    }
                    onBlur={(e) => {
                      editingDateRef.current = null;
                      void commitDate(t.id, e.target.value);
                    }}
                    className="rounded border border-slate-200 px-1 py-0.5 text-[11px] cursor-pointer"
                  />
                  {t.done && (
                    <>
                      <span className="text-slate-400">Real.</span>
                      <input
                        type="date"
                        value={t.fechaRealizada ?? todayYmd()}
                        disabled={saving}
                        onFocus={() => {
                          editingRealDateRef.current = t.id;
                        }}
                        onChange={(e) =>
                          setTareas((prev) =>
                            prev.map((x) =>
                              x.id === t.id ? { ...x, fechaRealizada: e.target.value } : x,
                            ),
                          )
                        }
                        onBlur={(e) => {
                          editingRealDateRef.current = null;
                          void commitFechaRealizada(t.id, e.target.value);
                        }}
                        className="rounded border border-green-200 bg-green-50/50 px-1 py-0.5 text-[11px] text-green-800 cursor-pointer"
                      />
                    </>
                  )}
                  {!t.done && (
                    <span className="text-slate-400">· {formatLocalDate(t.createdAt)}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setTaskPendingDelete(t)}
                className="shrink-0 p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                aria-label="Eliminar tarea"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pendingComplete && (
        <div className="flex flex-wrap items-end gap-2 rounded-md border border-indigo-200 bg-indigo-50/60 p-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-indigo-900 mb-1">Marcar tarea realizada</p>
            <p className="text-xs text-slate-700 line-clamp-2">{pendingComplete.text}</p>
          </div>
          <label className="text-xs text-slate-700">
            Fecha realizada
            <input
              type="date"
              value={pendingComplete.fecha}
              onChange={(e) =>
                setPendingComplete((prev) => (prev ? { ...prev, fecha: e.target.value } : prev))
              }
              className="mt-1 block rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleConfirmComplete()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
          >
            Confirmar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => setPendingComplete(null)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-white cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAdd();
          }}
          placeholder="Nueva tarea SaaS…"
          disabled={saving}
          className="min-w-[140px] flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          type="date"
          value={newTaskDate}
          onChange={(e) => setNewTaskDate(e.target.value)}
          disabled={saving}
          title="Fecha pedido"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
        />
        <button
          type="button"
          disabled={saving || !newTaskText.trim()}
          onClick={() => void handleAdd()}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>

      {taskPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <p className="text-sm font-semibold text-slate-900 mb-1">Eliminar tarea</p>
            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{taskPendingDelete.text}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskPendingDelete(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDelete(taskPendingDelete.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
