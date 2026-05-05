import { Link } from "@tanstack/react-router";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();

  const linkCls = "text-sm font-medium text-foreground/70 hover:text-primary transition-colors";
  const activeCls = "text-primary";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg font-semibold tracking-tight">
            Glam &amp; Go <span className="text-primary">by Pam</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/book" className={linkCls} activeProps={{ className: activeCls }}>
            Book
          </Link>
          <Link to="/shop" className={linkCls} activeProps={{ className: activeCls }}>
            Shop
          </Link>
          {user && (
            <Link to="/dashboard" className={linkCls} activeProps={{ className: activeCls }}>
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={linkCls} activeProps={{ className: activeCls }}>
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Button size="sm" variant="outline" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
      <nav className="flex items-center justify-around border-t border-border px-4 py-2 md:hidden">
        <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>Home</Link>
        <Link to="/book" className={linkCls} activeProps={{ className: activeCls }}>Book</Link>
        <Link to="/shop" className={linkCls} activeProps={{ className: activeCls }}>Shop</Link>
        {user && <Link to="/dashboard" className={linkCls} activeProps={{ className: activeCls }}>My</Link>}
        {isAdmin && <Link to="/admin" className={linkCls} activeProps={{ className: activeCls }}>Admin</Link>}
      </nav>
    </header>
  );
}