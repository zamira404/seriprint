import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PRODUCT_CATEGORY_ORDER } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative unw-card overflow-hidden p-8 sm:p-10">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(800px 400px at 20% 10%, rgba(43,89,255,0.25), transparent 55%), radial-gradient(700px 420px at 80% 30%, rgba(124,58,237,0.22), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="text-xs text-[var(--muted)]">UNAWATUNA • Premium calm</div>
          <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-tight">
            Carica, organizza, stampa. <span className="text-[var(--yellow)]">Senza stress</span>.
          </h1>
          <p className="mt-4 max-w-[56ch] text-[var(--muted)]">
            Un esperienza tech e rilassante: tutto resta in ordine, pronto quando vuoi.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/shop"><Button>Vai allo Shop</Button></Link>
            <Link href="/cloud"><Button variant="secondary">Apri Cloud</Button></Link>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em]">Categorie</h2>
          <div className="text-sm text-[var(--muted)]">Esplora con calma.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCT_CATEGORY_ORDER.map((slug) => (
            <Link key={slug} href={`/categorie/${slug}`}>
              <Card className="unw-ease hover:translate-y-[-2px] hover:shadow-[var(--shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--muted)]">Selezione premium</div>
                    <div className="mt-1 text-lg font-semibold capitalize">{slug}</div>
                  </div>
                  <div className="text-[var(--violet)] text-xl">➜</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { t: "1) Carica", d: "Trascina i file nel Cloud: rimangono pronti per te." },
          { t: "2) Organizza", d: "Filtra per foto/documenti, rinomina, seleziona per stampa." },
          { t: "3) Stampa", d: "Aggiungi al carrello e procedi con calma." },
        ].map((x) => (
          <Card key={x.t} className="unw-ease">
            <div className="text-sm text-[var(--muted)]">{x.t}</div>
            <div className="mt-2 font-semibold">{x.d}</div>
          </Card>
        ))}
      </section>
    </div>
  );
}
