"use client";

import Link from "next/link";
import * as React from "react";
import { BRAND, PRODUCT_CATEGORY_ORDER } from "@/lib/constants";
import { useCartStore } from "@/lib/stores/cart.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Header() {
  const count = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(11,15,26,0.72)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="unw-ease text-lg sm:text-xl font-semibold tracking-[-0.02em]">
            <span className="text-[var(--yellow)]">{BRAND}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <div className="relative">
              <button
                className="unw-ease px-3 py-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-[var(--border)]"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                Categorie
              </button>
              {open ? (
                <div
                  className="absolute left-0 mt-2 w-[520px] unw-card p-4"
                  onMouseLeave={() => setOpen(false)}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCT_CATEGORY_ORDER.map((slug) => (
                      <Link
                        key={slug}
                        href={`/categorie/${slug}`}
                        className="unw-ease rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-3 hover:border-[var(--blue)] hover:shadow-[var(--glow-blue)]"
                        onClick={() => setOpen(false)}
                      >
                        <div className="text-sm font-medium uppercase">{slug}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <Link className="unw-ease px-3 py-2 rounded-2xl hover:bg-white/5" href="/shop">
              Shop
            </Link>
            <Link className="unw-ease px-3 py-2 rounded-2xl hover:bg-white/5" href="/cloud">
              Cloud
            </Link>
            <Link className="unw-ease px-3 py-2 rounded-2xl hover:bg-white/5" href="/contatti">
              Contatti
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="blue">Ciao, {user.name}</Badge>
              <Button variant="ghost" onClick={logout}>
                Esci
              </Button>
            </div>
          ) : (
            <Link href="/auth" className="hidden sm:inline-flex">
              <Button variant="secondary">Accedi</Button>
            </Link>
          )}
          <Link href="/carrello" className="relative unw-ease rounded-2xl px-3 py-2 hover:bg-white/5">
            <span className="text-sm">Carrello</span>
            {count > 0 ? (
              <span className="absolute -top-1 -right-1">
                <Badge>{count}</Badge>
              </span>
            ) : null}
          </Link>
          <Link href="/shop" className="md:hidden unw-ease rounded-2xl px-3 py-2 hover:bg-white/5">
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}
