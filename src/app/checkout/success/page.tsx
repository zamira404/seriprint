"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart.store";

type Status = "loading" | "paid" | "failed";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifica pagamento in corso...");

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
        const data = (await res.json()) as { paid?: boolean; error?: string };
        if (!active) return;

        if (res.ok && data.paid) {
          clear();
          setStatus("paid");
          setMessage("Pagamento confermato. Ordine completato.");
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
        const data = (await res.json()) as { paid?: boolean; error?: string };
        if (!active) return;

        if (res.ok && data.paid) {
          clear();
          setStatus("paid");
          setMessage("Pagamento PayPal confermato. Ordine completato.");
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
