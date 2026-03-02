"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatEUR } from "@/lib/utils";

type ProductionOrder = {
  id: string;
  paidAt: string;
  provider: "stripe" | "paypal";
  paymentRef: string;
  pickupCode: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  totals: { subtotal: number; shipping: number; total: number };
  items: Array<{
    line: number;
    type: "product" | "print";
    name: string;
    qty: number;
    unitPrice: number;
    personalization: {
      text?: string;
      font?: string;
      printColor?: string;
      hasLogo?: boolean;
      barcode?: string;
      color?: string;
      size?: string;
      cloudRefId?: string;
      mime?: string;
      kind?: string;
    };
  }>;
};

export default function AdminPage() {
  const [orders, setOrders] = React.useState<ProductionOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [token, setToken] = React.useState("");
  const [authorized, setAuthorized] = React.useState(false);

  async function load(nextToken?: string) {
    const authToken = (nextToken ?? token).trim();
    if (!authToken) {
      setLoading(false);
      setError("Inserisci il token admin.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/production/orders", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = (await res.json()) as { orders?: ProductionOrder[]; error?: string };
      if (!res.ok) {
        setAuthorized(false);
        setError(data.error || "Errore caricamento ordini.");
      } else {
        setAuthorized(true);
        setOrders(data.orders || []);
      }
    } catch {
      setAuthorized(false);
      setError("Errore rete durante caricamento ordini.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Produzione</h1>
          <p className="text-[var(--muted)]">Ordini pagati con dati pronti per stampa.</p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? "Aggiorno..." : "Aggiorna"}
        </Button>
      </div>

      {!authorized ? (
        <Card className="space-y-3">
          <div className="text-sm text-[var(--muted)]">Accesso titolare</div>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Inserisci ADMIN_API_TOKEN"
            className="w-full rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-2 text-sm"
          />
          <Button
            onClick={() => void load(token)}
            disabled={loading || !token.trim()}
          >
            {loading ? "Verifica..." : "Accedi area ordini"}
          </Button>
          {error ? <div className="text-sm text-red-300">{error}</div> : null}
        </Card>
      ) : null}

      {authorized && error ? (
        <Card>
          <div className="text-sm text-red-300">{error}</div>
        </Card>
      ) : null}

      {authorized && loading ? (
        <Card>
          <div className="text-sm text-[var(--muted)]">Caricamento ordini...</div>
        </Card>
      ) : authorized && orders.length === 0 ? (
        <Card>
          <div className="text-sm text-[var(--muted)]">Nessun ordine pagato disponibile.</div>
        </Card>
      ) : authorized ? (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-sm text-[var(--muted)]">Ordine {o.id}</div>
                  <div className="font-semibold">
                    {o.customer.firstName || ""} {o.customer.lastName || ""} - {o.customer.email || "email n/d"}
                  </div>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {new Date(o.paidAt).toLocaleString("it-IT")} - {o.provider.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="text-[var(--muted)]">Pagamento: </span>
                  <span className="font-mono">{o.paymentRef}</span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--muted)]">Totale: </span>
                  <span className="font-semibold">{formatEUR(o.totals.total)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--muted)]">Codice ritiro: </span>
                  <span className="font-semibold tracking-[0.08em]">{o.pickupCode}</span>
                </div>
              </div>

              <div className="space-y-2">
                {o.items.map((it) => (
                  <div key={`${o.id}-${it.line}`} className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{it.name}</div>
                      <div className="text-sm">{it.qty} x {formatEUR(it.unitPrice)}</div>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Tipo: {it.type === "print" ? "Stampa da Cloud" : "Prodotto personalizzato"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Taglia: {it.personalization.size || "-"} | Colore: {it.personalization.color || "-"} | Barcode: {it.personalization.barcode || "-"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Testo: {it.personalization.text || "-"} | Font: {it.personalization.font || "-"} | Colore stampa: {it.personalization.printColor || "-"} | Logo: {it.personalization.hasLogo ? "si" : "no"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Cloud Ref: {it.personalization.cloudRefId || "-"} | MIME: {it.personalization.mime || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
