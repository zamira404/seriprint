export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Admin</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Ordini oggi</p>
          <p className="text-3xl font-black">14</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Fatturato oggi</p>
          <p className="text-3xl font-black">EUR 1.940</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Ticket aperti</p>
          <p className="text-3xl font-black">3</p>
        </article>
      </div>
    </div>
  );
}
