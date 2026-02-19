import "server-only";
import { MOCK_PRODUCTS, type Product } from "@/lib/data/products";

type BasicListaProdottiItem = {
  prodotto: string;
  descrizionebreve?: string;
  immagine?: string;
  informazioni?: {
    novita?: boolean;
    genere?: string;
    categoria?: string;
  };
  abbinamenti?: Array<{
    prezzo?: Array<{ valore?: number | string }>;
  }>;
};
type BasicListaProdottiResponse =
  | BasicListaProdottiItem[]
  | {
      prodotti?: BasicListaProdottiItem[];
      data?: BasicListaProdottiItem[];
    };

const BASIC_ENDPOINT =
  "https://webapi-basic.sys-web.it/Basic.WebAPI/api/Basic/ListaProdotti";

function parseCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function firstPrice(item: BasicListaProdottiItem) {
  const raw = item.abbinamenti?.[0]?.prezzo?.[0]?.valore;
  const value = typeof raw === "string" ? Number(raw.replace(",", ".")) : Number(raw ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getImageUrl(item: BasicListaProdottiItem) {
  if (!item.immagine) return undefined;
  return `https://basicweb.it/images/products/${item.immagine}`;
}

function mapCategory(item: BasicListaProdottiItem, shopperCodes: string[]): Product["category"] | null {
  const code = normalizeCode(item.prodotto);
  if (shopperCodes.includes(code)) return "shopper";

  const genere = (item.informazioni?.genere ?? "").toUpperCase();
  const categoria = (item.informazioni?.categoria ?? "").toUpperCase();

  if (genere.includes("DONNA")) return "donna";
  if (genere.includes("UOMO")) return "uomo";
  if (genere.includes("BAMBINO") || genere.includes("KIDS")) return "bambino";
  if (categoria.includes("SHOPPER") || categoria.includes("BAG")) return "shopper";
  return null;
}

function basicAuthHeader(token: string) {
  return token.startsWith("Basic ") ? token : `Basic ${token}`;
}

async function fetchBasicProducts(): Promise<Product[]> {
  const token = process.env.BASIC_API_TOKEN;
  if (!token) return [];
  const tokenValue = token;

  const dubCodes = parseCsv(process.env.BASIC_CODE_DUB || "61036").map(normalizeCode);
  const shopperCodes = parseCsv(process.env.BASIC_CODE_SHOPPER).map(normalizeCode);
  const allCodes = [...new Set([...dubCodes, ...shopperCodes])];
  const brand = (process.env.BASIC_BRAND || "JHK").trim();

  async function request(payload: Record<string, unknown>) {
    const response = await fetch(BASIC_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(tokenValue),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!response.ok) return [] as BasicListaProdottiItem[];
    const data = (await response.json()) as BasicListaProdottiResponse;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.prodotti)) return data.prodotti;
    if (Array.isArray(data.data)) return data.data;
    return [] as BasicListaProdottiItem[];
  }

  let items: BasicListaProdottiItem[] = [];
  if (allCodes.length > 0) {
    items = await request({ prodotti: allCodes });
  }
  if (items.length === 0 && brand) {
    items = await request({ marchio: brand });
  }
  if (items.length === 0) return [];

  const mapped = items.flatMap((item) => {
      const category = mapCategory(item, shopperCodes);
      if (!category) return [];

      const price = firstPrice(item);
      return [{
        id: `basic-${normalizeCode(item.prodotto)}`,
        code: normalizeCode(item.prodotto),
        name: item.descrizionebreve || item.prodotto,
        price,
        category,
        tag: item.informazioni?.novita ? "Nuovo" : undefined,
        imageUrl: getImageUrl(item),
      } satisfies Product];
    });

  return mapped;
}

export async function getShopProducts(): Promise<Product[]> {
  try {
    const api = await fetchBasicProducts();
    return api.length > 0 ? api : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}
