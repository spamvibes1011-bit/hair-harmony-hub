import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Be Bodywise" },
      { name: "description", content: "Choose a new password for your Be Bodywise account." },
      { property: "og:title", content: "Set a new password | Be Bodywise" },
      { property: "og:description", content: "Choose a new password for your Be Bodywise account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY" || e === "SIGNED_IN") setReady(true); });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent): Promise<unknown> {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-7 shadow-sm">
        <h1 className="text-xl font-bold">Set a new password</h1>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">Open this page from the reset link in your email. If the link expired, request a new one from the sign-in page.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="pw">New password</Label><Input id="pw" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></div>
            <div className="space-y-1.5"><Label htmlFor="pw2">Confirm password</Label><Input id="pw2" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></div>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </main>
  );
}
