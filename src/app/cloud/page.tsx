"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCloudStore } from "@/lib/stores/cloud.store";
import { useCartStore } from "@/lib/stores/cart.store";
import { useAuthStore } from "@/lib/stores/auth.store";
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
  const router = useRouter();
  const toast = useToast();
  const addToCart = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const files = useCloudStore((s) => s.files);
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

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = React.useState(false);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((f) => {
      const matchesTab =
        tab === "all" ? true : tab === "photo" ? f.kind === "photo" : f.kind === "doc";
      const matchesQuery = q ? f.name.toLowerCase().includes(q) : true;
      return matchesTab && matchesQuery;
    });
  }, [files, query, tab]);

  const selectedIds = React.useMemo(
    () => files.filter((f) => f.selectedForPrint).map((f) => f.id),
    [files]
  );

  const usage = React.useMemo(
    () => ({ used: files.length, max: UI.maxCloudFiles }),
    [files.length]
  );

  React.useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/auth?next=/cloud");
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="text-sm text-[var(--muted)]">Controllo account in corso...</div>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  async function onPick(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const body = new FormData();
    incoming.forEach((f) => body.append("files", f, f.name));

    let accepted = incoming;
    let rejectedMalware = 0;
    try {
      const resp = await fetch("/api/cloud/validate-upload", {
        method: "POST",
        body,
      });
      if (!resp.ok) {
        let message = "Validazione upload non disponibile. Riprova.";
        try {
          const payload = (await resp.json()) as { error?: string };
          if (payload?.error) message = payload.error;
        } catch {}
        toast.push({ title: message });
        return;
      }
      const validated = (await resp.json()) as {
        acceptedIndices: number[];
        rejectedType: number;
        rejectedSize: number;
        rejectedName: number;
        rejectedMalware: number;
        scanned: boolean;
      };
      accepted = incoming.filter((_, i) => validated.acceptedIndices.includes(i));
      rejectedMalware = validated.rejectedMalware;
      if (validated.rejectedType > 0) {
        toast.push({ title: `Scartati ${validated.rejectedType} file: consentiti solo PDF, JPG, SVG.` });
      }
      if (validated.rejectedSize > 0) {
        toast.push({ title: `Scartati ${validated.rejectedSize} file: massimo ${UI.maxCloudFileSizeMB} MB per file.` });
      }
      if (validated.rejectedName > 0) {
        toast.push({ title: `Scartati ${validated.rejectedName} file: nome non consentito o sospetto.` });
      }
      if (validated.rejectedMalware > 0) {
        toast.push({ title: `Bloccati ${validated.rejectedMalware} file sospetti da scansione antivirus.` });
      }
      if (!validated.scanned) {
        toast.push({ title: "Scanner antivirus non configurato: attivo solo filtro tipo/dimensione." });
      }
    } catch {
      toast.push({ title: "Errore durante la validazione server dei file." });
      return;
    }

    const res = await addFiles(accepted);
    if (res.added > 0) toast.push({ title: `Upload completato ✓ (${res.added})` });
    if (res.rejectedType > 0) {
      toast.push({ title: `Scartati ${res.rejectedType} file: consentiti solo PDF, JPG, SVG.` });
    }
    if (res.rejectedSize > 0) {
      toast.push({ title: `Scartati ${res.rejectedSize} file: massimo ${UI.maxCloudFileSizeMB} MB per file.` });
    }
    if (res.rejectedName > 0) {
      toast.push({ title: `Scartati ${res.rejectedName} file: nome non consentito o sospetto.` });
    }
    if (rejectedMalware > 0) {
      toast.push({ title: `Upload completato con blocco sicurezza: ${rejectedMalware} file rifiutati.` });
    }
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
            accept={UI.cloudAcceptedExtensions.join(",")}
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { t: "1) Carica", d: "Trascina i file nel Cloud: rimangono pronti per te." },
          { t: "2) Organizza", d: "Filtra per foto/documenti, rinomina, seleziona per stampa." },
          { t: "3) Stampa", d: "Aggiungi al carrello e procedi con calma." },
        ].map((x) => (
          <Card key={x.t} className="p-3">
            <div className="text-xs text-[var(--muted)]">{x.t}</div>
            <div className="mt-1 text-sm font-semibold">{x.d}</div>
          </Card>
        ))}
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
            Rilascia qui PDF, JPG o SVG (max {UI.maxCloudFiles} file)
          </div>
          <div className="mt-3 text-xs text-[var(--muted)]">
            Max {UI.maxCloudFileSizeMB} MB per file. Sei a {usage.used}/{usage.max}.
          </div>
          <div className="mt-1 text-xs text-[var(--muted)]">
            Sicurezza: validazione server su tipo/dimensione + scansione antivirus (se scanner configurato).
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
                {f.kind === "photo" && f.previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.previewDataUrl}
                    alt={f.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : f.mime === "application/pdf" ? (
                  <span className="text-[10px] font-semibold">PDF</span>
                ) : f.mime === "image/svg+xml" ? (
                  <span className="text-[10px] font-semibold">SVG</span>
                ) : (
                  <span className="text-base">📄</span>
                )}
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
