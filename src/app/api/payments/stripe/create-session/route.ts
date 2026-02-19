import { NextResponse } from "next/server";
import Stripe from "stripe";

type ReqItem = {
  name: string;
  price: number;
  qty: number;
};

function appUrlFromRequest(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl;
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY non configurata." }, { status: 500 });
  }

  try {
    const body = (await req.json()) as {
      items: ReqItem[];
      shipping: number;
      customer?: { email?: string; firstName?: string; lastName?: string };
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Nessun articolo nel checkout." }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const appUrl = appUrlFromRequest(req);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map((it) => ({
      quantity: Math.max(1, Number(it.qty || 1)),
      price_data: {
        currency: "eur",
        product_data: { name: it.name || "Articolo" },
        unit_amount: Math.round(Math.max(0, Number(it.price || 0)) * 100),
      },
    }));

    if (body.shipping > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: { name: "Spedizione" },
          unit_amount: Math.round(body.shipping * 100),
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${appUrl}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      customer_email: body.customer?.email,
      metadata: {
        customer_name: `${body.customer?.firstName || ""} ${body.customer?.lastName || ""}`.trim(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Errore creazione sessione Stripe." }, { status: 500 });
  }
}
