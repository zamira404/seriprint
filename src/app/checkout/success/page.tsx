"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart.store";

type Status = "loading" | "paid" | "failed";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifica pagamento in corso...");
  const [productionOrderId, setProductionOrderId] = useState<string | null>(null);
  const [pickupCode, setPickupCode] = useState<string | null>(null);
  const [pickupQrPayload, setPickupQrPayload] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function verify() {
      const provider = params.get("provider");

      if (provider === "stripe") {
        const sessionId = params.get("session_id");
        if (!sessionId) {
          if (active) {
            setStatus("failed");
            setMessage("Sessione Stripe non trovata.");
          }
          return;
        }

        const res = await fetch(
          `/api/payments/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = (await res.json()) as {
          paid?: boolean;
          error?: string;
          orderId?: string;
          pickupCode?: string;
          pickupQrPayload?: string;
        };
        if (!active) return;

        if (res.ok && data.paid) {
          clear();
          setStatus("paid");
          setMessage("Pagamento confermato. Ordine completato.");
          if (data.orderId) setProductionOrderId(data.orderId);
          if (data.pickupCode) setPickupCode(data.pickupCode);
          if (data.pickupQrPayload) setPickupQrPayload(data.pickupQrPayload);
        } else {
          setStatus("failed");
          setMessage(data.error || "Pagamento non confermato.");
        }
        return;
      }

      if (provider === "paypal") {
        const orderId = params.get("token");
        if (!orderId) {
          if (active) {
            setStatus("failed");
            setMessage("Ordine PayPal non trovato.");
          }
          return;
        }

        const res = await fetch("/api/payments/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = (await res.json()) as {
          paid?: boolean;
          error?: string;
          productionOrderId?: string;
          pickupCode?: string;
          pickupQrPayload?: string;
        };
        if (!active) return;

        if (res.ok && data.paid) {
          clear();
          setStatus("paid");
          setMessage("Pagamento PayPal confermato. Ordine completato.");
          if (data.productionOrderId) setProductionOrderId(data.productionOrderId);
          if (data.pickupCode) setPickupCode(data.pickupCode);
          if (data.pickupQrPayload) setPickupQrPayload(data.pickupQrPayload);
        } else {
          setStatus("failed");
          setMessage(data.error || "Pagamento PayPal non confermato.");
        }
        return;
      }

      if (active) {
        setStatus("failed");
        setMessage("Provider di pagamento non valido.");
      }
    }

    void verify();

    return () => {
      active = false;
    };
  }, [params, clear]);

  return (
    <div className="max-w-[760px] mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Esito pagamento</h1>
      <Card className="space-y-4">
        <div className="text-sm text-[var(--muted)]">
          {status === "loading" ? "Attendere..." : status === "paid" ? "Confermato" : "Da verificare"}
        </div>
        <div className="font-semibold">{message}</div>
        {status === "paid" ? (
          <div className="space-y-3">
            <div className="text-sm text-[var(--muted)]">
              Progetto inviato in produzione
              {productionOrderId ? ` (ID: ${productionOrderId})` : ""}.
            </div>
            {pickupCode ? (
              <Card>
                <div className="text-sm text-[var(--muted)]">Codice ritiro in negozio</div>
                <div className="mt-1 text-2xl font-semibold tracking-[0.1em]">{pickupCode}</div>
                {pickupQrPayload ? (
                  <div className="mt-3 flex justify-center">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        pickupQrPayload
                      )}`}
                      alt="QR ritiro"
                      width={180}
                      height={180}
                      className="rounded-xl border border-[var(--border)] bg-white p-2"
                    />
                  </div>
                ) : null}
                <div className="mt-2 text-xs text-[var(--muted)]">
                  Mostra questo codice/QR al ritiro.
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button>Torna alla home</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">Continua acquisti</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
