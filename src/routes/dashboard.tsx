import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Booking = { id: string; booking_date: string; booking_time: string; status: string; services: { name: string; price: number } | null };
type Order = { id: string; total_amount: number; status: string; created_at: string };

function Dashboard() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bookings").select("id,booking_date,booking_time,status,services(name,price)").eq("user_id", user.id).order("booking_date", { ascending: false })
      .then(({ data }) => data && setBookings(data as unknown as Booking[]));
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => data && setOrders(data as Order[]));
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        <Link to="/auth"><Button className="mt-4">Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">My Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">My Bookings</h2>
        <div className="mt-3 space-y-2">
          {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium">{b.services?.name ?? "Service"}</p>
                <p className="text-xs text-muted-foreground">{b.booking_date} at {b.booking_time}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">My Orders</h2>
        <div className="mt-3 space-y-2">
          {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium">KES {o.total_amount}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "completed" ? "bg-green-100 text-green-700"
    : status === "confirmed" ? "bg-blue-100 text-blue-700"
    : "bg-amber-100 text-amber-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{status}</span>;
}