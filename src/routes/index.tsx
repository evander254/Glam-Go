import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Calendar, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/40 to-background">
        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Pro Makeup Artist
            </span>
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Glow up,<br /> on the go.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
              Bridal, soft glam, editorial & SFX makeup by Pam. Book your slot and shop pro-grade beauty essentials.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book"><Button size="lg"><Calendar className="mr-2 h-4 w-4" />Book a Service</Button></Link>
              <Link to="/shop"><Button size="lg" variant="outline"><ShoppingBag className="mr-2 h-4 w-4" />Shop Beauty</Button></Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-2xl" />
            <img src={hero} alt="Soft glam makeup look by Pam" className="relative aspect-square w-full rounded-3xl object-cover shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl font-bold">Signature Services</h2>
        <p className="mt-2 text-muted-foreground">Choose your look. Pricing in KES.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Soft Glam", 1000],
            ["Full Glam", 1200],
            ["Natural Look", 800],
            ["Bridal Trial", 1500],
            ["Bridal", 2500],
            ["SFX Makeup", 2000],
            ["Editorial", 1500],
          ].map(([name, price]) => (
            <div key={name as string} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-xl font-semibold">{name}</h3>
                <span className="text-primary font-bold">KES {price}</span>
              </div>
              <Link to="/book" className="mt-4 inline-block text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Book this →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
