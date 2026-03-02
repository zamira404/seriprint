"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart.store";
import { useAuthStore } from "@/lib/stores/auth.store";

export function BottomNav() {
  const path = usePathname();
  const isHome = path === "/";
  const count = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);

  const item = (href: string, label: string, icon: string) => {
    const active = path === href || (href !== "/" && path.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "unw-ease flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs",
          active ? "bg-white/5 border border-[rgba(43,89,255,0.25)] shadow-[var(--glow-blue)]" : "text-[var(--muted)]"
        )}
        aria-current={active ? "page" : undefined}
      >
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[rgba(11,15,26,0.78)] backdrop-blur-xl">
      <div className={cn("mx-auto max-w-[1200px] px-3 py-2 grid gap-2", isHome ? "grid-cols-4" : "grid-cols-5")}>
        {item("/", "Home", "⌂")}
        {item("/shop", "Shop", "🛍")}
        {item("/cloud", "Cloud", "☁")}
        {!isHome ? (
          <div className="relative">
            {item("/carrello", "Carrello", "🧺")}
            {count > 0 ? (
              <span className="absolute top-1 right-2 text-[10px] bg-[rgba(124,58,237,0.22)] border border-[rgba(124,58,237,0.4)] px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            ) : null}
          </div>
        ) : null}
        {item(user ? "/profilo" : "/auth", "Account", "👤")}
      </div>
    </nav>
  );
}
