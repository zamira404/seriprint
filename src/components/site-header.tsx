import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/carrello", label: "Carrello" },
  { href: "/profilo", label: "Profilo" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          SERIPRINT
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-blue-600">
              {link.label}
            </Link>
          ))}
          <Link
            href="/accedi"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-500"
          >
            Accedi
          </Link>
        </nav>
      </div>
    </header>
  );
}
