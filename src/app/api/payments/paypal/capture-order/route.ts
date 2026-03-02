import { NextResponse } from "next/server";
import { finalizeOrderFromDraft } from "@/lib/server/order-pipeline";

type PayPalAccessTokenResponse = {
  access_token: string;
};

function getPayPalBaseUrl() {
  const env = process.env.PAYPAL_BASE_URL?.trim();
  if (env) return env;
  return "https://api-m.sandbox.paypal.com";
}

async function getAccessToken(baseUrl: string, clientId: string, secret: string) {
  const basic = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Token PayPal non ottenuto.");
  }

  const data = (await res.json()) as PayPalAccessTokenResponse;
  return data.access_token;
}

async function getOrderCustomId(baseUrl: string, accessToken: string, orderId: string) {
  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as {
    purchase_units?: Array<{ custom_id?: string }>;
  };
  return data.purchase_units?.[0]?.custom_id;
}

export async function POST(req: Request) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) {
    return NextResponse.json(
      { error: "Configura PAYPAL_CLIENT_ID e PAYPAL_SECRET." },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as { orderId?: string };
    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId mancante." }, { status: 400 });
    }

    const baseUrl = getPayPalBaseUrl();
    const accessToken = await getAccessToken(baseUrl, clientId, secret);
    const draftId = await getOrderCustomId(baseUrl, accessToken, orderId);

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const captureData = (await captureRes.json()) as {
      status?: string;
      id?: string;
      message?: string;
      purchase_units?: Array<{ payments?: { captures?: Array<{ id?: string }> } }>;
    };

    if (!captureRes.ok) {
      return NextResponse.json(
        { error: captureData.message || "Errore capture PayPal." },
        { status: 500 }
      );
    }

    const completed = captureData.status === "COMPLETED";
    let productionOrderId: string | undefined;
    let pickupCode: string | undefined;
    let pickupQrPayload: string | undefined;
    if (completed && draftId) {
      const paymentRef =
        captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
        captureData.id ||
        orderId;
      const order = finalizeOrderFromDraft({
        provider: "paypal",
        paymentRef,
        draftId,
      });
      productionOrderId = order?.id;
      pickupCode = order?.pickupCode;
      pickupQrPayload = order?.pickupQrPayload;
    }

    return NextResponse.json({
      paid: completed,
      status: captureData.status,
      orderId: captureData.id || orderId,
      productionOrderId,
      pickupCode,
      pickupQrPayload,
    });
  } catch {
    return NextResponse.json({ error: "Errore PayPal capture-order." }, { status: 500 });
  }
}
