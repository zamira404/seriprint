import "server-only";
import { MOCK_PRODUCTS, type Product } from "@/lib/data/products";

type BasicPrice = { qta?: number; valore?: number | string };
type BasicColor = { cartella?: string; codice?: string; descrizione?: string; hexcode?: string };

type BasicListaProdottiItem = {
  prodotto: string;
  descrizionebreve?: string;
  immagine?: string;
  informazioni?: {
    novita?: boolean;
    genere?: string;
    categoria?: string;
    cod_categoria?: string;
  };
  abbinamenti?: Array<{
    barcode?: string;
    colore?: BasicColor;
    immagine?: string;
    des_taglia?: string;
    prezzo?: BasicPrice[];
  }>;
};

type BasicVariantListItem = {
  prodotto?: string;
  barcode?: string;
  colore?: BasicColor;
  immagine?: string;
  taglia?: number;
  des_taglia?: string;
  prezzo?: BasicPrice[];
  qta?: number;
};

type BasicEnvelope<T> = T[] | { prodotti?: T[]; barcodes?: T[]; data?: T[] };

export type ProductVariant = {
  barcode: string;
  size: string;
  colorName: string;
  colorCode: string;
  colorHex: string;
  imageUrl?: string;
  price: number;
  quantity: number;
};

export type ProductDetail = {
  product: Product;
  description?: string;
  variants: ProductVariant[];
};

const API_BASE = "https://webapi-basic.sys-web.it/Basic.WebAPI/api/Basic";
const LISTA_PRODOTTI_ENDPOINT = `${API_BASE}/ListaProdotti`;
const LISTINO_ENDPOINT = `${API_BASE}/Listino`;
const DISPONIBILITA_ENDPOINT = `${API_BASE}/Disponibilita`;

function normalizeCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function toImageUrl(filename?: string) {
  if (!filename) return undefined;
  return `https://basicweb.it/images/products/${filename}`;
}

function toPrice(raw?: number | string) {
  const parsed = typeof raw === "string" ? Number(raw.replace(",", ".")) : Number(raw ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function firstPrice(item: BasicListaProdottiItem) {
  return toPrice(item.abbinamenti?.[0]?.prezzo?.[0]?.valore);
}

function mapCategory(item: BasicListaProdottiItem): Product["category"] | null {
  const genere = (item.informazioni?.genere ?? "").toUpperCase();
  const categoria = (item.informazioni?.categoria ?? "").toUpperCase();
  const codCategoria = (item.informazioni?.cod_categoria ?? "").toUpperCase();
  const descrizione = (item.descrizionebreve ?? "").toUpperCase();
  const apparelAllowed = codCategoria === "001" || codCategoria === "003";

  if (genere.includes("DONNA") && apparelAllowed) return "donna";
  if (genere.includes("UOMO") && apparelAllowed) return "uomo";
  if ((genere.includes("BAMBINO") || genere.includes("KIDS")) && apparelAllowed) return "bambino";
  if (categoria.includes("CANVAS") || descrizione.includes("CANVAS")) return "canvas";
  if (categoria.includes("CASA") || descrizione.includes("CASA")) return "casa";
  return null;
}

function basicAuthHeader(token: string) {
  return token.startsWith("Basic ") ? token : `Basic ${token}`;
}

function unwrapEnvelope<T>(raw: BasicEnvelope<T>) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.prodotti)) return raw.prodotti;
  if (Array.isArray(raw.barcodes)) return raw.barcodes;
  if (Array.isArray(raw.data)) return raw.data;
  return [] as T[];
}

async function postBasic<T>(endpoint: string, token: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) return [] as T[];
  const data = (await response.json()) as BasicEnvelope<T>;
  return unwrapEnvelope(data);
}

function config() {
  return {
    token: process.env.BASIC_API_TOKEN || "",
    brand: (process.env.BASIC_BRAND || "JHK").trim(),
  };
}

async function fetchRawProducts() {
  const { token, brand } = config();
  if (!token || !brand) return [] as BasicListaProdottiItem[];
  return postBasic<BasicListaProdottiItem>(LISTA_PRODOTTI_ENDPOINT, token, { marchio: brand });
}

function mapToShopProduct(item: BasicListaProdottiItem): Product | null {
  const code = normalizeCode(item.prodotto);
  const category = mapCategory(item);
  if (!category) return null;

  return {
    id: `basic-${code}`,
    code,
    name: item.descrizionebreve || item.prodotto,
    price: firstPrice(item),
    category,
    tag: item.informazioni?.novita ? "Nuovo" : undefined,
    imageUrl: toImageUrl(item.immagine),
  };
}

function uniqByCode(products: Product[]) {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.code || p.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getShopProducts(): Promise<Product[]> {
  try {
    const items = await fetchRawProducts();
    const mapped = uniqByCode(items.map(mapToShopProduct).filter((x): x is Product => Boolean(x)));
    return mapped.length > 0 ? mapped : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

function mergeVariants(
  listino: BasicVariantListItem[],
  disponibilita: BasicVariantListItem[]
) {
  const qtaByBarcode = new Map<string, number>();
  for (const item of disponibilita) {
    if (!item.barcode) continue;
    qtaByBarcode.set(item.barcode, Number(item.qta ?? 0));
  }

  const variants: ProductVariant[] = [];
  for (const v of listino) {
    const barcode = v.barcode || "";
    if (!barcode) continue;
    variants.push({
      barcode,
      size: v.des_taglia || "-",
      colorName: v.colore?.descrizione || "-",
      colorCode: v.colore?.codice || "",
      colorHex: v.colore?.hexcode || "#9aa3b5",
      imageUrl: toImageUrl(v.immagine),
      price: toPrice(v.prezzo?.[0]?.valore),
      quantity: qtaByBarcode.get(barcode) ?? 0,
    });
  }

  return variants.sort((a, b) => a.size.localeCompare(b.size) || a.colorName.localeCompare(b.colorName));
}

export async function getProductDetail(code: string): Promise<ProductDetail | null> {
  try {
    const normalized = normalizeCode(code);
    const { token, brand } = config();
    if (!token || !brand) return null;

    const [productRaw] = await postBasic<BasicListaProdottiItem>(LISTA_PRODOTTI_ENDPOINT, token, {
      prodotti: [normalized],
    });
    if (!productRaw) return null;

    const mapped = mapToShopProduct(productRaw);
    if (!mapped) return null;

    const [listino, disponibilita] = await Promise.all([
      postBasic<BasicVariantListItem>(LISTINO_ENDPOINT, token, { marchio: brand, prodotto: normalized }),
      postBasic<BasicVariantListItem>(DISPONIBILITA_ENDPOINT, token, { marchio: brand, prodotto: normalized }),
    ]);

    const variants = mergeVariants(listino, disponibilita);

    return {
      product: mapped,
      description: productRaw.descrizionebreve,
      variants,
    };
  } catch {
    return null;
  }
}
