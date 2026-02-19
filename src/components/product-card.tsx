import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex h-36 items-center justify-center rounded-lg bg-slate-50">
        <Image src={product.image} alt={product.name} width={72} height={72} />
      </div>
      <p className="mb-1 text-xs font-semibold uppercase text-blue-600">{product.category}</p>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{product.name}</h3>
      <p className="mb-3 text-sm text-slate-600">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">EUR {product.price}</span>
        <Link
          href={`/prodotto/${product.slug}`}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Dettagli
        </Link>
      </div>
    </article>
  );
}
