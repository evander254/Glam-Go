import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, remove, setQty, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    if (!user) return navigate({ to: "/auth" });
    if (items.length === 0) return;
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total_amount: total })
      .select()
      .single();
    if (error || !order) {
      setBusy(false);
      return toast.error(error?.message ?? "Failed");
    }
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({ order_id: order.id, product_id: i.id, quantity: i.quantity, price: i.price }))
    );
    setBusy(false);
    if (itemsErr) return toast.error(itemsErr.message);
    toast.success("Order placed!");
    clear();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Your Cart</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Cart is empty.</p>
          <Link to="/shop"><Button className="mt-4">Shop now</Button></Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex-1">
                <p className="font-medium">{i.name}</p>
                <p className="text-sm text-muted-foreground">KES {i.price}</p>
              </div>
              <input
                type="number"
                min={1}
                value={i.quantity}
                onChange={(e) => setQty(i.id, parseInt(e.target.value) || 1)}
                className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
              />
              <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">KES {total}</span>
          </div>
          <Button className="w-full" size="lg" disabled={busy} onClick={checkout}>
            {busy ? "Placing order..." : "Place Order"}
          </Button>
        </div>
      )}
    </div>
  );
}