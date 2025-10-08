"use server";

import { LOGIN } from "@/paths";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  // delete browser cookie for this origin (localhost:3000)
  await cookies().delete({
    name: "access_token",
    path: "/", // MUST match how you set it
    secure: true, // if you set it with Secure
    sameSite: "none", // if you set it with SameSite=None
  });

  // optional: tell backend to revoke the session (no need to forward cookies)
  try {
    await fetch("https://abudabbba-backend.vercel.app/api/admin/auth/logout", {
      method: "POST",
      // you can send Authorization header if you want, but not required for revoke

      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch (e) {
    console.log("revoke failed (ignored):", e);
  }

  // send the user away
  // redirect("/dashboard");
}

export async function login({ email, password }) {
  // basic input guard
  if (!email?.trim() || !password) {
    throw new Error("Email and password are required.");
  }

  // call your backend
  const res = await fetch(
    LOGIN,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ email, password }),
    }
  );

  // normalize backend errors WITHOUT double-parsing
  if (!res.ok) {
    let message = "Login failed";
    try {
      const body = await res.json();
      message = body?.error?.message ?? body?.message ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // read token
  let access_token;
  try {
    const body = await res.json();
    access_token = body?.access_token;
  } catch {
    // if backend returns empty body
  }
  if (!access_token) throw new Error("No access token returned");

  // set cookie server-side (HttpOnly)
  const isProd = process.env.NODE_ENV === "production";
  await cookies().set({
    name: "access_token",
    value: access_token,
    httpOnly: true,
    secure: isProd, // must be true with SameSite=None on HTTPS
    sameSite: isProd ? "none" : "lax", // 'none' for prod HTTPS, 'lax' for localhost dev
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // redirect if requested, otherwise let caller handle navigation
  // if (redirectTo) {
  //   redirect(redirectTo);
  // }

  return { succeeded: true };
}
