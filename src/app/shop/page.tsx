import { ShopClient } from "@/components/ShopClient";
import { getShopProducts } from "@/lib/server/basic-products";

export default async function ShopPage() {
  const products = await getShopProducts();
  return <ShopClient products={products} />;
}
