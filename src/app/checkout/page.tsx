export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
      <p className="mb-6 text-slate-600">Completa i dati per confermare l ordine.</p>
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Nome e cognome"
        />
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" />
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Telefono" />
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          rows={4}
          placeholder="Note ordine"
        />
        <button type="button" className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white">
          Conferma ordine (demo)
        </button>
      </form>
    </div>
  );
}
