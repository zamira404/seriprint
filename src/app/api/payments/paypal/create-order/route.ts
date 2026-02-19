import { NextResponse } from "next/server";

type PayPalAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type ReqBody = {
  total: number;
  currency?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

function getPayPalBaseUrl() {
  const env = process.env.PAYPAL_BASE_URL?.trim();
  if (env) return env;
  return "https://api-m.sandbox.paypal.com";
}

function appUrlFromRequest(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl;
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
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
    const text = await res.text();
    throw new Error(`PayPal token error: ${text}`);
  }

  const data = (await res.json()) as PayPalAccessTokenResponse;
  return data.access_token;
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
    const body = (await req.json()) as ReqBody;
    const total = Number(body.total || 0);
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "Totale non valido." }, { status: 400 });
    }

    const currency = (body.currency || "EUR").toUpperCase();
    const baseUrl = getPayPalBaseUrl();
    const appUrl = appUrlFromRequest(req);
    const accessToken = await getAccessToken(baseUrl, clientId, secret);

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: total.toFixed(2),
            },
            description: "Ordine stampa-shop",
          },
        ],
        payer: body.customer?.email
          ? {
              email_address: body.customer.email,
              name: {
                given_name: body.customer.firstName || "",
                surname: body.customer.lastName || "",
              },
            }
          : undefined,
        application_context: {
          user_action: "PAY_NOW",
          return_url: `${appUrl}/checkout/success?provider=paypal`,
          cancel_url: `${appUrl}/checkout/cancel`,
        },
      }),
      cache: "no-store",
    });

    const orderData = (await orderRes.json()) as {
      id?: string;
      links?: Array<{ rel: string; href: string }>;
      message?: string;
    };
    if (!orderRes.ok) {
      return NextResponse.json(
        { error: orderData.message || "Errore creazione ordine PayPal." },
        { status: 500 }
      );
    }

    const approveUrl = orderData.links?.find((l) => l.rel === "approve")?.href;
    if (!approveUrl || !orderData.id) {
      return NextResponse.json({ error: "Risposta PayPal non valida." }, { status: 500 });
    }

    return NextResponse.json({ approveUrl, orderId: orderData.id });
  } catch {
    return NextResponse.json({ error: "Errore PayPal create-order." }, { status: 500 });
  }
}
