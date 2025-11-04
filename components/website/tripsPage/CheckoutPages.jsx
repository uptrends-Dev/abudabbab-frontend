import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";
// import { setUserInfo, setTripId } from "@/app/store/bookingSlice";
// import { postBooking, clearBookingState } from "@/lib/apis/bookingsApi";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { BOOKING } from "@/paths";

import { useRouter } from "next/navigation";
import { checkOut } from "../../../lib/apis/api";
import { clearState, updateTotalPrice } from "@/app/store/slice/checkoutSlice";
import { applyCouponCode, validateCouponCode } from "../../../lib/apis/couponApi";

export default function CheckoutSection() {
  const router = useRouter();
  const dispatch = useDispatch();
  const bookingState = useSelector((state) => state.checkout);
  const Trip = useSelector((state) => state.trips);
  const selectedTrip = Trip.trips.find(t => t._id === bookingState.tripId) || null


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // Submit: save user info, then post booking
  const onSubmit = async (data) => {
    console.log("Form data:", data);

    const raw =
      bookingState?.bookingDate || bookingState?.date || "";
    const bookingDate = raw
      ? new Date(`${raw}T14:00:00.000Z`).toISOString()
      : undefined;

    try {
      const totalEuro = Number(bookingState?.totalPrice?.euro ?? baseTotal ?? 0)
      const totalEgp = Number(bookingState?.totalPrice?.egp ?? 0)
      const payload = {
        tripInfo: String(bookingState.tripId),
        adult: Math.max(1, Number(bookingState?.adult ?? 1)),
        child: Math.max(0, Number(bookingState?.child ?? 0)),
        subtotal: { egp: 0, euro: Number((baseTotal || 0).toFixed(2)) },
        ...(appliedCoupon ? { coupon: { code: appliedCoupon.code, discount: { egp: 0, euro: appliedCoupon.discountEuro } } } : {}),
        totalPrice: {
          egp: totalEgp,
          euro: Number(totalEuro.toFixed(2)),
        },
        transportation: Boolean(bookingState?.transfer),
        user: {
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          phone: data?.phone || "",
          message: data?.message || "",
        },
        payment: Boolean(bookingState?.payment ?? false),
        checkIn: Boolean(bookingState?.checkIn ?? false),
        ...(bookingDate ? { bookingDate } : {}),
      };
      console.log("Booking payload:", payload);
      const res = await checkOut(payload);
      console.log("Booking response:", res);
      alert("Booking created successfully!");
      reset();
      dispatch(clearState());
      router.push("/trips");
      router.refresh();
    } catch (error) {
      // alert("Failed to create booking:\n" + (typeof error === "string" ? error : JSON.stringify(error)));
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
    }


  };


  const when = bookingState?.bookingDate || "Not selected";
  const transferTxt = bookingState?.transfer ? "required" : "not required";
  const adults = Number(bookingState?.adult ?? 0);
  const children = Number(bookingState?.child ?? 0);

  const adultPriceEuro = selectedTrip?.prices?.adult?.euro ?? 0;
  const childPriceEuro = selectedTrip?.prices?.child?.euro ?? 0;
  const transferFee = bookingState?.bookingDetails?.transfer ? 25 : 0;

  const baseTotal = adultPriceEuro * adults + childPriceEuro * children + transferFee;

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const total = bookingState?.totalPrice?.euro ?? baseTotal;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    const ticketCount = adults + children;
    try {
      setIsApplying(true);
      const result = await applyCouponCode(couponCode.trim(), ticketCount);
      // result shape: { status: "success", data: { type, discount } } OR throw on fail
      const couponType = result?.coupon?.type;
      const discountObj = result?.coupon?.discount;
      console.log("Coupon applied:", couponType, discountObj);
      let discountEuro = 0;
      if (couponType === "amount") {
        discountEuro = Number(discountObj?.euro ?? 0);
      } else if (couponType === "percent") {
        const percent = Number(discountObj?.percent ?? 0);
        discountEuro = (baseTotal * percent) / 100;
      }

      const newTotal = Math.max(0, baseTotal - discountEuro);
      dispatch(updateTotalPrice({ egp: 0, euro: Number(newTotal.toFixed(2)) }));
      setAppliedCoupon({ code: couponCode.trim(), discountEuro: Number(discountEuro.toFixed(2)) });
    } catch (e) {
      setAppliedCoupon(null);
      setCouponError(e?.message || "Failed to apply coupon");
    } finally {
      setIsApplying(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <p className="text-[40px] p-1 rounded-3xl text-black text-center font-bold ">
          Check Out ..
        </p>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Form */}
        <section className="lg:col-span-2 order-2 lg:order-1">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Contact & message
            </h2>
            <p className="text-sm text-gray-600">
              Tell us how to reach you and leave a note for the organizer.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6"
          >
            {/* First & Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-800">First Name</label>
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    className="w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                    {...register("firstName", {
                      required: "First name is required",
                      pattern: {
                        value: /^[A-Za-z]+$/i,
                        message: "First name must only contain letters",
                      },
                      minLength: { value: 2, message: "Too short" },
                    })}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-800">Last Name</label>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    className="w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                    {...register("lastName", {
                      required: "Last name is required",
                      pattern: {
                        value: /^[A-Za-z]+$/i,
                        message: "Last name must only contain letters",
                      },
                      minLength: { value: 2, message: "Too short" },
                    })}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-800">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-800">Phone</label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  placeholder="Phone"
                  className="w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Phone number must be digits",
                    },
                  })}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-gray-800">Message</label>
              <div className="relative">
                <textarea
                  id="message"
                  placeholder="Message"
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  {...register("message", {
                    maxLength: { value: 500, message: "Message cannot exceed 500 characters" },
                    pattern: {
                      value: /^[A-Za-z0-9 .,'!?"()-]*$/i,
                      message: "Message contains invalid characters",
                    },
                  })}
                />
                {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full sm:w-auto rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              Check Out
            </button>
          </form>
        </section>

        {/* RIGHT: Order summary */}
        <aside className="lg:col-span-1 order-1 lg:order-2">
          <div className="lg:sticky lg:top-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold tracking-tight text-blue-700">Booking Summary</h2>
              </div>

              <div className="flex gap-3">
                <div className="h-15 w-28 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedTrip?.images?.[0] || "/img/p4.jpg"}
                    alt={selectedTrip?.name || "Trip image"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {selectedTrip?.name || "Selected trip"}
                  </h3>
                </div>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <Row icon={<FiCalendar />} label="When">{when}</Row>
                <Row icon={<FiCalendar />} label="Transfer">{transferTxt}</Row>
                <Row icon={<FiUsers />} label="Participants">
                  {adults} Adult{adults === 1 ? "" : "s"}
                  {children > 0
                    ? ` | ${children} Child${children === 1 ? "" : "ren"}`
                    : ""}
                </Row>
              </dl>

              <div className="mt-4">
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-800">Coupon Code</label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon"
                    className="flex-1 rounded-lg border bg-white p-2 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplying}
                    className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold disabled:opacity-60"
                  >
                    {isApplying ? "Applying..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1 text-xs text-red-600">{couponError}</p>
                )}
                {appliedCoupon && !couponError && (
                  <p className="mt-1 text-xs text-emerald-700">Applied {appliedCoupon.code}. Saved €{appliedCoupon.discountEuro}.</p>
                )}
              </div>

              <div className="mt-4 border-t pt-4 flex items-end justify-between">
                <div>
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-xs text-gray-600">All taxes and fees included</p>
                </div>
                <div className="text-right">
                  {appliedCoupon && bookingState?.totalPrice?.euro !== undefined ? (
                    <>
                      <p className="text-sm line-through text-gray-500">€{baseTotal.toFixed(2)}</p>
                      <p className="text-2xl font-bold tracking-tight">€{Number(total).toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold tracking-tight">€{Number(bookingState.originalPrice.euro).toFixed(2)}</p>
                  )}
                </div>
              </div>
            </div>
            <Link href={"/trips"}>
              <button
                onClick={() => dispatch(clearState())}
                className="flex justify-center items-center cursor-pointer w-full sm:w-auto rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
                <div>Return To Trips</div> <IoIosArrowForward />
              </button>
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-500 mt-0.5">{icon}</span>
      <div>
        <dt className="text-gray-700 font-medium">{label}</dt>
        <dd className="text-gray-600">{children}</dd>
      </div>
    </div>
  );
}