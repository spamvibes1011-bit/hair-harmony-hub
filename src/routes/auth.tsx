import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizePassword, signupMetadata } from "@/lib/signup";

type Mode = "signin" | "signup" | "forgot";

function safePath(p: unknown) {
  if (typeof p !== "string") return "/";
  try {
    const u = new URL(p, "http://x");
    if (!p.startsWith("/") || p.startsWith("//") || u.pathname.startsWith("/auth")) return "/";
    return u.pathname + u.search + u.hash;
  } catch {
    return "/";
  }
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s["redirect"] === "string" ? (s["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in | Be Bodywise" },
      {
        name: "description",
        content: "Sign in or create your Be Bodywise account to track your hair-care routine.",
      },
      { property: "og:title", content: "Sign in | Be Bodywise" },
      {
        property: "og:description",
        content: "Access your personal Be Bodywise hair-care companion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safePath(redirect);
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (redirect) sessionStorage.setItem("bw-after-login", target);
    const go = () => {
      const dest = safePath(sessionStorage.getItem("bw-after-login") ?? target);
      sessionStorage.removeItem("bw-after-login");
      navigate({ to: dest, replace: true });
    };
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) go();
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, redirect, target]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signin") {
        let { error } = await supabase.auth.signInWithPassword({
          email,
          password: normalizePassword(password),
        });
        if (error) {
          ({ error } = await supabase.auth.signInWithPassword({
            email,
            password: legacyPassword(password),
          }));
        }
        if (error) throw error;
        const displayName = name.trim();
        if (displayName) {
          await supabase.auth.updateUser({
            data: { display_name: displayName, full_name: displayName },
          });
        }
      } else if (mode === "signup") {
        const metadata = signupMetadata(name, password);
        const { data, error } = await supabase.auth.signUp({
          email,
          password: normalizePassword(password),
          options: {
            emailRedirectTo: window.location.origin,
            data: metadata,
          },
        });
        if (error) throw error;
        if (!data.session) setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If an account exists for that email, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setBusy(false);
    }
  }

  const title =
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset your password";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="wordmark mb-8 text-center">
          <small>be</small>bodywise<span className="text-primary">.</span>
        </p>
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "forgot"
              ? "We'll email you a secure link."
              : "Your daily hair-care companion."}
          </p>
          {mode !== "forgot" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-6 w-full"
                onClick={google}
                disabled={busy}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Zm-5.6-8c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6Z"
                  />
                </svg>
                Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <form onSubmit={submit} className={`space-y-4 ${mode === "forgot" ? "mt-6" : ""}`}>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={80}
                  placeholder="Shown in your greeting"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-primary"
                      onClick={() => {
                        setMode("forgot");
                        setNotice(null);
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder="Anything works — no rules"
                />
              </div>
            )}
            {notice && (
              <p role="status" className="rounded-lg bg-accent p-3 text-sm text-primary">
                {notice}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  className="font-semibold text-primary"
                  onClick={() => {
                    setMode("signup");
                    setNotice(null);
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="font-semibold text-primary"
                  onClick={() => {
                    setMode("signin");
                    setNotice(null);
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link to="/">Continue without signing in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
