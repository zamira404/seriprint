import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

export default function CatalogoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Catalogo</h1>
      <p className="mb-6 text-slate-600">Seleziona un prodotto e personalizza il tuo ordine.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
