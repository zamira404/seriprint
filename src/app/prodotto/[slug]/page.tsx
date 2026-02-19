import Link from "next/link";
import { notFound } from "next/navigation";
import { findProductBySlug, products } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProdottoPage({ params }: Props) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="mb-1 text-sm font-semibold uppercase text-blue-700">{product.category}</p>
      <h1 className="mb-3 text-3xl font-bold">{product.name}</h1>
      <p className="mb-6 text-slate-600">{product.longDescription}</p>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <p className="mb-2 text-sm text-slate-600">Prezzo base</p>
        <p className="text-3xl font-black text-slate-900">EUR {product.price}</p>
      </div>
      <div className="flex gap-3">
        <Link href="/carrello" className="rounded-md bg-slate-900 px-4 py-2 text-white">
          Aggiungi al carrello
        </Link>
        <Link href="/catalogo" className="rounded-md border border-slate-300 px-4 py-2">
          Torna al catalogo
        </Link>
      </div>
    </div>
  );
}
