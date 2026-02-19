import type { CategorySlug } from "@/lib/constants";
import { uid } from "@/lib/utils";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: CategorySlug;
  tag?: "Nuovo" | "Popolare";
  imageSvg?: string;
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

export const PRODUCTS: Product[] = [
  { id: uid("p"), name: "T-shirt Premium Soft", price: 24.9, category: "donna", tag: "Popolare", imageSvg: svg("Donna") },
  { id: uid("p"), name: "Hoodie Urban Calm", price: 59.9, category: "uomo", tag: "Nuovo", imageSvg: svg("Uomo") },
  { id: uid("p"), name: "Felpa Kids Cozy", price: 39.9, category: "bambino", imageSvg: svg("Bambino") },
  { id: uid("p"), name: "Shopper Canvas Strong", price: 19.9, category: "shopper", tag: "Popolare", imageSvg: svg("Shopper") },
  { id: uid("p"), name: "Stampa Casa Minimal", price: 29.9, category: "casa", imageSvg: svg("Casa") },
  { id: uid("p"), name: "Canvas Premium 30x40", price: 49.9, category: "canvas", tag: "Nuovo", imageSvg: svg("Canvas") },
  { id: uid("p"), name: "T-shirt Nordic Fit", price: 26.9, category: "donna", imageSvg: svg("Donna") },
  { id: uid("p"), name: "Maglia Tech-Lite", price: 34.9, category: "uomo", imageSvg: svg("Uomo") },
  { id: uid("p"), name: "Body Baby Soft", price: 18.9, category: "bambino", imageSvg: svg("Bambino") },
  { id: uid("p"), name: "Shopper Daily Blue", price: 17.9, category: "shopper", imageSvg: svg("Shopper") },
  { id: uid("p"), name: "Poster Casa Calm", price: 14.9, category: "casa", imageSvg: svg("Casa") },
  { id: uid("p"), name: "Canvas Luxe 50x70", price: 79.9, category: "canvas", imageSvg: svg("Canvas") },
];
