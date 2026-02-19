"use client";

import * as React from "react";
import { PRODUCT_CATEGORY_ORDER, type CategorySlug } from "@/lib/constants";
import type { Product } from "@/lib/data/products";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { ProductCard } from "@/components/ProductCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Sort = "popolari" | "nuovi" | "prezzo_asc" | "prezzo_desc";

export function ShopClient({ products }: { products: Product[] }) {
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<CategorySlug | "tutte">("tutte");
  const [sort, setSort] = React.useState<Sort>("popolari");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) =>
      PRODUCT_CATEGORY_ORDER.includes(
        p.category as (typeof PRODUCT_CATEGORY_ORDER)[number]
      )
    );
    list = list.filter((p) => (cat === "tutte" ? true : p.category === cat));
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    list = [...list];

    if (sort === "nuovi") list.sort((a, b) => (b.tag === "Nuovo" ? 1 : 0) - (a.tag === "Nuovo" ? 1 : 0));
    if (sort === "popolari") list.sort((a, b) => (b.tag === "Popolare" ? 1 : 0) - (a.tag === "Popolare" ? 1 : 0));
    if (sort === "prezzo_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "prezzo_desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, query, cat, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Shop</h1>
          <p className="text-[var(--muted)]">Scegli con calma - qualita premium.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={sort === "popolari" ? "secondary" : "ghost"} onClick={() => setSort("popolari")}>
            Popolari
          </Button>
          <Button variant={sort === "nuovi" ? "secondary" : "ghost"} onClick={() => setSort("nuovi")}>
            Nuovi
          </Button>
          <Button variant={sort === "prezzo_asc" ? "secondary" : "ghost"} onClick={() => setSort("prezzo_asc")}>
            EUR↑
          </Button>
          <Button variant={sort === "prezzo_desc" ? "secondary" : "ghost"} onClick={() => setSort("prezzo_desc")}>
            EUR↓
          </Button>
        </div>
      </div>

      <Card className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca un prodotto..."
            aria-label="Cerca prodotti"
          />
        </div>
        <Tabs
          value={cat}
          onChange={(k) => setCat(k as CategorySlug | "tutte")}
          tabs={[
            { key: "tutte", label: "Tutte" },
            ...PRODUCT_CATEGORY_ORDER.map((s) => ({ key: s, label: s[0].toUpperCase() + s.slice(1) })),
          ]}
        />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-sm text-[var(--muted)]">Nessun risultato.</div>
          <div className="mt-2 font-semibold">Prova a rimuovere un filtro o cambiare ricerca.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
