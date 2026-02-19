import type { CategorySlug } from "@/lib/constants";

export type Product = {
  id: string;
  code?: string;
  name: string;
  price: number;
  category: CategorySlug;
  tag?: "Nuovo" | "Popolare";
  imageUrl?: string;
};

function svg(text: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="#2B59FF" stop-opacity="0.35" offset="0"/>
        <stop stop-color="#7C3AED" stop-opacity="0.35" offset="1"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#10182B"/>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="ui-sans-serif, system-ui" font-size="46" fill="#EAF0FF" opacity="0.9">
      ${text}
    </text>
  </svg>`)}`
}

export const MOCK_PRODUCTS: Product[] = [
  { id: "mock-1", name: "T-shirt Premium Soft", price: 24.9, category: "donna", tag: "Popolare", imageUrl: svg("Donna") },
  { id: "mock-2", name: "Hoodie Urban Calm", price: 59.9, category: "uomo", tag: "Nuovo", imageUrl: svg("Uomo") },
  { id: "mock-3", name: "Felpa Kids Cozy", price: 39.9, category: "bambino", imageUrl: svg("Bambino") },
  { id: "mock-4", name: "Shopper Canvas Strong", price: 19.9, category: "shopper", tag: "Popolare", imageUrl: svg("Shopper") },
  { id: "mock-5", name: "Stampa Casa Minimal", price: 29.9, category: "casa", imageUrl: svg("Casa") },
  { id: "mock-6", name: "Canvas Premium 30x40", price: 49.9, category: "canvas", tag: "Nuovo", imageUrl: svg("Canvas") },
  { id: "mock-7", name: "T-shirt Nordic Fit", price: 26.9, category: "donna", imageUrl: svg("Donna") },
  { id: "mock-8", name: "Maglia Tech-Lite", price: 34.9, category: "uomo", imageUrl: svg("Uomo") },
  { id: "mock-9", name: "Body Baby Soft", price: 18.9, category: "bambino", imageUrl: svg("Bambino") },
  { id: "mock-10", name: "Shopper Daily Blue", price: 17.9, category: "shopper", imageUrl: svg("Shopper") },
  { id: "mock-11", name: "Poster Casa Calm", price: 14.9, category: "casa", imageUrl: svg("Casa") },
  { id: "mock-12", name: "Canvas Luxe 50x70", price: 79.9, category: "canvas", imageUrl: svg("Canvas") },
];
