"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data/products";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatEUR } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart.store";
import { useToast } from "@/components/ui/Toast";

export function ProductCard({ p }: { p: Product }) {
  const add = useCartStore((s) => s.add);
  const toast = useToast();

  return (
    <Card className="unw-ease hover:translate-y-[-2px] hover:shadow-[var(--shadow)]">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white/5">
        {p.tag ? (
          <div className="absolute left-3 top-3 z-10">
            <Badge variant={p.tag === "Nuovo" ? "violet" : "blue"}>{p.tag}</Badge>
          </div>
        ) : null}
        <div className="h-[190px] w-full p-4 flex items-center justify-center">
          <Image
            src={p.imageUrl || "/file.svg"}
            alt={p.name}
            width={900}
            height={600}
            className="h-full w-full object-contain object-center"
          />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--muted)] capitalize">{p.category}</div>
          <div className="mt-1 font-semibold tracking-[-0.01em]">
            {p.code ? <Link href={`/shop/${p.code}`}>{p.name}</Link> : p.name}
          </div>
          <div className="mt-2 text-xs text-[var(--muted)]">
            {p.colorCount ? `${p.colorCount} colori` : "Colori n/d"} •{" "}
            {p.sizeCount ? `${p.sizeCount} taglie` : "Taglie n/d"} •{" "}
            {typeof p.availableQty === "number" ? `disp. ${p.availableQty}` : "disp. n/d"}
          </div>
        </div>
        <div className="text-sm font-semibold">{formatEUR(p.price)}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {p.code ? (
          <Link href={`/shop/${p.code}`}>
            <Button variant="secondary" className="w-full">
              Personalizza
            </Button>
          </Link>
        ) : null}
        <Button
          className="w-full"
          onClick={() => {
            add({
              type: "product",
              refId: p.id,
              name: p.name,
              price: p.price,
              meta: { imageUrl: p.imageUrl },
            });
            toast.push({ title: "Aggiunto ✓", actionLabel: "Vai al carrello", actionHref: "/carrello" });
          }}
        >
          Aggiungi base
        </Button>
      </div>
    </Card>
  );
}
