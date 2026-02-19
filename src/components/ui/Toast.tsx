"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Toast = { id: string; title: string; actionLabel?: string; actionHref?: string };

const ToastCtx = React.createContext<{
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
} | null>(null);

function tid() {
  return `t_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = (t: Omit<Toast, "id">) => {
    const id = tid();
    setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 3));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600);
  };
  const remove = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));
  return <ToastCtx.Provider value={{ toasts, push, remove }}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function Toaster() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) return null;

  return (
    <div className="fixed z-50 right-4 bottom-20 md:bottom-6 flex flex-col gap-2">
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "unw-card unw-ease w-[320px] p-4",
            "border-[rgba(124,58,237,0.25)] shadow-[var(--shadow-soft)]"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{t.title}</div>
              {t.actionHref && t.actionLabel ? (
                <a
                  href={t.actionHref}
                  className="mt-1 inline-flex text-sm text-[var(--blue)] hover:underline"
                >
                  {t.actionLabel}
                </a>
              ) : null}
            </div>
            <button
              className="text-[var(--muted)] hover:text-[var(--text)]"
              onClick={() => ctx.remove(t.id)}
              aria-label="Chiudi toast"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
