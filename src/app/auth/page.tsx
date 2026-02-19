"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useToast } from "@/components/ui/Toast";

export default function AuthPage() {
  const toast = useToast();
  const [tab, setTab] = React.useState<"login" | "register">("login");

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");

  async function submit() {
    if (!email || !pass) {
      toast.push({ title: "Inserisci email e password" });
      return;
    }
    if (tab === "login") {
      await login(email, pass);
      toast.push({ title: "Benvenuta ✓" });
      window.location.href = "/";
      return;
    }
    if (!name) {
      toast.push({ title: "Inserisci il nome" });
      return;
    }
    await register(name, email, pass);
    toast.push({ title: "Account creato ✓" });
    window.location.href = "/";
  }

  return (
    <div className="max-w-[680px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Account</h1>
        <p className="text-[var(--muted)]">Accedi o crea un account. Con calma.</p>
      </div>

      <Card>
        <Tabs
          value={tab}
          onChange={(k) => setTab(k as "login" | "register")}
          tabs={[
            { key: "login", label: "Accedi" },
            { key: "register", label: "Registrati" },
          ]}
        />

        <div className="mt-5 space-y-3">
          {tab === "register" ? (
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
          ) : null}
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
          <Input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" type="password" />

          <Button className="w-full mt-2" onClick={submit}>
            {tab === "login" ? "Accedi" : "Crea account"}
          </Button>

          <div className="text-xs text-[var(--muted)]">
            MVP: login mock (poi lo colleghi al backend quando vuoi).
          </div>
        </div>
      </Card>
    </div>
  );
}
