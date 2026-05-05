import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Booking = { id: string; booking_date: string; booking_time: string; status: string; user_id: string; services: { name: string } | null };
type Order = { id: string; total_amount: number; status: string; created_at: string; user_id: string };
type Product = { id: string; name: string; category: string | null; price: number; stock: number; description: string | null; image_url: string | null };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Gate msg="Sign in required." />;
  if (!isAdmin) return <Gate msg="Admin access only." />;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
      <Tabs defaultValue="bookings" className="mt-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings"><BookingsAdmin /></TabsContent>
        <TabsContent value="orders"><OrdersAdmin /></TabsContent>
        <TabsContent value="products"><ProductsAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

function Gate({ msg }: { msg: string }) {
  return (
    <div className="container mx-auto max-w-md px-4 py-12 text-center">
      <p className="text-muted-foreground">{msg}</p>
      <Link to="/"><Button className="mt-4">Home</Button></Link>
    </div>
  );
}

function BookingsAdmin() {
  const [items, setItems] = useState<Booking[]>([]);
  const load = () =>
    supabase.from("bookings").select("id,booking_date,booking_time,status,user_id,services(name)").order("booking_date", { ascending: false })
      .then(({ data }) => data && setItems(data as unknown as Booking[]));
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  return (
    <div className="mt-4 space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No bookings.</p>}
      {items.map((b) => (
        <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div>
            <p className="font-medium">{b.services?.name ?? "Service"}</p>
            <p className="text-xs text-muted-foreground">{b.booking_date} at {b.booking_time}</p>
          </div>
          <select value={b.status} onChange={(e) => update(b.id, e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function OrdersAdmin() {
  const [items, setItems] = useState<Order[]>([]);
  const load = () =>
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => data && setItems(data as Order[]));
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };
  return (
    <div className="mt-4 space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No orders.</p>}
      {items.map((o) => (
        <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div>
            <p className="font-medium">KES {o.total_amount}</p>
            <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
          </div>
          <select value={o.status} onChange={(e) => update(o.id, e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", category: "", price: 0, stock: 0, description: "", image_url: "" });
  const load = () =>
    supabase.from("products").select("*").order("created_at", { ascending: false })
      .then(({ data }) => data && setItems(data as Product[]));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.price) return toast.error("Name and price required");
    const { error } = await supabase.from("products").insert(form);
    if (error) toast.error(error.message);
    else { toast.success("Product added"); setForm({ name: "", category: "", price: 0, stock: 0, description: "", image_url: "" }); load(); }
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold">Add product</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} /></div>
          <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} /></div>
          <div className="sm:col-span-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <Button className="mt-3" onClick={create}>Add Product</Button>
      </div>

      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">KES {p.price} · stock {p.stock}</p>
            </div>
            <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}