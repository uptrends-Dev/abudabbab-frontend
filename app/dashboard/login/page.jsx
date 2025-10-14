"use client"
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/apis/authApi";


const page = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const next = "/dashboard";

  async function Submit(email, password) {
    setLoading(true);
    setError(null);
    try {
      const { succeeded, redirectTo } = await login({ email, password });
      
      if (succeeded) {
        router.replace(`${next}${redirectTo}` || next);
        router.refresh();
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {

    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    };
    // UI-only: replace with your real POST if needed
    // console.log("login payload", payload);
    Submit(payload.email, payload.password);
  }

  return (
    <div className="min-h-svh grid place-items-center bg-[radial-gradient(50%_50%_at_50%_0%,hsl(var(--primary)/0.18)_0%,transparent_65%)] from-primary/20 to-background p-4">
      {/* CSS-only 3D feel using group-hover (no state) */}
      <div className="relative bg-white/80 rounded-2xl  w-full max-w-sm group perspective-[1200px]">
        <div className="pointer-events-none absolute -top-10 -left-8 h-24 w-24 rounded-full bg-primary/15 blur-xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-muted/60 blur-2xl" />

        <div className="">
          <Card className="w-full  border border-border/60 shadow-xl/20 backdrop-blur-md bg-card/70 hover:shadow-2xl rounded-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="rounded-xl bg-primary/10 p-2">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm">Welcome back</span>
              </div>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your email and password to continue.</CardDescription>
            </CardHeader>

            <CardContent>
              {error && <InlineAlert message={error} />}
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2" style={{ transform: "translateZ(12px)" }}>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                    <User className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid gap-2" style={{ transform: "translateZ(12px)" }}>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
                    <Lock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        onChange={(e) => {
                          const input = (e.currentTarget.form?.elements.namedItem("password"));
                          if (input) input.type = e.currentTarget.checked ? "text" : "password";
                        }}
                      />
                      Show password
                    </label>
                  </div>
                </div>

                <Button type="submit" className={`w-full bg-[#5d89e1] ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} >
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>) : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default page;


// ------------------helpers functions
function InlineAlert({ message }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
