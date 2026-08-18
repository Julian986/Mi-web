"use client";

import { useCallback, useEffect, useState } from "react";
import CarteraPage from "@/app/admin92/contabilidad/cartera/components/CarteraPage";
import type {
  CarteraHolding,
  CarteraHoldingInput,
} from "@/app/admin92/contabilidad/cartera/lib/carteraTypes";

export default function CarteraRoutePage() {
  const [holdings, setHoldings] = useState<CarteraHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHoldings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/cartera-holdings", { cache: "no-store" });
      const data = (await response.json()) as { holdings?: CarteraHolding[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los holdings.");
      }
      setHoldings(data.holdings ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar los holdings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHoldings();
  }, [loadHoldings]);

  const handleCreate = async (input: CarteraHoldingInput) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/cartera-holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as { holding?: CarteraHolding; error?: string };
      if (!response.ok || !data.holding) {
        throw new Error(data.error || "No se pudo crear el holding.");
      }
      setHoldings((prev) =>
        [...prev, data.holding!].sort((a, b) => a.name.localeCompare(b.name, "es")),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el holding.";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, input: CarteraHoldingInput) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cartera-holdings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as { holding?: CarteraHolding; error?: string };
      if (!response.ok || !data.holding) {
        throw new Error(data.error || "No se pudo actualizar el holding.");
      }
      setHoldings((prev) =>
        prev
          .map((item) => (item._id === id ? data.holding! : item))
          .sort((a, b) => a.name.localeCompare(b.name, "es")),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el holding.";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cartera-holdings/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el holding.");
      }
      setHoldings((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el holding.";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <CarteraPage
      holdings={holdings}
      loading={loading}
      saving={saving}
      error={error}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
