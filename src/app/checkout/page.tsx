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
const CARD_RE = /^\d{13,19}$/;
const CVV_RE = /^\d{3,4}$/;
const EXP_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;

type PaymentMethod = "card" | "paypal";
type DeliveryMethod = "shipping" | "pickup";

function normalizeCard(raw: string) {
  return raw.replace(/\D/g, "");
}

function isExpiryValid(value: string) {
  if (!EXP_RE.test(value)) return false;
  const [mm, yy] = value.split("/").map(Number);
  const year = 2000 + yy;
  const now = new Date();
  const month = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  return year > thisYear || (year === thisYear && mm >= month);
}

export default function CheckoutPage() {
  const toast = useToast();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("shipping");
  const [sameBilling, setSameBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bankAuthOpen, setBankAuthOpen] = useState(false);
  const [paypalVerified, setPaypalVerified] = useState(false);
  const [paying, setPaying] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
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

    if (paymentMethod === "card") {
      if (!cardHolder.trim()) return "Inserisci intestatario carta.";
      if (!CARD_RE.test(normalizeCard(cardNumber))) return "Numero carta non valido.";
      if (!isExpiryValid(cardExpiry)) return "Scadenza carta non valida (MM/YY).";
      if (!CVV_RE.test(cardCvv)) return "CVV non valido.";
    } else {
      if (!EMAIL_RE.test(paypalEmail)) return "Inserisci una email PayPal valida.";
      if (!paypalVerified) return "Conferma che il tuo account PayPal è verificato.";
    }

    return null;
  }

  function openConfirm() {
    const err = validateOrder();
    if (err) {
      toast.push({ title: err });
      return;
    }
    setConfirmOpen(true);
  }

  function confirmOrder() {
    setConfirmOpen(false);
    setBankAuthOpen(true);
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
          total,
          currency: "EUR",
          customer: { firstName, lastName, email, phone },
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

  function proceedToProviderAuth() {
    setBankAuthOpen(false);
    void startPayment();
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
              <div className="space-y-3">
                <Input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Intestatario carta" />
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Numero carta"
                  inputMode="numeric"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" />
                  <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="CVV" inputMode="numeric" />
                </div>
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
          <Button className="w-full mt-2" onClick={openConfirm} disabled={paying}>
            {paying ? "Reindirizzamento..." : "Vai al pagamento"}
          </Button>
          <Link href="/carrello" className="inline-flex text-sm text-[var(--muted)] underline">
            Torna al carrello
          </Link>
        </Card>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4">
          <Card className="w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Sicuro del tuo ordine?</h2>
            <p className="text-sm text-[var(--muted)]">
              Totale da pagare: <strong>{formatEUR(total)}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="w-full" onClick={confirmOrder}>
                Si, sono sicuro
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setConfirmOpen(false)}>
                No, non sono sicuro
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {bankAuthOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4">
          <Card className="w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Verifica banca tramite autorizzazione</h2>
            <p className="text-sm text-[var(--muted)]">
              Al prossimo step sarai reindirizzata al provider per la verifica reale (es. 3D Secure o login PayPal).
            </p>
            <Button className="w-full" onClick={proceedToProviderAuth} disabled={paying}>
              {paying ? "Reindirizzamento..." : "Continua alla verifica"}
            </Button>

            <Button variant="secondary" className="w-full" onClick={() => setBankAuthOpen(false)}>
              Annulla e torna al checkout
            </Button>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
