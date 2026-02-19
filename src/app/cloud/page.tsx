"use client";

import * as React from "react";
import { useCloudStore } from "@/lib/stores/cloud.store";
import { useCartStore } from "@/lib/stores/cart.store";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UI } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

function bytes(n: number) {
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function CloudPage() {
  const toast = useToast();
  const addToCart = useCartStore((s) => s.add);

  const files = useCloudStore((s) => s.files);
  const visible = useCloudStore((s) => s.visibleFiles());
  const selectedIds = useCloudStore((s) => s.selectedIds());
  const query = useCloudStore((s) => s.query);
  const tab = useCloudStore((s) => s.tab);
  const setQuery = useCloudStore((s) => s.setQuery);
  const setTab = useCloudStore((s) => s.setTab);
  const addFiles = useCloudStore((s) => s.addFiles);
  const removeFile = useCloudStore((s) => s.removeFile);
  const renameFile = useCloudStore((s) => s.renameFile);
  const toggleSelect = useCloudStore((s) => s.toggleSelect);
  const selectVisible = useCloudStore((s) => s.selectVisible);
  const clearSelection = useCloudStore((s) => s.clearSelection);
  const usage = useCloudStore((s) => s.usage());

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = React.useState(false);

  async function onPick(list: FileList | null) {
    if (!list || list.length === 0) return;
    const res = await addFiles(Array.from(list));
    if (res.added > 0) toast.push({ title: `Upload completato ✓ (${res.added})` });
    if (res.blocked) toast.push({ title: `Limite ${UI.maxCloudFiles} file raggiunto. Rimuovi qualcosa per caricare altro.` });
  }

  function openRename(id: string, current: string) {
    const next = window.prompt("Rinomina file:", current);
    if (!next) return;
    renameFile(id, next.trim());
    toast.push({ title: "Rinominato ✓" });
  }

  function addSelectionToCart() {
    const selected = files.filter((f) => f.selectedForPrint);
    if (selected.length === 0) return;
    selected.forEach((f) => {
      addToCart({
        type: "print",
        refId: f.id,
        name: `Stampa: ${f.name}`,
        price: 4.9,
        meta: { kind: f.kind, mime: f.mime },
      });
    });
    toast.push({ title: `Aggiunti al carrello ✓ (${selected.length})`, actionLabel: "Vai al carrello", actionHref: "/carrello" });
    clearSelection();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Cloud</h1>
          <p className="text-[var(--muted)]">Trascina qui i file - li teniamo in ordine per te.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="violet">
            Usati {usage.used}/{usage.max}
          </Badge>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Carica file
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
          />
        </div>
      </div>

      <Card>
        <div
          className={`unw-ease rounded-2xl border border-dashed ${
            drag ? "border-[var(--blue)] shadow-[var(--glow-blue)]" : "border-[var(--border)]"
          } bg-white/3 p-6 text-center`}
          onDragEnter={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setDrag(false);
            await onPick(e.dataTransfer.files);
          }}
        >
          <div className="text-sm text-[var(--muted)]">Drag & drop</div>
          <div className="mt-1 font-semibold">
            Rilascia qui foto o documenti (max {UI.maxCloudFiles} file)
          </div>
          <div className="mt-3 text-xs text-[var(--muted)]">
            Sei a {usage.used}/{usage.max}. Tutto sotto controllo.
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca nei tuoi file..."
              aria-label="Cerca file"
            />
          </div>
          <Tabs
            value={tab}
            onChange={(k) => setTab(k as "all" | "photo" | "doc")}
            tabs={[
              { key: "all", label: "Tutti" },
              { key: "photo", label: "Foto" },
              { key: "doc", label: "Documenti" },
            ]}
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => selectVisible(visible.map((v) => v.id))}>
              Seleziona visibili
            </Button>
            <Button variant="secondary" disabled={selectedIds.length === 0} onClick={addSelectionToCart}>
              Aggiungi selezionati al carrello
            </Button>
          </div>
        </div>
      </Card>

      {visible.length === 0 ? (
        <Card>
          <div className="text-sm text-[var(--muted)]">Nessun file visibile.</div>
          <div className="mt-2 font-semibold">Inizia con un upload, oppure cambia filtro/ricerca.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visible.map((f) => (
            <Card key={f.id} className="flex items-center gap-3">
              <button
                className={`unw-ease h-10 w-10 rounded-2xl border ${
                  f.selectedForPrint
                    ? "border-[rgba(124,58,237,0.5)] bg-[rgba(124,58,237,0.16)] shadow-[var(--glow-violet)]"
                    : "border-[var(--border)] bg-white/5"
                }`}
                onClick={() => toggleSelect(f.id)}
                aria-label="Seleziona per stampa"
                title="Seleziona per stampa"
              >
                {f.kind === "photo" ? "🖼" : "📄"}
              </button>

              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{f.name}</div>
                <div className="text-xs text-[var(--muted)]">
                  {f.kind === "photo" ? "Foto" : "Documento"} - {bytes(f.size)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => openRename(f.id, f.name)}>
                  Rinomina
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Vuoi eliminare questo file?")) {
                      removeFile(f.id);
                      toast.push({ title: "Eliminato ✓" });
                    }
                  }}
                >
                  Elimina
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
