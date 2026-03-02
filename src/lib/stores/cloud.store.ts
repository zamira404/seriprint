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
  addFiles: (files: File[]) => Promise<{
    added: number;
    blocked: boolean;
    rejectedType: number;
    rejectedSize: number;
    rejectedName: number;
  }>;
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

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/svg+xml",
]);

const ALLOWED_EXT = new Set([".pdf", ".jpg", ".jpeg", ".svg"]);

function getExt(name: string) {
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i).toLowerCase();
}

function isAllowedFile(file: File) {
  const ext = getExt(file.name);
  const hasAllowedMime = file.type ? ALLOWED_MIME.has(file.type.toLowerCase()) : false;
  return hasAllowedMime || ALLOWED_EXT.has(ext);
}

function isJpegFile(file: File) {
  const mime = (file.type || "").toLowerCase();
  if (mime === "image/jpeg") return true;
  const ext = getExt(file.name);
  return ext === ".jpg" || ext === ".jpeg";
}

function hasSuspiciousName(name: string) {
  const lower = name.toLowerCase();
  const parts = lower.split(".").filter(Boolean);
  if (parts.length < 2) return true;
  const banned = [".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".ps1", ".js", ".vbs"];
  if (banned.some((x) => lower.endsWith(x))) return true;
  if (parts.length > 2) {
    const middle = parts.slice(1, -1).map((x) => `.${x}`);
    if (middle.some((x) => banned.includes(x))) return true;
  }
  return false;
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
        if (remaining <= 0) {
          return { added: 0, blocked: true, rejectedType: 0, rejectedSize: 0, rejectedName: 0 };
        }

        const maxBytes = UI.maxCloudFileSizeMB * 1024 * 1024;
        const valid = incoming.filter((f) => isAllowedFile(f) && f.size <= maxBytes && !hasSuspiciousName(f.name));
        const rejectedType = incoming.filter((f) => !isAllowedFile(f)).length;
        const rejectedSize = incoming.filter((f) => isAllowedFile(f) && f.size > maxBytes).length;
        const rejectedName = incoming.filter((f) => isAllowedFile(f) && hasSuspiciousName(f.name)).length;

        const toAdd = valid.slice(0, remaining);
        const mapped: CloudFile[] = [];
        for (const f of toAdd) {
          const isPhoto = isJpegFile(f);
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
        return {
          added: mapped.length,
          blocked: valid.length > toAdd.length,
          rejectedType,
          rejectedSize,
          rejectedName,
        };
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
