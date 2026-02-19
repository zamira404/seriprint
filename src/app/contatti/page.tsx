"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ContattiPage() {
  const toast = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [msg, setMsg] = React.useState("");

  function submit() {
    if (!name || !email || !msg) {
      toast.push({ title: "Compila tutti i campi" });
      return;
    }
    toast.push({ title: "Messaggio inviato ✓" });
    setName("");
    setEmail("");
    setMsg("");
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Contatti</h1>
        <p className="text-[var(--muted)]">Scrivici: rispondiamo con attenzione.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <Card>
          <div className="space-y-3">
            <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <textarea
              className="unw-ease w-full min-h-[140px] rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:shadow-[var(--glow-blue)] outline-none"
              placeholder="Messaggio"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <Button onClick={submit}>Invia</Button>
          </div>
        </Card>

        <Card>
          <div className="text-sm text-[var(--muted)]">FAQ</div>
          <div className="mt-3 space-y-3">
            {[
              { q: "Quanto restano salvati i file nel Cloud?", a: "Nel MVP restano sul tuo dispositivo (localStorage). Poi li colleghiamo a un vero storage." },
              { q: "Posso caricare foto e documenti?", a: "Si. Puoi filtrare per tipo e selezionare per stampa." },
              { q: "Come funziona la stampa?", a: "Seleziona i file nel Cloud e aggiungili al carrello. Checkout completo in arrivo." },
            ].map((x) => (
              <details key={x.q} className="rounded-2xl border border-[var(--border)] bg-white/5 p-3">
                <summary className="cursor-pointer font-semibold">{x.q}</summary>
                <div className="mt-2 text-sm text-[var(--muted)]">{x.a}</div>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
