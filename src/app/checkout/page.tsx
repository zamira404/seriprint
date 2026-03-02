"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/stores/cart.store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatEUR } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;
type PaymentMethod = "card" | "paypal";
type DeliveryMethod = "shipping" | "pickup";

export default function CheckoutPage() {
  const toast = useToast();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("shipping");
  const [sameBilling, setSameBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paypalVerified, setPaypalVerified] = useState(false);
  const [paying, setPaying] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [paypalEmail, setPaypalEmail] = useState("");

  const shipping = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    return subtotal >= 59 ? 0 : 6.9;
  }, [deliveryMethod, subtotal]);

  const total = subtotal + shipping;

  function validateOrder() {
    if (items.length === 0) return "Il carrello è vuoto.";
    if (!firstName.trim() || !lastName.trim()) return "Inserisci nome e cognome.";
    if (!EMAIL_RE.test(email)) return "Inserisci una email valida.";
    if (!PHONE_RE.test(phone)) return "Inserisci un telefono valido.";
    if (deliveryMethod === "shipping" && !address.trim()) return "Inserisci indirizzo di spedizione.";
    if (!sameBilling && !billingAddress.trim()) return "Inserisci indirizzo di fatturazione.";

    if (paymentMethod === "paypal") {
      if (!EMAIL_RE.test(paypalEmail)) return "Inserisci una email PayPal valida.";
      if (!paypalVerified) return "Conferma che il tuo account PayPal è verificato.";
    }

    return null;
  }

  function submitOrder() {
    const err = validateOrder();
    if (err) {
      toast.push({ title: err });
      return;
    }
    void startPayment();
  }

  async function startPayment() {
    try {
      setPaying(true);
      if (paymentMethod === "card") {
        const resp = await fetch("/api/payments/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            subtotal,
            shipping,
            total,
            customer: {
              firstName,
              lastName,
              email,
              phone,
              deliveryMethod,
              address,
              billingAddress: sameBilling ? address : billingAddress,
            },
          }),
        });
        const data = (await resp.json()) as { url?: string; error?: string };
        if (!resp.ok || !data.url) {
          toast.push({ title: data.error || "Impossibile avviare pagamento carta." });
          setPaying(false);
          return;
        }
        window.location.href = data.url;
        return;
      }

      const resp = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          shipping,
          total,
          currency: "EUR",
          customer: {
            firstName,
            lastName,
            email,
            phone,
            deliveryMethod,
            address,
            billingAddress: sameBilling ? address : billingAddress,
          },
        }),
      });
      const data = (await resp.json()) as { approveUrl?: string; error?: string };
      if (!resp.ok || !data.approveUrl) {
        toast.push({ title: data.error || "Impossibile avviare pagamento PayPal." });
        setPaying(false);
        return;
      }
      window.location.href = data.approveUrl;
    } catch {
      toast.push({ title: "Errore avvio pagamento. Riprova." });
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Checkout</h1>
        <p className="text-[var(--muted)]">Completa i dati e conferma l ordine.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">
        <div className="space-y-3">
          <Card className="space-y-3">
            <div className="text-lg font-semibold">Dati cliente</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" />
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Cognome" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefono" />
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="text-lg font-semibold">Consegna</div>
            <div className="flex flex-wrap gap-2">
              <Button variant={deliveryMethod === "shipping" ? "secondary" : "ghost"} onClick={() => setDeliveryMethod("shipping")}>
                Spedizione {subtotal >= 59 ? "(Gratis)" : `(${formatEUR(6.9)})`}
              </Button>
              <Button variant={deliveryMethod === "pickup" ? "secondary" : "ghost"} onClick={() => setDeliveryMethod("pickup")}>
                Ritiro in negozio (Gratis)
              </Button>
            </div>
            {deliveryMethod === "shipping" ? (
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Indirizzo di spedizione" />
            ) : null}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameBilling}
                onChange={(e) => setSameBilling(e.target.checked)}
              />
              Stesso indirizzo di fatturazione
            </label>

            {!sameBilling ? (
              <Input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Indirizzo di fatturazione" />
            ) : null}
          </Card>

          <Card className="space-y-3">
            <div className="text-lg font-semibold">Pagamento</div>
            <div className="flex gap-2">
              <Button variant={paymentMethod === "card" ? "secondary" : "ghost"} onClick={() => setPaymentMethod("card")}>
                Carta
              </Button>
              <Button variant={paymentMethod === "paypal" ? "secondary" : "ghost"} onClick={() => setPaymentMethod("paypal")}>
                PayPal
              </Button>
            </div>

            {paymentMethod === "card" ? (
              <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
                I dati carta verranno inseriti in modo sicuro nella pagina Stripe al passo successivo.
              </div>
            ) : (
              <div className="space-y-2">
                <Input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="Email PayPal" type="email" />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={paypalVerified}
                    onChange={(e) => setPaypalVerified(e.target.checked)}
                  />
                  Confermo che il mio account PayPal è verificato
                </label>
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit space-y-2">
          <div className="text-lg font-semibold">Riepilogo ordine</div>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotale</span>
            <span>{formatEUR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Spedizione</span>
            <span>{shipping === 0 ? "Gratis" : formatEUR(shipping)}</span>
          </div>
          <div className="unw-divider pt-2 flex items-center justify-between">
            <span className="font-medium">Totale</span>
            <span className="text-lg font-bold">{formatEUR(total)}</span>
          </div>
          <Button className="w-full mt-2" onClick={submitOrder} disabled={paying}>
            {paying ? "Reindirizzamento..." : "Vai al pagamento"}
          </Button>
          <Link href="/carrello" className="inline-flex text-sm text-[var(--muted)] underline">
            Torna al carrello
          </Link>
        </Card>
      </div>

    </div>
  );
}
