import Link from "next/link";

export default function AccediPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Accedi</h1>
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" />
        <input
          type="password"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Password"
        />
        <button type="button" className="w-full rounded-md bg-slate-900 px-4 py-2 text-white">
          Entra
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Non hai un account?{" "}
        <Link href="/registrati" className="font-semibold text-blue-700">
          Registrati
        </Link>
      </p>
    </div>
  );
}
