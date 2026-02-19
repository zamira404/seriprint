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
const LISTA_BARCODE_ENDPOINT = `${API_BASE}/ListaBarcode`;
const LISTINO_ENDPOINT = `${API_BASE}/Listino`;
const DISPONIBILITA_ENDPOINT = `${API_BASE}/Disponibilita`;

function normalizeCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function normalizeLoose(value: string) {
  return value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
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
  const descrizione = (item.descrizionebreve ?? "").toUpperCase();
  if (genere.includes("DONNA")) return "donna";
  if (genere.includes("UOMO")) return "uomo";
  if (genere.includes("BAMBINO") || genere.includes("KIDS")) return "bambino";
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
  const correlationRaw = process.env.BASIC_CODE_DUB || "61036";
  return {
    token: process.env.BASIC_API_TOKEN || "",
    brand: (process.env.BASIC_BRAND || "JHK").trim(),
    correlationCodes: correlationRaw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  };
}

async function fetchRawProducts() {
  const { token, brand } = config();
  if (!token || !brand) return [] as BasicListaProdottiItem[];
  return postBasic<BasicListaProdottiItem>(LISTA_PRODOTTI_ENDPOINT, token, { marchio: brand });
}

async function fetchBrandVariantSources(token: string, brand: string) {
  const [listino, disponibilita] = await Promise.all([
    postBasic<BasicVariantListItem>(LISTINO_ENDPOINT, token, { marchio: brand }),
    postBasic<BasicVariantListItem>(DISPONIBILITA_ENDPOINT, token, { marchio: brand }),
  ]);
  return { listino, disponibilita };
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

function productTypeRank(name: string) {
  const n = name.toUpperCase();
  if (n.includes("T-SHIRT")) return 0;
  if (n.includes("FELPA")) return 1;
  return 2;
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

function buildSupplierVariantMaps(
  listino: BasicVariantListItem[],
  disponibilita: BasicVariantListItem[]
) {
  const qtyByBarcode = new Map<string, number>();
  for (const item of disponibilita) {
    if (!item.barcode) continue;
    qtyByBarcode.set(item.barcode, Number(item.qta ?? 0));
  }

  const priceByBarcode = new Map<string, number>();
  const variantsByProduct = new Map<string, ProductVariant[]>();

  for (const row of listino) {
    const productCode = row.prodotto ? normalizeCode(row.prodotto) : "";
    const barcode = row.barcode || "";
    if (!productCode || !barcode) continue;

    const price = toPrice(row.prezzo?.[0]?.valore);
    const variant: ProductVariant = {
      barcode,
      size: row.des_taglia || "-",
      colorName: row.colore?.descrizione || "-",
      colorCode: row.colore?.codice || "",
      colorHex: row.colore?.hexcode || "#9aa3b5",
      imageUrl: toImageUrl(row.immagine),
      price,
      quantity: qtyByBarcode.get(barcode) ?? 0,
    };

    priceByBarcode.set(barcode, price);
    const prev = variantsByProduct.get(productCode) ?? [];
    prev.push(variant);
    variantsByProduct.set(productCode, prev);
  }

  return { qtyByBarcode, priceByBarcode, variantsByProduct };
}

function enrichFromAbbinamenti(
  item: BasicListaProdottiItem,
  qtyByBarcode: Map<string, number>,
  priceByBarcode: Map<string, number>
) {
  const out: ProductVariant[] = [];
  for (const v of item.abbinamenti ?? []) {
    const barcode = v.barcode || "";
    if (!barcode) continue;
    out.push({
      barcode,
      size: v.des_taglia || "-",
      colorName: v.colore?.descrizione || "-",
      colorCode: v.colore?.codice || "",
      colorHex: v.colore?.hexcode || "#9aa3b5",
      imageUrl: toImageUrl(v.immagine) || toImageUrl(item.immagine),
      price: priceByBarcode.get(barcode) ?? toPrice(v.prezzo?.[0]?.valore),
      quantity: qtyByBarcode.get(barcode) ?? 0,
    });
  }
  return out;
}

function isBuyable(variants: ProductVariant[]) {
  return variants.some((v) => v.price > 0 && v.quantity > 0);
}

function matchesCorrelation(item: BasicListaProdottiItem, correlationCodes: string[]) {
  if (correlationCodes.length === 0) return true;
  const code = normalizeLoose(item.prodotto);
  const codeNoPrefix = code.startsWith("O") ? code.slice(1) : code;

  return correlationCodes.some((raw) => {
    const hasWildcard = raw.includes("*");
    const normalized = normalizeLoose(raw.replace(/\*/g, ""));
    if (!normalized) return false;

    if (hasWildcard) {
      return code.startsWith(normalized) || codeNoPrefix.startsWith(normalized);
    }

    if (normalized.length <= 2) {
      return code.startsWith(normalized) || codeNoPrefix.startsWith(normalized);
    }

    return (
      code === normalized ||
      codeNoPrefix === normalized ||
      code.startsWith(normalized) ||
      codeNoPrefix.startsWith(normalized)
    );
  });
}

export async function getShopProducts(): Promise<Product[]> {
  try {
    const { token, brand, correlationCodes } = config();
    if (!token || !brand) return MOCK_PRODUCTS;

    const items = await fetchRawProducts();
    const { qtyByBarcode, priceByBarcode, variantsByProduct } =
      await fetchBrandVariantSources(token, brand).then(({ listino, disponibilita }) =>
        buildSupplierVariantMaps(listino, disponibilita)
      );

    const buyableAll: Product[] = [];
    const buyableCorrelation: Product[] = [];

    for (const raw of items) {
      const product = mapToShopProduct(raw);
      if (!product || !product.code) continue;

      const fromSupplier = variantsByProduct.get(product.code) ?? [];
      const fromAbbinamenti = enrichFromAbbinamenti(raw, qtyByBarcode, priceByBarcode);
      const variants = mergeWithFallback(fromSupplier, fromAbbinamenti);
      if (!isBuyable(variants)) continue;

      const uniqueColors = new Set(variants.map((v) => v.colorCode).filter(Boolean)).size;
      const uniqueSizes = new Set(variants.map((v) => v.size).filter(Boolean)).size;
      const availableQty = variants.reduce((sum, v) => sum + Math.max(0, v.quantity), 0);
      const enriched: Product = {
        ...product,
        colorCount: uniqueColors,
        sizeCount: uniqueSizes,
        availableQty,
      };

      buyableAll.push(enriched);
      if (matchesCorrelation(raw, correlationCodes)) {
        buyableCorrelation.push(enriched);
      }
    }

    const finalList = buyableCorrelation.length > 0 ? buyableCorrelation : buyableAll;
    const mapped = uniqByCode(finalList).sort((a, b) => {
      const ra = productTypeRank(a.name);
      const rb = productTypeRank(b.name);
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, "it");
    });
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

function mergeWithFallback(primary: ProductVariant[], fallback: ProductVariant[]) {
  if (primary.length === 0) return fallback;
  const byBarcode = new Map<string, ProductVariant>();
  for (const f of fallback) {
    byBarcode.set(f.barcode, f);
  }
  const merged = primary.map((p) => {
    const f = byBarcode.get(p.barcode);
    if (!f) return p;
    return {
      ...p,
      size: p.size === "-" ? f.size : p.size,
      colorName: p.colorName === "-" ? f.colorName : p.colorName,
      colorCode: p.colorCode || f.colorCode,
      colorHex: p.colorHex === "#9aa3b5" ? f.colorHex : p.colorHex,
      imageUrl: p.imageUrl || f.imageUrl,
      price: p.price > 0 ? p.price : f.price,
    };
  });
  return merged;
}

function mergeByBarcode(...lists: ProductVariant[][]) {
  const out = new Map<string, ProductVariant>();
  for (const list of lists) {
    for (const v of list) {
      const prev = out.get(v.barcode);
      if (!prev) {
        out.set(v.barcode, v);
        continue;
      }
      out.set(v.barcode, {
        ...prev,
        size: prev.size !== "-" ? prev.size : v.size,
        colorName: prev.colorName !== "-" ? prev.colorName : v.colorName,
        colorCode: prev.colorCode || v.colorCode,
        colorHex: prev.colorHex !== "#9aa3b5" ? prev.colorHex : v.colorHex,
        imageUrl: prev.imageUrl || v.imageUrl,
        price: prev.price > 0 ? prev.price : v.price,
        quantity: Math.max(prev.quantity, v.quantity),
      });
    }
  }
  return Array.from(out.values());
}

function variantsFromBarcodeRows(
  rows: BasicVariantListItem[],
  qtyByBarcode: Map<string, number>,
  priceByBarcode: Map<string, number>
) {
  const variants: ProductVariant[] = [];
  for (const row of rows) {
    const barcode = row.barcode || "";
    if (!barcode) continue;
    variants.push({
      barcode,
      size: row.des_taglia || "-",
      colorName: row.colore?.descrizione || "-",
      colorCode: row.colore?.codice || "",
      colorHex: row.colore?.hexcode || "#9aa3b5",
      imageUrl: toImageUrl(row.immagine),
      price: priceByBarcode.get(barcode) ?? toPrice(row.prezzo?.[0]?.valore),
      quantity: qtyByBarcode.get(barcode) ?? Number(row.qta ?? 0),
    });
  }
  return variants;
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

    const [barcodes, listino, disponibilita] = await Promise.all([
      postBasic<BasicVariantListItem>(LISTA_BARCODE_ENDPOINT, token, { marchio: brand, prodotto: normalized }),
      postBasic<BasicVariantListItem>(LISTINO_ENDPOINT, token, { marchio: brand, prodotto: normalized }),
      postBasic<BasicVariantListItem>(DISPONIBILITA_ENDPOINT, token, { marchio: brand, prodotto: normalized }),
    ]);

    const fromListino = mergeVariants(listino, disponibilita);
    const { qtyByBarcode, priceByBarcode } = buildSupplierVariantMaps(listino, disponibilita);
    const fromAbbinamenti = enrichFromAbbinamenti(productRaw, qtyByBarcode, priceByBarcode);
    const fromBarcode = variantsFromBarcodeRows(barcodes, qtyByBarcode, priceByBarcode);
    const variants = mergeByBarcode(fromListino, fromBarcode, fromAbbinamenti);

    return {
      product: mapped,
      description: productRaw.descrizionebreve,
      variants,
    };
  } catch {
    return null;
  }
}
