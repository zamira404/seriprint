"use client";

import { useState } from "react";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export default function RegistratiPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!PASSWORD_REGEX.test(password)) {
      setError(
        "Password non valida: minimo 6 caratteri, 1 maiuscola, 1 numero e 1 carattere speciale."
      );
      return;
    }

    setError("");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Registrati</h1>
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Nome" />
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Password"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Crea account
        </button>
      </form>
    </div>
  );
}
