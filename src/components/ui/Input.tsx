"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "unw-ease w-full rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:shadow-[var(--glow-blue)] outline-none",
        className
      )}
      {...props}
    />
  );
}
