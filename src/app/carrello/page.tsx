"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/stores/cart.store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatEUR } from "@/lib/utils";

export default function CarrelloPage() {
  const items = useCartStore((s) => s.items);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.remove);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Carrello</h1>
        <Card>
          <div className="text-sm text-[var(--muted)]">Il tuo carrello e vuoto.</div>
          <div className="mt-2 font-semibold">Quando vuoi, aggiungi qualcosa dallo Shop o dal Cloud.</div>
          <div className="mt-4 flex gap-2">
            <Link href="/shop"><Button>Vai allo Shop</Button></Link>
            <Link href="/cloud"><Button variant="secondary">Apri Cloud</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Carrello</h1>
        <div className="text-sm text-[var(--muted)]">Tutto sotto controllo.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-[var(--muted)]">{it.type === "print" ? "Stampa da Cloud" : "Prodotto"}</div>
                <div className="font-semibold truncate">{it.name}</div>
                <div className="text-sm text-[var(--muted)]">{formatEUR(it.price)} cad.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => dec(it.id)} aria-label="Diminuisci quantita">-</Button>
                <div className="w-8 text-center">{it.qty}</div>
                <Button variant="secondary" onClick={() => inc(it.id)} aria-label="Aumenta quantita">+</Button>
              </div>
              <div className="text-sm font-semibold w-24 text-right">{formatEUR(it.price * it.qty)}</div>
              <Button variant="ghost" onClick={() => remove(it.id)} aria-label="Rimuovi">x</Button>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <div className="text-sm text-[var(--muted)]">Riepilogo</div>
          <div className="mt-2 flex items-center justify-between">
            <div>Subtotale</div>
            <div className="font-semibold">{formatEUR(subtotal)}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted)]">
            <div>Spedizione</div>
            <div>calcolata al checkout</div>
          </div>
          <div className="mt-4 unw-divider pt-4">
            <Button className="w-full" onClick={() => (window.location.href = "/checkout")}>
              Procedi
            </Button>
            <div className="mt-2 text-xs text-[var(--muted)]">
              Se il checkout non e pronto, puoi usare temporaneamente la pagina esistente.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
