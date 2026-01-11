"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type SidebarContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);
  const toggleSidebar = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo<SidebarContextValue>(
    () => ({ open, setOpen, openSidebar, closeSidebar, toggleSidebar }),
    [open, openSidebar, closeSidebar, toggleSidebar]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider />");
  return ctx;
}

