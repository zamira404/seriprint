import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createDraftOrder } from "@/lib/server/order-pipeline";

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
      items: Array<{ name: string; price: number; qty: number }>;
      subtotal: number;
      shipping: number;
      total: number;
      customer?: { email?: string; firstName?: string; lastName?: string };
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Nessun articolo nel checkout." }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const appUrl = appUrlFromRequest(req);
    const draftId = createDraftOrder("stripe", {
      items: body.items,
      subtotal: Number(body.subtotal || 0),
      shipping: Number(body.shipping || 0),
      total: Number(body.total || 0),
      customer: body.customer,
    });

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
        draft_id: draftId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore creazione sessione Stripe.";
    console.error("Stripe create-session error:", err);
    return NextResponse.json({ error: `Errore Stripe: ${message}` }, { status: 500 });
  }
}
