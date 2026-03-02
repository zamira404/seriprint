import { NextResponse } from "next/server";
import { listProductionOrders } from "@/lib/server/order-pipeline";

function isAuthorized(req: Request) {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected) return true;

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (token === expected) return true;
  }

  const u = new URL(req.url);
  const token = u.searchParams.get("token");
  return token === expected;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  return NextResponse.json({ orders: listProductionOrders() });
}

