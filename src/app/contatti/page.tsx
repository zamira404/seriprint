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
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[var(--yellow)]">Contatti</h1>
        <p className="text-[var(--muted)]">Scrivici: rispondiamo con attenzione.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <Card className="flex min-h-[460px] items-center justify-center">
          <div className="mx-auto w-full max-w-[560px] space-y-3">
            <Input className="mt-4" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <textarea
              className="unw-ease w-full min-h-[140px] rounded-2xl bg-white/5 border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:shadow-[var(--glow-blue)] outline-none"
              placeholder="Messaggio"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <div className="flex justify-center">
              <Button onClick={submit}>Invia</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <div className="space-y-3">
              <div className="text-sm text-[var(--yellow)]">Sede</div>
              <div className="font-semibold text-[var(--yellow)]">UNAWATUNA</div>
              <div className="space-y-2 text-sm">
                <div className="text-[var(--muted)]">
                  <span className="font-medium text-[var(--text)]">Indirizzo:</span>{" "}
                  Via Palombarese, 154/E-F, 00013 Fonte Nuova RM
                </div>
                <div>
                  <a className="text-[var(--blue)] hover:underline" href="tel:+39069051472">
                    <span className="font-medium text-[var(--text)]">Telefono:</span> 06 905 1472
                  </a>
                </div>
                <div>
                  <a className="text-[var(--blue)] hover:underline" href="mailto:staff@seriprint.it">
                    <span className="font-medium text-[var(--text)]">Email:</span> staff@seriprint.it
                  </a>
                </div>
              </div>
              <a
                className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:underline"
                href="https://wa.me/393400938712"
                target="_blank"
                rel="noreferrer"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[#0b0f1a]">
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.7.8-2.8-.2-.3A8.3 8.3 0 1 1 12 20.2Zm4.6-6.2c-.2-.1-1.3-.7-1.5-.8s-.4-.1-.6.1-.7.8-.8.9-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4a.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 2 .8 2.5.9 2.6 1.7 2.7 4.1 3.8c.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1s-.2-.1-.4-.2Z"
                    />
                  </svg>
                </span>
                WhatsApp: 340 093 8712
              </a>

              <details className="rounded-2xl border border-[var(--border)] bg-white/5 p-3">
                <summary className="cursor-pointer list-none font-semibold flex items-center justify-between">
                  Orari di apertura
                  <span className="text-[var(--muted)]">▼</span>
                </summary>
                <div className="mt-3 text-sm text-[var(--muted)] space-y-1">
                  <div>lunedi: 09-13, 16:30-19:30</div>
                  <div>martedi: 09-13, 16:30-19:30</div>
                  <div>mercoledi: 09-13, 16:30-19:30</div>
                  <div>giovedi: 09-13, 16:30-19:30</div>
                  <div>venerdi: 09-13, 16:30-19:30</div>
                  <div>sabato: 09-13</div>
                  <div>domenica: Chiuso</div>
                </div>
              </details>
            </div>
          </Card>

          <Card>
            <div className="text-sm text-[var(--yellow)]">FAQ</div>
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
    </div>
  );
}
