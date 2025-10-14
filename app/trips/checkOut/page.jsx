"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CheckOut from "@/components/website/tripsPage/CheckoutPages";

export default function Page() {
  // const router = useRouter();
  // const bookingState = useSelector((state) => state.checkout);

  // // optional: نتأكد إننا mounted عشان نتجنب أي فلاش أو تحذيرات
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);

  // useEffect(() => {
  //   if (mounted && !bookingState.bookingDetails) {
  //     router.replace("/trips");
  //   }
  // }, [mounted, bookingState.bookingDetails, router]);

  // // أثناء التحويل أو قبل الـ mount ما نعرضش حاجة
  // if (!mounted || !bookingState.bookingDetails) return null;

  return <CheckOut />;
}
