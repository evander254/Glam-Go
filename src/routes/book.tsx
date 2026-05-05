import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({ component: BookPage });

type Service = { id: string; name: string; price: number };

const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

function BookPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("services").select("id,name,price").order("price").then(({ data }) => {
      if (data) {
        setServices(data);
        setServiceId(data[0]?.id ?? "");
      }
    });
  }, []);

  const submit = async () => {
    if (!user) return navigate({ to: "/auth" });
    if (!serviceId || !date || !time) return toast.error("Please fill all fields");
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: serviceId,
      booking_date: date,
      booking_time: time,
      notes: notes || null,
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505") toast.error("That slot is already booked. Pick another time.");
      else toast.error(error.message);
    } else {
      toast.success("Booking requested! We'll confirm soon.");
      navigate({ to: "/dashboard" });
    }
  };

  if (loading) return null;

  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Book your appointment</h1>
      <p className="mt-1 text-muted-foreground">Pick your service, date, and time.</p>

      {!user ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to book.</p>
          <Link to="/auth"><Button className="mt-4">Sign in</Button></Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <Label>Service</Label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — KES {s.price}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Time</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`rounded-md border px-2 py-2 text-sm transition ${time === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests?" />
          </div>
          <Button className="w-full" disabled={busy} onClick={submit}>
            {busy ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      )}
    </div>
  );
}