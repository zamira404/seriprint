import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CloudAccessButton } from "@/components/CloudAccessButton";
import { PRODUCT_CATEGORY_ORDER } from "@/lib/constants";
import { getShopProducts } from "@/lib/server/basic-products";

export default async function HomePage() {
  const products = await getShopProducts();
  const categoryImages = PRODUCT_CATEGORY_ORDER.reduce(
    (acc, slug) => {
      const firstWithImage = products.find((p) => p.category === slug && p.imageUrl);
      acc[slug] = firstWithImage?.imageUrl || "/file.svg";
      return acc;
    },
    {} as Record<(typeof PRODUCT_CATEGORY_ORDER)[number], string>
  );

  return (
    <div className="space-y-10">
      <div className="-mx-2 sm:-mx-4 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-3">
        <section className="relative unw-card unw-led-blue overflow-hidden p-3 sm:p-4 h-full flex">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(800px 400px at 20% 10%, rgba(43,89,255,0.25), transparent 55%), radial-gradient(700px 420px at 80% 30%, rgba(124,58,237,0.22), transparent 60%)",
            }}
          />
          <div className="relative w-full flex flex-col items-center justify-center text-center">
            <h1 className="text-base sm:text-lg font-semibold tracking-[-0.01em] leading-tight">
              Carica, organizza, stampa. <span className="text-[var(--yellow)]">Senza stress</span>.
            </h1>
            <p className="mt-2 max-w-[64ch] text-sm text-[var(--muted)]">
              Un esperienza tech e rilassante: tutto resta in ordine, pronto quando vuoi.
            </p>
            <div className="mt-3 flex justify-center">
              <CloudAccessButton />
            </div>
          </div>
        </section>
        <section className="relative unw-card unw-led-violet p-3 sm:p-4 h-full flex flex-col items-center justify-center text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(560px 260px at 12% 0%, rgba(124,58,237,0.2), transparent 60%), radial-gradient(480px 220px at 88% 100%, rgba(43,89,255,0.16), transparent 62%)",
            }}
          />
          <div className="relative">
            <h2 className="text-base sm:text-lg font-semibold tracking-[-0.01em] leading-tight">
              Capi e accessori già stampati, <span className="text-[var(--yellow)]">pronti per te</span>.
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Accedi allo shop e scegli quello che ti rappresenta.
            </p>
          </div>
          <div className="relative mt-3 flex justify-center">
            <Link href="/shop">
              <Button variant="secondary" className="px-4 py-1.5 text-sm rounded-xl">
                👉 Vai allo shop
              </Button>
            </Link>
          </div>
        </section>
      </div>
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em]">Categorie</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCT_CATEGORY_ORDER.map((slug) => (
            <Link key={slug} href={`/categorie/${slug}`}>
              <Card className="unw-ease p-4 hover:translate-y-[-2px] hover:shadow-[var(--shadow)]">
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white/5 h-[240px] sm:h-[260px]">
                  <Image
                    src={categoryImages[slug]}
                    alt={slug}
                    width={900}
                    height={600}
                    className="h-full w-full object-contain object-center p-3"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="mt-1 text-lg font-semibold uppercase">{slug}</div>
                  </div>
                  <div className="text-[var(--violet)] text-xl">➜</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
