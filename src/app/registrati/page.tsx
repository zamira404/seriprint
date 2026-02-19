export default function RegistratiPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Registrati</h1>
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Nome" />
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" />
        <input
          type="password"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Password"
        />
        <button type="button" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white">
          Crea account
        </button>
      </form>
    </div>
  );
}
