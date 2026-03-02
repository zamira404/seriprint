import fs from "node:fs";
import path from "node:path";

type CheckoutItem = {
  id?: string;
  type?: "product" | "print";
  refId?: string;
  name?: string;
  price?: number;
  qty?: number;
  meta?: Record<string, unknown>;
};

type CheckoutCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  deliveryMethod?: "shipping" | "pickup";
  address?: string;
  billingAddress?: string;
};

export type CheckoutPayload = {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer?: CheckoutCustomer;
};

type DraftOrder = {
  id: string;
  createdAt: string;
  provider: "stripe" | "paypal";
  payload: CheckoutPayload;
};

export type ProductionOrder = {
  id: string;
  createdAt: string;
  paidAt: string;
  provider: "stripe" | "paypal";
  paymentRef: string;
  status: "paid";
  pickupCode: string;
  pickupQrPayload: string;
  customer: CheckoutCustomer;
  totals: { subtotal: number; shipping: number; total: number };
  items: Array<{
    line: number;
    type: "product" | "print";
    name: string;
    qty: number;
    unitPrice: number;
    personalization: {
      barcode?: string;
      color?: string;
      size?: string;
      text?: string;
      font?: string;
      printColor?: string;
      hasLogo?: boolean;
      cloudRefId?: string;
      mime?: string;
      kind?: string;
      rawMeta?: Record<string, unknown>;
    };
  }>;
};

type OrderStore = {
  drafts: Map<string, DraftOrder>;
  orders: Map<string, ProductionOrder>;
  byPaymentRef: Map<string, string>;
};

type PersistedStore = {
  drafts: DraftOrder[];
  orders: ProductionOrder[];
  byPaymentRef: Array<[string, string]>;
};

declare global {
  var __UNW_ORDER_STORE__: OrderStore | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rnd}`;
}

function makePickupCode(seed: string) {
  const compact = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const tail = compact.slice(-8).padStart(8, "0");
  return `UNW-${tail}`;
}

function dbFilePath() {
  return path.join(process.cwd(), "data", "production-orders.json");
}

function ensureDataDir() {
  const dir = path.dirname(dbFilePath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadStoreFromDisk(): OrderStore {
  try {
    const file = dbFilePath();
    if (!fs.existsSync(file)) {
      return {
        drafts: new Map(),
        orders: new Map(),
        byPaymentRef: new Map(),
      };
    }
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    return {
      drafts: new Map((parsed.drafts || []).map((d) => [d.id, d])),
      orders: new Map((parsed.orders || []).map((o) => [o.id, o])),
      byPaymentRef: new Map(parsed.byPaymentRef || []),
    };
  } catch {
    return {
      drafts: new Map(),
      orders: new Map(),
      byPaymentRef: new Map(),
    };
  }
}

function saveStoreToDisk(store: OrderStore) {
  ensureDataDir();
  const payload: PersistedStore = {
    drafts: Array.from(store.drafts.values()),
    orders: Array.from(store.orders.values()),
    byPaymentRef: Array.from(store.byPaymentRef.entries()),
  };
  fs.writeFileSync(dbFilePath(), JSON.stringify(payload, null, 2), "utf8");
}

function getStore(): OrderStore {
  if (!globalThis.__UNW_ORDER_STORE__) {
    globalThis.__UNW_ORDER_STORE__ = loadStoreFromDisk();
  }
  return globalThis.__UNW_ORDER_STORE__;
}

function sanitizeNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sanitizePayload(input: CheckoutPayload): CheckoutPayload {
  const items = Array.isArray(input.items) ? input.items : [];
  return {
    items: items.map((it) => ({
      id: String(it.id || ""),
      type: it.type === "print" ? "print" : "product",
      refId: it.refId ? String(it.refId) : undefined,
      name: String(it.name || "Articolo"),
      price: Math.max(0, sanitizeNumber(it.price)),
      qty: Math.max(1, Math.floor(sanitizeNumber(it.qty || 1))),
      meta: it.meta && typeof it.meta === "object" ? it.meta : undefined,
    })),
    subtotal: Math.max(0, sanitizeNumber(input.subtotal)),
    shipping: Math.max(0, sanitizeNumber(input.shipping)),
    total: Math.max(0, sanitizeNumber(input.total)),
    customer: input.customer || {},
  };
}

export function createDraftOrder(provider: "stripe" | "paypal", payload: CheckoutPayload) {
  const store = getStore();
  const id = uid("draft");
  store.drafts.set(id, {
    id,
    createdAt: nowIso(),
    provider,
    payload: sanitizePayload(payload),
  });
  saveStoreToDisk(store);
  return id;
}

export function finalizeOrderFromDraft(args: {
  provider: "stripe" | "paypal";
  paymentRef: string;
  draftId: string;
}) {
  const store = getStore();
  const paymentKey = `${args.provider}:${args.paymentRef}`;
  const existingOrderId = store.byPaymentRef.get(paymentKey);
  if (existingOrderId) {
    return store.orders.get(existingOrderId) || null;
  }

  const draft = store.drafts.get(args.draftId);
  if (!draft) return null;

  const customer = draft.payload.customer || {};
  const items = draft.payload.items.map((it, idx) => {
    const meta = (it.meta || {}) as Record<string, unknown>;
    return {
      line: idx + 1,
      type: it.type === "print" ? "print" : "product",
      name: String(it.name || "Articolo"),
      qty: Math.max(1, Number(it.qty || 1)),
      unitPrice: Math.max(0, Number(it.price || 0)),
      personalization: {
        barcode: typeof meta.barcode === "string" ? meta.barcode : undefined,
        color: typeof meta.color === "string" ? meta.color : undefined,
        size: typeof meta.size === "string" ? meta.size : undefined,
        text: typeof meta.text === "string" ? meta.text : undefined,
        font: typeof meta.font === "string" ? meta.font : undefined,
        printColor: typeof meta.printColor === "string" ? meta.printColor : undefined,
        hasLogo: Boolean(meta.hasLogo),
        cloudRefId: typeof it.refId === "string" ? it.refId : undefined,
        mime: typeof meta.mime === "string" ? meta.mime : undefined,
        kind: typeof meta.kind === "string" ? meta.kind : undefined,
        rawMeta: meta,
      },
    };
  });

  const order: ProductionOrder = {
    id: uid("ord"),
    createdAt: draft.createdAt,
    paidAt: nowIso(),
    provider: args.provider,
    paymentRef: args.paymentRef,
    status: "paid",
    pickupCode: makePickupCode(`${args.provider}-${args.paymentRef}`),
    pickupQrPayload: `UNAWATUNA_PICKUP|${args.provider}|${args.paymentRef}`,
    customer,
    totals: {
      subtotal: draft.payload.subtotal,
      shipping: draft.payload.shipping,
      total: draft.payload.total,
    },
    items,
  };

  store.orders.set(order.id, order);
  store.byPaymentRef.set(paymentKey, order.id);
  store.drafts.delete(args.draftId);
  saveStoreToDisk(store);
  return order;
}

export function listProductionOrders() {
  return Array.from(getStore().orders.values()).sort((a, b) =>
    a.paidAt < b.paidAt ? 1 : -1
  );
}

