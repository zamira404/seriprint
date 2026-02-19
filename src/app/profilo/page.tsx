export default function ProfiloPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Profilo</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-semibold">Dati account</h2>
          <p className="text-sm text-slate-600">Nome: Cliente Demo</p>
          <p className="text-sm text-slate-600">Email: cliente@seriprint.it</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-semibold">Ordini recenti</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Ordine #SP-1004 - In produzione</li>
            <li>Ordine #SP-1001 - Consegnato</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
