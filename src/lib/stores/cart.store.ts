"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";

export type CartItem = {
  id: string;
  type: "product" | "print";
  refId?: string;
  name: string;
  price: number;
  qty: number;
  meta?: Record<string, unknown>;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "id" | "qty"> & { qty?: number }) => void;
  remove: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const qty = item.qty ?? 1;
        const existing = get().items.find(
          (x) => x.type === item.type && x.refId && item.refId && x.refId === item.refId
        );
        if (existing) {
          set({
            items: get().items.map((x) =>
              x.id === existing.id ? { ...x, qty: x.qty + qty } : x
            ),
          });
          return;
        }
        set({ items: [{ id: uid("c"), qty, ...item }, ...get().items] });
      },
      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      inc: (id) =>
        set({
          items: get().items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
        }),
      dec: (id) =>
        set({
          items: get().items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)),
        }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, x) => sum + x.qty, 0),
      subtotal: () => get().items.reduce((sum, x) => sum + x.price * x.qty, 0),
    }),
    { name: "unawatuna_cart_v1" }
  )
);
