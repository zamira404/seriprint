"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "unw-ease inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-[var(--yellow)] text-[#141821] shadow-[var(--shadow-soft)] hover:brightness-[1.05] active:scale-[0.98]",
    secondary:
      "bg-transparent border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--blue)] hover:shadow-[var(--glow-blue)] active:scale-[0.98]",
    ghost:
      "bg-transparent text-[var(--text)] hover:bg-white/5 active:scale-[0.98]",
    danger:
      "bg-red-500/90 text-white hover:bg-red-500 active:scale-[0.98]",
  }[variant];

  return <button className={cn(base, styles, className)} {...props} />;
}
