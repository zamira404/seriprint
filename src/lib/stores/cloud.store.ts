"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UI } from "@/lib/constants";
import { uid } from "@/lib/utils";

export type CloudFileKind = "photo" | "doc";

export type CloudFile = {
  id: string;
  name: string;
  kind: CloudFileKind;
  mime: string;
  size: number;
  createdAt: string;
  previewDataUrl?: string;
  selectedForPrint: boolean;
};

type CloudState = {
  files: CloudFile[];
  query: string;
  tab: "all" | "photo" | "doc";
  setQuery: (q: string) => void;
  setTab: (t: CloudState["tab"]) => void;
  addFiles: (files: File[]) => Promise<{ added: number; blocked: boolean }>;
  removeFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  toggleSelect: (id: string) => void;
  selectVisible: (ids: string[]) => void;
  clearSelection: () => void;
  usage: () => { used: number; max: number };
  visibleFiles: () => CloudFile[];
  selectedIds: () => string[];
};

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const useCloudStore = create<CloudState>()(
  persist(
    (set, get) => ({
      files: [],
      query: "",
      tab: "all",
      setQuery: (q) => set({ query: q }),
      setTab: (t) => set({ tab: t }),
      addFiles: async (incoming) => {
        const current = get().files.length;
        const remaining = UI.maxCloudFiles - current;
        if (remaining <= 0) return { added: 0, blocked: true };

        const toAdd = incoming.slice(0, remaining);
        const mapped: CloudFile[] = [];
        for (const f of toAdd) {
          const isPhoto = f.type.startsWith("image/");
          const kind: CloudFileKind = isPhoto ? "photo" : "doc";
          let previewDataUrl: string | undefined;
          if (isPhoto) {
            try {
              previewDataUrl = await fileToDataUrl(f);
            } catch {
              previewDataUrl = undefined;
            }
          }
          mapped.push({
            id: uid("f"),
            name: f.name,
            kind,
            mime: f.type || "application/octet-stream",
            size: f.size,
            createdAt: new Date().toISOString(),
            previewDataUrl,
            selectedForPrint: false,
          });
        }

        set({ files: [...mapped, ...get().files] });
        return { added: mapped.length, blocked: incoming.length > toAdd.length };
      },
      removeFile: (id) => set({ files: get().files.filter((x) => x.id !== id) }),
      renameFile: (id, newName) =>
        set({
          files: get().files.map((x) => (x.id === id ? { ...x, name: newName } : x)),
        }),
      toggleSelect: (id) =>
        set({
          files: get().files.map((x) =>
            x.id === id ? { ...x, selectedForPrint: !x.selectedForPrint } : x
          ),
        }),
      selectVisible: (ids) =>
        set({
          files: get().files.map((x) =>
            ids.includes(x.id) ? { ...x, selectedForPrint: true } : x
          ),
        }),
      clearSelection: () =>
        set({ files: get().files.map((x) => ({ ...x, selectedForPrint: false })) }),
      usage: () => ({ used: get().files.length, max: UI.maxCloudFiles }),
      visibleFiles: () => {
        const q = get().query.trim().toLowerCase();
        const tab = get().tab;
        return get().files.filter((f) => {
          const matchesTab =
            tab === "all" ? true : tab === "photo" ? f.kind === "photo" : f.kind === "doc";
          const matchesQuery = q ? f.name.toLowerCase().includes(q) : true;
          return matchesTab && matchesQuery;
        });
      },
      selectedIds: () => get().files.filter((x) => x.selectedForPrint).map((x) => x.id),
    }),
    { name: "unawatuna_cloud_v1" }
  )
);
