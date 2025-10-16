"use client";

import React, { useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CheckOut from "@/components/website/tripsPage/CheckoutPages";

export default function Page() {
  const router = useRouter();
  const bookingState = useSelector((state) => state.checkout);

  // Block paint + redirect if invalid
  useLayoutEffect(() => {
    if (bookingState && !bookingState.bookingDetails) {
      router.replace("/trips");
    }
  }, [bookingState, router]);

  // While deciding / redirecting, render nothing to avoid flicker
  if (!bookingState || !bookingState.bookingDetails) return null;

  return <CheckOut />;
}