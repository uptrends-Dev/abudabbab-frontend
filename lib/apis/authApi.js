"use server";

import { LOGIN, WHOISME } from "@/paths";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("access_token")?.value;
  // delete browser cookie for this origin 
  await cookies().delete({
    name: "access_token",
    path: "/", // MUST match how you set it
    secure: true, // if you set it with Secure
    sameSite: "none", // if you set it with SameSite=None
  });

  // optional: tell backend to revoke the session (no need to forward cookies)
  try {
    await fetch("https://abudabbab-backend.vercel.app/api/admin/auth/logout", {
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
      throw new Error(message);
    } catch (err) {
      throw new Error(err?.message || message);
    }
  }

  // read token
  let access_token;
  let role;
  try {
    const body = await res.json();
    access_token = body?.access_token;
    role = body?.user?.role;
  } catch {
    // if backend returns empty body
    throw new Error(message);
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


  const redirectTo = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "/"
      case "FINANCE":
        return "/advanced-infos"
      case "ADMIN":
        return "/"
      case "EMPLOYEE":
        return "/bookings"
      case "GATE":
        return "/gate";
      default:
        return [];
    }
  }

  

  return { succeeded: true, redirectTo: redirectTo(role), role };
}
