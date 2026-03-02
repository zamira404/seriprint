import { NextResponse } from "next/server";
import Stripe from "stripe";
import { finalizeOrderFromDraft } from "@/lib/server/order-pipeline";

export async function GET(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY non configurata." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id mancante." }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    let orderId: string | undefined;
    let pickupCode: string | undefined;
    let pickupQrPayload: string | undefined;
    if (paid && session.metadata?.draft_id) {
      const order = finalizeOrderFromDraft({
        provider: "stripe",
        paymentRef: session.id,
        draftId: session.metadata.draft_id,
      });
      orderId = order?.id;
      pickupCode = order?.pickupCode;
      pickupQrPayload = order?.pickupQrPayload;
    }
    return NextResponse.json({
      paid,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      orderId,
      pickupCode,
      pickupQrPayload,
    });
  } catch {
    return NextResponse.json({ error: "Errore verifica sessione Stripe." }, { status: 500 });
  }
}
