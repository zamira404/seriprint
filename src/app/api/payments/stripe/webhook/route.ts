import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Configura STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Header stripe-signature mancante." }, { status: 400 });
    }

    const payload = await req.text();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      // TODO: salva ordine pagato su DB (event.data.object.id)
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook Stripe non valido." }, { status: 400 });
  }
}
