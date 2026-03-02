import net from "node:net";

export type ScanVerdict =
  | { clean: true; scanned: true; detail: string }
  | { clean: false; scanned: true; detail: string }
  | { clean: true; scanned: false; detail: string };

function parsePort(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function isTruthy(value: string | undefined) {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function isClamAVRequired() {
  return isTruthy(process.env.CLAMAV_REQUIRED);
}

export function isClamAVConfigured() {
  return Boolean(process.env.CLAMAV_HOST);
}

export async function scanBufferWithClamAV(buffer: Buffer): Promise<ScanVerdict> {
  const host = process.env.CLAMAV_HOST;
  if (!host) {
    return { clean: true, scanned: false, detail: "scanner_not_configured" };
  }

  const port = parsePort(process.env.CLAMAV_PORT, 3310);
  const timeoutMs = parsePort(process.env.CLAMAV_TIMEOUT_MS, 8000);

  return await new Promise<ScanVerdict>((resolve) => {
    const socket = net.createConnection({ host, port });
    let response = "";
    let done = false;

    const finish = (verdict: ScanVerdict) => {
      if (done) return;
      done = true;
      try {
        socket.destroy();
      } catch {}
      resolve(verdict);
    };

    socket.setTimeout(timeoutMs);

    socket.on("timeout", () => finish({ clean: false, scanned: true, detail: "scanner_timeout" }));
    socket.on("error", () => finish({ clean: false, scanned: true, detail: "scanner_error" }));
    socket.on("data", (chunk) => {
      response += chunk.toString("utf8");
    });
    socket.on("end", () => {
      const r = response.trim();
      if (r.includes("FOUND")) {
        finish({ clean: false, scanned: true, detail: r });
      } else if (r.includes("OK")) {
        finish({ clean: true, scanned: true, detail: r });
      } else {
        finish({ clean: false, scanned: true, detail: r || "scanner_unknown_response" });
      }
    });

    socket.on("connect", () => {
      try {
        socket.write("zINSTREAM\0");
        let offset = 0;
        const chunkSize = 64 * 1024;
        while (offset < buffer.length) {
          const end = Math.min(offset + chunkSize, buffer.length);
          const chunk = buffer.subarray(offset, end);
          const len = Buffer.alloc(4);
          len.writeUInt32BE(chunk.length, 0);
          socket.write(len);
          socket.write(chunk);
          offset = end;
        }
        const zero = Buffer.alloc(4);
        zero.writeUInt32BE(0, 0);
        socket.write(zero);
        socket.end();
      } catch {
        finish({ clean: false, scanned: true, detail: "scanner_stream_error" });
      }
    });
  });
}
