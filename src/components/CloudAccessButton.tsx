"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";

export function CloudAccessButton() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const onClick = React.useCallback(() => {
    if (!user) {
      setOpen(true);
      return;
    }
    router.push("/cloud");
  }, [router, user]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="unw-ease inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1 text-xs sm:text-sm font-medium border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--blue)] hover:shadow-[var(--glow-blue)] active:scale-[0.98]"
      >
        <span style={{ color: "#ffd84d" }}>☁︎</span> Apri Cloud
      </button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[999] bg-black/35 grid place-items-center p-4"
              onClick={() => setOpen(false)}
              role="alertdialog"
              aria-modal="true"
              aria-label="Accesso Cloud"
            >
              <div
                className="unw-card w-full max-w-[360px] p-4 sm:p-5 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-base font-semibold">Accesso Cloud</div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Registrati o accedi per usare il Cloud.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="unw-ease rounded-lg px-3.5 py-2 text-sm border border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push("/auth?next=/cloud&mode=register");
                    }}
                    className="unw-ease rounded-lg px-3.5 py-2 text-sm font-medium bg-[var(--yellow)] text-[#141821] shadow-[var(--shadow-soft)] hover:brightness-[1.05] active:scale-[0.98]"
                  >
                    Registrati / Accedi
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
