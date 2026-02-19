import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProductCustomizer } from "@/components/ProductCustomizer";
import { getProductDetail } from "@/lib/server/basic-products";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function ShopProductPage({ params }: PageProps) {
  const { code } = await params;
  const detail = await getProductDetail(code);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">
            {detail.product.name}
          </h1>
          <p className="text-[var(--muted)]">Codice articolo: {detail.product.code}</p>
        </div>
        <Link href="/shop" className="text-sm underline">
          Torna allo shop
        </Link>
      </div>

      {detail.variants.length === 0 ? (
        <Card>
          <div className="text-sm text-[var(--muted)]">
            Nessuna variante disponibile al momento.
          </div>
        </Card>
      ) : (
        <ProductCustomizer detail={detail} />
      )}
    </div>
  );
}
