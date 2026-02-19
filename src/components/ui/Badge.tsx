"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "violet",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "violet" | "blue" | "yellow" }) {
  const v =
    variant === "violet"
      ? "bg-[rgba(124,58,237,0.18)] text-[var(--text)] border border-[rgba(124,58,237,0.35)]"
      : variant === "blue"
      ? "bg-[rgba(43,89,255,0.14)] text-[var(--text)] border border-[rgba(43,89,255,0.35)]"
      : "bg-[rgba(255,216,77,0.18)] text-[var(--text)] border border-[rgba(255,216,77,0.35)]";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        v,
        className
      )}
      {...props}
    />
  );
}
