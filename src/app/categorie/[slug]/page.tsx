import { notFound } from "next/navigation";
import { CATEGORY_SLUGS, CategorySlug } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { getShopProducts } from "@/lib/server/basic-products";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const typedSlug = slug as CategorySlug;
  if (!CATEGORY_SLUGS.includes(typedSlug)) return notFound();

  const products = await getShopProducts();
  const list = products.filter((p) => p.category === typedSlug);

  return (
    <div className="space-y-6">
      <div className="unw-card p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(800px 400px at 25% 20%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(700px 420px at 80% 30%, rgba(43,89,255,0.20), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="text-xs text-[var(--muted)]">Categoria</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] uppercase">{typedSlug}</h1>
          <p className="mt-2 text-[var(--muted)] max-w-[60ch]">
            Prodotti disponibili per questa categoria.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
