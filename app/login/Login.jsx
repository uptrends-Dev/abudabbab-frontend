"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/apis/authApi";
import { z } from "zod";

const SignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login({ imageSrc = "/p1.jpg" }) {
  const router = useRouter();

  // controlled inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pressed, setPressed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const next = "/dashboard";

  async function Submit(email, password) {
    setLoading(true);
    setError(null);

    const parsed = SignInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setError(`${errs.email?.[0] ?? ""} ${errs.password?.[0] ?? ""}`.trim());
      setLoading(false);
      return;
    }

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

  // no FormData here — just use the controlled state
  function handleSubmit(e) {
    e.preventDefault();
    Submit(email, password);
  }

  const revealDown = (e) => {
    e?.preventDefault();
    setPressed(true);
    setShowPassword(true);
  };
  const revealUp = () => {
    setPressed(false);
    setShowPassword(false);
  };

  return (
    <section className="min-h-screen   w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-6xl bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Decorative lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]"
        >
          <svg className="absolute right-[-20%] top-[-20%] opacity-20" width="700" height="700" viewBox="0 0 700 700">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="700" height="700" fill="url(#grid)" className="text-slate-300 dark:text-slate-700" />
          </svg>
        </div>

        {/* Left image panel */}
        <div className="relative hidden lg:block">
          <Image src={imageSrc} alt="Contactless payment" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-slate-900/20" />
          <div className="absolute left-8 bottom-8 text-white">
            <h3 className="text-2xl font-semibold tracking-wide">AbuDabbab</h3>
            <p className="text-sm text-gray-200/90 max-w-xs mt-2">Giving You All Control To Your System.</p>
            <div className="mt-4 h-1 w-24 bg-cyan-400 rounded-full" />
          </div>
        </div>

        {/* Right auth card */}
        <div className="relative flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-[200px]">
                <img src="/logo.png" alt="logo" />
              </span>
            </div>

            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Sign in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Access the AbuDabbab panel using your user email and password.
            </p>

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Login</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="Enter your email or username"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>

                {/* hold-to-show password helper */}
                {/* <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
                  <button
                    type="button"
                    className={`${pressed ? "bg-gray-200 dark:bg-slate-800 scale-95" : ""} inline-flex items-center gap-2 rounded-md border p-2 transition-all`}
                    aria-label="Hold to show password"
                    onMouseDown={revealDown}
                    onMouseUp={revealUp}
                    onMouseLeave={revealUp}
                    onTouchStart={revealDown}
                    onTouchEnd={revealUp}
                    onTouchCancel={revealUp}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") revealDown(e);
                    }}
                    onKeyUp={(e) => {
                      if (e.key === " " || e.key === "Enter") revealUp();
                    }}
                  >
                    
                  </button>
                  <span>show password</span>
                </div> */}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-2.5 shadow-sm transition"
              >
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>

              <p className="mt-6 text-center text-[10px] text-slate-400" />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
