export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "biglietti-da-visita-premium",
    name: "Biglietti da Visita Premium",
    description: "Carta 350gr, stampa fronte/retro, finitura soft touch.",
    longDescription:
      "Biglietti da visita professionali per agenzie, studi e negozi. Qualita elevata e consegna rapida con controllo file incluso.",
    price: 49,
    category: "Ufficio",
    image: "/window.svg",
  },
  {
    id: "p2",
    slug: "volantini-a5-1000pz",
    name: "Volantini A5 - 1000 pz",
    description: "Carta patinata lucida 135gr, stampa a colori.",
    longDescription:
      "Volantini pensati per promozioni locali, eventi e aperture. File ottimizzato automaticamente e anteprima prima di stampare.",
    price: 79,
    category: "Promozione",
    image: "/file.svg",
  },
  {
    id: "p3",
    slug: "adesivi-personalizzati",
    name: "Adesivi Personalizzati",
    description: "Taglio sagomato, resistenti ad acqua e sole.",
    longDescription:
      "Adesivi in vinile per packaging, vetrine e branding. Disponibili in vari formati con laminazione protettiva.",
    price: 59,
    category: "Packaging",
    image: "/globe.svg",
  },
];

export function findProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
