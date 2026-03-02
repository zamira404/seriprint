import { NextResponse } from "next/server";
import { UI } from "@/lib/constants";
import { isClamAVConfigured, isClamAVRequired, scanBufferWithClamAV } from "@/lib/server/clamav";

export const runtime = "nodejs";

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

export async function POST(req: Request) {
  try {
    if (isClamAVRequired() && !isClamAVConfigured()) {
      return NextResponse.json(
        { error: "Scanner antivirus richiesto ma non configurato." },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const candidates = form.getAll("files");
    const files = candidates.filter((x): x is File => x instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Nessun file ricevuto." }, { status: 400 });
    }

    const maxBytes = UI.maxCloudFileSizeMB * 1024 * 1024;
    const acceptedIndices: number[] = [];
    let rejectedType = 0;
    let rejectedSize = 0;
    let rejectedMalware = 0;
    let rejectedName = 0;
    let scanned = false;
    const rejected: Array<{ index: number; name: string; reason: "type" | "size" | "name" | "malware" | "scan_error" }> = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];

      if (!isAllowedFile(file)) {
        rejectedType += 1;
        rejected.push({ index: i, name: file.name, reason: "type" });
        continue;
      }

      if (hasSuspiciousName(file.name)) {
        rejectedName += 1;
        rejected.push({ index: i, name: file.name, reason: "name" });
        continue;
      }

      if (file.size > maxBytes) {
        rejectedSize += 1;
        rejected.push({ index: i, name: file.name, reason: "size" });
        continue;
      }

      const verdict = await scanBufferWithClamAV(Buffer.from(await file.arrayBuffer()));
      scanned = scanned || verdict.scanned;

      if (isClamAVRequired() && !verdict.scanned) {
        return NextResponse.json(
          { error: "Scanner antivirus richiesto ma non disponibile." },
          { status: 503 }
        );
      }

      if (!verdict.clean) {
        if (verdict.detail.includes("FOUND")) {
          rejectedMalware += 1;
          rejected.push({ index: i, name: file.name, reason: "malware" });
        } else {
          rejected.push({ index: i, name: file.name, reason: "scan_error" });
        }
        continue;
      }

      acceptedIndices.push(i);
    }

    return NextResponse.json({
      acceptedIndices,
      rejectedType,
      rejectedSize,
      rejectedName,
      rejectedMalware,
      scanned,
      rejected,
    });
  } catch {
    return NextResponse.json({ error: "Errore validazione upload Cloud." }, { status: 500 });
  }
}
