export type SaasTarea = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  fechaRealizada?: string;
  prioridad?: number;
};

export function sortSaasTareas(tareas: SaasTarea[]): SaasTarea[] {
  const pending = tareas.filter((t) => !t.done);
  const done = tareas.filter((t) => t.done);

  pending.sort((a, b) => {
    const pa = a.prioridad ?? 9999;
    const pb = b.prioridad ?? 9999;
    if (pa !== pb) return pa - pb;
    return a.createdAt.localeCompare(b.createdAt);
  });

  done.sort((a, b) => {
    const fa = a.fechaRealizada ?? a.createdAt;
    const fb = b.fechaRealizada ?? b.createdAt;
    return fb.localeCompare(fa);
  });

  return [...pending, ...done];
}
