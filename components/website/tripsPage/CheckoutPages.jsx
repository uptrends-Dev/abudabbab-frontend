"use client";
import React, { useEffect, useMemo } from "react";
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
import { setUserInfo, setTripId } from "@/app/store/bookingSlice";
import { postBooking, clearBookingState } from "@/lib/apis/bookingsApi";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";

export default function CheckoutSection() {
  const bookingState = useSelector((state) => state.bookings);
  const trips = useSelector((s) => s.trips.trips);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("bookingsCheckOut updated:", { ...bookingState });
  }, [bookingState]);
  // Use trip data from booking state if available, otherwise find from trips array
  const selectedTrip = useMemo(() => {
    if (bookingState.trip) {
      return bookingState.trip;
    }
    return trips.find((tt) => String(tt._id) === String(bookingState.tripId));
  }, [bookingState.trip, bookingState.tripId, trips]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // useEffect(() => {
  //   return()=>{
  //      dispatch( clearBookingState())
  //   }
  // }, [dispatch]);

  // ---- Submit: save user info, then post booking ----
  const onSubmit = async (data) => {
    dispatch(
      setUserInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: data.message || "",
      })
    );

    if (!bookingState.tripId && selectedTrip?._id) {
      dispatch(setTripId(selectedTrip._id));
    }

    try {
      const created = await dispatch(
        postBooking({
          url: "https://abudabbba-backend.vercel.app/api/bookings",
        })
      ).unwrap();

      // created دلوقتي عمره ما هيكون undefined حتى لو شكل الرد مختلف
      const id = created?._id || created?.id || created?.data?._id;
      alert(
        id
          ? `Booking created ✅ ID: ${id}`
          : `Booking created ✅\n${JSON.stringify(created)}`
      );
      reset();
    } catch (e) {
      alert(
        `Failed to create booking:\n${typeof e === "string" ? e : JSON.stringify(e)
        }`
      );
    }
  };

  // ----- بيانات من الـ state -----
  const when = bookingState?.bookingDetails?.bookingDate || "Not selected";
  const transferTxt = bookingState?.bookingDetails?.transfer
    ? "required"
    : "not required";
  const adults = Number(bookingState?.bookingDetails?.adult ?? 0);
  const children = Number(bookingState?.bookingDetails?.child ?? 0);

  // Use prices from the trip data
  const adultPriceEuro = selectedTrip?.prices?.adult?.euro ?? 0;
  const childPriceEuro = selectedTrip?.prices?.child?.euro ?? 0;
  const transferFee = bookingState?.bookingDetails?.transfer ? 25 : 0;
  console.log(bookingState);
  // Use total price from booking details if available, otherwise calculate
  const total =
    bookingState?.bookingDetails?.totalPrice?.euro ??
    adultPriceEuro * adults + childPriceEuro * children + transferFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top banners */}
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
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-800"
                ></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">
                      <FiUser />
                    </span>
                  </span>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="first name"
                    className=" w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: { value: 2, message: "Too short" },
                    })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-800"
                ></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">
                      <FiUser />
                    </span>
                  </span>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="last name"
                    className=" w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: { value: 2, message: "Too short" },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-800"
              ></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">
                    <FiMail />
                  </span>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="email"
                  className=" w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Enter a valid email",
                    },
                  })}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-800"
              ></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">
                    <FiPhone />
                  </span>
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="phone"
                  className=" w-full rounded-lg border bg-white p-3 pl-10 outline-none transition"
                  {...register("phone", { required: "Phone is required" })}
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-sm font-medium text-gray-800"
              ></label>
              <div className="relative">
                <span className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <FiMessageSquare />
                </span>
                <textarea
                  id="message"
                  placeholder="message"
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  {...register("message")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className=" cursor-pointer w-full sm:w-auto rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              Check Out
            </button>
          </form>
        </section>

        {/* RIGHT: Order summary */}
        <aside className="lg:col-span-1 order-1 lg:order-2">
          <div className="lg:sticky lg:top-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              {/* trip info */}
              <div className="mb-4">
                <h2 className="text-2xl font-semibold tracking-tight text-blue-700">
                  Booking Summary
                </h2>
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

              {/* booking info */}
              <dl className="mt-4 space-y-3 text-sm">
                <Row icon={<FiCalendar />} label="When">
                  {when}
                </Row>
                <Row icon={<FiCalendar />} label="Transfer">
                  {transferTxt}
                </Row>
                <Row icon={<FiUsers />} label="Participants">
                  {adults} Adult{adults === 1 ? "" : "s"}
                  {children > 0
                    ? ` | ${children} Child${children === 1 ? "" : "ren"}`
                    : ""}
                </Row>
              </dl>

              {/* total */}
              <div className="mt-4 border-t pt-4 flex items-end justify-between">
                <div>
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-xs text-gray-600">
                    All taxes and fees included
                  </p>
                </div>
                <p className="text-2xl font-bold tracking-tight">{total}€</p>
              </div>
            </div>
            <Link href={"/trips"}>
              <button className="flex justify-center items-center cursor-pointer w-full sm:w-auto rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
                <div>Return To Trips</div> <IoIosArrowForward />
              </button>
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}

// --------------------  helpers components 
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
