"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Tab = { key: string; label: string };

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-2xl bg-white/5 border border-[var(--border)] p-1", className)}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "unw-ease rounded-2xl px-3 py-1.5 text-sm",
              active
                ? "bg-[rgba(43,89,255,0.18)] border border-[rgba(43,89,255,0.35)] shadow-[var(--glow-blue)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
