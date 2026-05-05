import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({ component: ShopPage });

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  description: string | null;
};

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setProducts(data as Product[]);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Beauty Shop</h1>
      <p className="mt-1 text-muted-foreground">Pro-grade products curated by Pam.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg">
            <div className="aspect-square w-full bg-gradient-to-br from-accent to-secondary">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
            </div>
            <div className="p-4">
              {p.category && <p className="text-xs uppercase text-muted-foreground">{p.category}</p>}
              <h3 className="mt-1 font-semibold">{p.name}</h3>
              {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-primary">KES {p.price}</span>
                <Button size="sm" onClick={() => { add({ id: p.id, name: p.name, price: p.price }); toast.success("Added to cart"); }}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}