"use client";

import * as React from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/stores/cart.store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatEUR } from "@/lib/utils";
import type { ProductDetail } from "@/lib/server/basic-products";

const FONTS = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Impact",
];

const PRINT_COLORS = [
  { name: "grigio", hex: "#9ca3af" },
  { name: "nero", hex: "#111111" },
  { name: "bianco", hex: "#ffffff" },
  { name: "rosa", hex: "#f472b6" },
  { name: "rosso", hex: "#ef4444" },
  { name: "blu", hex: "#2563eb" },
  { name: "giallo", hex: "#facc15" },
  { name: "verde", hex: "#22c55e" },
  { name: "fucsia", hex: "#d946ef" },
];

const PRINT_PRICE_TEXT = 4.9;
const PRINT_PRICE_LOGO = 2.5;

export function ProductCustomizer({ detail }: { detail: ProductDetail }) {
  const add = useCartStore((s) => s.add);
  const toast = useToast();

  const variants = detail.variants;
  const [size, setSize] = React.useState(variants[0]?.size || "");
  const [colorCode, setColorCode] = React.useState(variants[0]?.colorCode || "");
  const [font, setFont] = React.useState(FONTS[0]);
  const [text, setText] = React.useState("");
  const [printColor, setPrintColor] = React.useState(PRINT_COLORS[1]);
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState(1);

  const sizes = React.useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants]
  );
  const colors = React.useMemo(
    () =>
      Array.from(
        new Map(variants.map((v) => [v.colorCode, { code: v.colorCode, name: v.colorName, hex: v.colorHex }])).values()
      ),
    [variants]
  );

  const selectedVariant =
    variants.find((v) => v.size === size && v.colorCode === colorCode) || variants[0];

  React.useEffect(() => {
    if (!selectedVariant) return;
    setSize(selectedVariant.size);
    setColorCode(selectedVariant.colorCode);
  }, [selectedVariant]);

  const basePrice = selectedVariant?.price || detail.product.price;
  const printPrice = (text.trim() ? PRINT_PRICE_TEXT : 0) + (logoDataUrl ? PRINT_PRICE_LOGO : 0);
  const totalUnit = basePrice + printPrice;
  const total = totalUnit * qty;

  async function onLogoChange(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function addPersonalized() {
    if (!selectedVariant) return;
    add({
      type: "product",
      refId: selectedVariant.barcode,
      name: `${detail.product.name} (${selectedVariant.colorName} ${selectedVariant.size})`,
      price: totalUnit,
      qty,
      meta: {
        barcode: selectedVariant.barcode,
        color: selectedVariant.colorName,
        size: selectedVariant.size,
        text,
        font,
        printColor: printColor.name,
        hasLogo: Boolean(logoDataUrl),
      },
    });
    toast.push({ title: "Articolo personalizzato aggiunto ✓", actionLabel: "Vai al carrello", actionHref: "/carrello" });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
      <Card className="space-y-4">
        <div className="text-sm text-[var(--muted)]">Anteprima di stampa</div>
        <div className="relative rounded-2xl border border-[var(--border)] bg-white/5 h-[420px] overflow-hidden">
          {selectedVariant?.imageUrl ? (
            <Image src={selectedVariant.imageUrl} alt={detail.product.name} fill className="object-contain object-center p-6" />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="max-w-[70%] text-center space-y-2">
              {logoDataUrl ? (
                <Image src={logoDataUrl} alt="Logo caricato" width={110} height={110} className="mx-auto object-contain" />
              ) : null}
              {text.trim() ? (
                <p style={{ fontFamily: font, color: printColor.hex }} className="text-3xl font-semibold drop-shadow">
                  {text}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="text-lg font-semibold">{detail.product.name}</div>
          <div className="text-sm text-[var(--muted)]">Taglie, colori, quantità e prezzi reali fornitore.</div>

          <div>
            <div className="mb-2 text-sm text-[var(--muted)]">Colori</div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setColorCode(c.code)}
                  className={`px-3 py-1.5 rounded-xl border text-sm ${colorCode === c.code ? "border-[var(--blue)]" : "border-[var(--border)]"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-[var(--muted)]">Taglie</div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-xl border text-sm ${size === s ? "border-[var(--blue)]" : "border-[var(--border)]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-[var(--muted)]">Prezzo articolo</div>
              <div className="font-semibold">{formatEUR(basePrice)}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Disponibilità</div>
              <div className="font-semibold">{selectedVariant?.quantity ?? 0}</div>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="text-lg font-semibold">Personalizzazione</div>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-2 text-sm"
            placeholder="Scrivi il testo da stampare"
          />

          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-2 text-sm"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <div>
            <div className="mb-2 text-sm text-[var(--muted)]">Colore stampa testo</div>
            <div className="flex flex-wrap gap-2">
              {PRINT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setPrintColor(c)}
                  className={`px-3 py-1.5 rounded-xl border text-sm ${printColor.name === c.name ? "border-[var(--blue)]" : "border-[var(--border)]"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-[var(--muted)]">Carica logo (png/jpg)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onLogoChange(e.target.files?.[0])}
              className="mt-2 w-full rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-2 text-sm"
            />
          </label>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              -
            </Button>
            <div className="w-10 text-center">{qty}</div>
            <Button variant="secondary" onClick={() => setQty((q) => q + 1)}>
              +
            </Button>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="text-lg font-semibold">Prezzi stampa</div>
          <div className="flex items-center justify-between text-sm">
            <span>Stampa testo</span>
            <span>{formatEUR(PRINT_PRICE_TEXT)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Stampa logo</span>
            <span>{formatEUR(PRINT_PRICE_LOGO)}</span>
          </div>
          <div className="unw-divider pt-2 flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">Totale unitario (articolo + stampa)</span>
            <span className="font-semibold">{formatEUR(totalUnit)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">Totale x {qty}</span>
            <span className="text-lg font-bold">{formatEUR(total)}</span>
          </div>
          <Button className="w-full" onClick={addPersonalized}>
            Aggiungi personalizzato
          </Button>
        </Card>
      </div>
    </div>
  );
}
