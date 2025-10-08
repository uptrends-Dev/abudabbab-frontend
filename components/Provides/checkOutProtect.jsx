"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
// import CheckoutSection from "./CheckoutSection";

export default function CheckOutProtect({ children, fallback = null }) {
  const router = useRouter();
  const { tripId, trip } = useSelector((state) => state.bookings);
  const allowed = Boolean(tripId || trip?._id);

  useEffect(() => {
    if (!allowed) {
      router.replace("/trips");
    }
  }, [allowed, router]);

  if (!allowed) return fallback; // أو null
  return children;
}
