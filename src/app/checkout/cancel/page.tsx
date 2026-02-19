import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-[760px] mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Pagamento annullato</h1>
      <Card className="space-y-4">
        <div className="text-sm text-[var(--muted)]">Nessun addebito effettuato.</div>
        <div className="font-semibold">Puoi tornare al carrello e riprovare quando vuoi.</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/carrello">
            <Button>Torna al carrello</Button>
          </Link>
          <Link href="/checkout">
            <Button variant="secondary">Riprova pagamento</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
