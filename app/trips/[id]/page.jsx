"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { setBookingDetails } from "@/app/store/bookingSlice";



export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [currancy, setCurrancy] = useState("");
  useEffect(() => {
    async function fetchCurrancyEx() {
      const response = await axios.get(
        "https://v6.exchangerate-api.com/v6/ffce6030ce59439ae5a1d77c/pair/EUR/EGP"
      );
      setCurrancy(response.data.conversion_rate);
    }
    fetchCurrancyEx();
  }, []);
  // console.log(currancy);
  const tripsInStore = useSelector((s) => s.trips.trips);
  const booking = useSelector((s) => s.bookings);

  const [trip, setTrip] = useState(
    () => tripsInStore.find((t) => String(t._id) === String(id)) || null
  );
  const [loading, setLoading] = useState(!trip);
  const [err, setErr] = useState(null);
  const egpPriceAdult = trip?.prices?.adult?.euro * currancy
  const egpPriceChild = trip?.prices?.child?.euro * currancy
  // fallback fetch by id on reload

  useEffect(() => {
    const fromStore = tripsInStore.find((t) => String(t._id) === String(id));
    if (fromStore) {
      setTrip(fromStore);
      setLoading(false);
      return;
    }


    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const BASE =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://abudabbab-backend.vercel.app/api";
        const res = await axios.get(`${BASE}/trips/${id}`);
        if (!mounted) return;
        setTrip(res.data.data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load trip");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, tripsInStore]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { adult: 1, child: 0, date: "" },
  });

  const adult = Number(watch("adult") || 0);
  const child = Number(watch("child") || 0);

  const totalEgp = useMemo(() => {
    if (!trip) return 0;
    return (
      Number(egpPriceAdult.toFixed() || 0) * adult +
      Number(egpPriceChild.toFixed() || 0) * child
    );
  }, [trip, adult, child, currancy]);

  const totalEuro = useMemo(() => {
    if (!trip) return 0;
    return (
      Number(trip?.prices?.adult?.euro || 0) * adult +
      Number(trip?.prices?.child?.euro || 0) * child
    );
  }, [trip, adult, child, currancy]);

  const onSubmit = (data) => {
    if (!trip) return;
    dispatch(
      setBookingDetails({
        adult: Number(data.adult),
        child: Number(data.child),
        transfer: !!data.transfer,
        payment: !!data.payment,
        bookingDate: data.date, // normalized
        totalPrice: { egp: totalEgp, euro: totalEuro },
        tripId: trip._id,
        trip, // keep trip for checkout summary
      })
    );
    router.push("/trips/checkOut");
  };

  useEffect(() => {
    console.log("bookings updated:", booking);
  }, [booking]);

  if (loading) return <div className="p-6 loader"></div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!trip) return <div className="p-6">Trip not found.</div>;

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand crumb */}
        <div className="mb-3 text-sm text-gray-700">
          <Dot />
          <span className="align-middle">Originals by Abudabbab</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">
          {trip.name ?? "Trip"}
        </h1>

        {/* Image collage */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <Img
            src={trip.images?.[0]}
            alt="img 1"
            className="md:col-span-3 h-72 md:h-[420px]"
          />
          <Img
            src={trip.images?.[1]}
            alt="img 2"
            className="md:col-span-6 h-72 md:h-[420px]"
          />
          <div className="md:col-span-3 grid grid-rows-2 gap-4 h-72 md:h-[420px]">
            <Img src={trip.images?.[2]} alt="img 3" className="row-span-1" />
            <Img src={trip.images?.[3]} alt="img 4" className="row-span-1" />
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: description + features */}
          <div className="md:col-span-7 lg:col-span-8">
            <h2 className="text-2xl font-semibold">Description</h2>
            <p className="max-w-3xl text-gray-800 leading-relaxed">
              {trip.description}
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">
              About this activity
            </h2>
            <div className="mt-4">
              {(trip.features ?? []).map((f, i) => (
                <div
                  key={f?.title ? `${f.title}-${i}` : i}
                  className="flex gap-4 py-4 border-b last:border-none"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {f?.title}
                    </div>
                    {f?.subtitle && (
                      <div className="text-gray-600 mt-1 text-sm leading-relaxed">
                        {f.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: price card */}
          <aside className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-6">
              <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-blue-300/70 via-yellow-500/30 to-blue-300/70 shadow-[0_12px_40px_-10px_rgba(234,179,8,0.45)]">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#19377c] to-[#165bd3] text-zinc-100 px-6 py-6">
                  <div className="mb-4 text-blue-200 font-semibold tracking-wide uppercase">
                    Enjoy Your Trip
                  </div>

                  <div className="mt-6">
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      {/* Adult */}
                      <div className="flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur ring-1 ring-blue-300/30 px-4 py-3">
                        <div className="flex flex-col">
                          <label
                            htmlFor="adult"
                            className="text-[18px] font-semibold text-blue-300"
                          >
                            Adult
                          </label>
                          <p className="text-zinc-300">
                            Price : {trip?.prices?.adult?.euro ?? 0} € - (
                            {egpPriceAdult.toFixed() ?? 0} EGP)
                          </p>
                        </div>
                        <input
                          {...register("adult", {
                            required: true,
                            min: {
                              value: 1,
                              message: "Minimum value is 1",
                            },
                          })}
                          type="number"
                          id="adult"
                          defaultValue={1}
                          //  min={1}
                          className="w-[68px] h-[44px] rounded-2xl bg-black/30 text-white text-center border border-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                      </div>
                      {errors?.adult && <p className="text-red-500 text-xs">{errors?.adult?.message}</p>}

                      {/* Child */}
                      <div className="flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur ring-1 ring-blue-300/30 px-4 py-3">
                        <div className="flex flex-col">
                          <label
                            htmlFor="child"
                            className="text-[18px] font-semibold text-blue-300"
                          >
                            Child
                          </label>
                          <p className="text-zinc-300">
                            Price : {trip?.prices?.child?.euro ?? 0} € - (
                            {egpPriceChild.toFixed() ?? 0} EGP)
                          </p>
                        </div>
                        <input
                          {...register("child", { required: true, min: 0 })}
                          type="number"
                          id="child"
                          defaultValue={0}
                          className="w-[68px] h-[44px] rounded-2xl bg-black/30 text-white text-center border border-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Date */}
                      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 backdrop-blur ring-1 ring-blue-300/30 px-4 py-3">
                        <div className="flex flex-col">
                          <label
                            htmlFor="date"
                            className="text-[18px] font-semibold text-blue-300"
                          >
                            Date
                          </label>
                        </div>
                        <input
                          {...register("date", { required: true })}
                          type="date"
                          id="date"
                          className="w-full h-[44px] px-3 rounded-2xl bg-black/30 text-white border border-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-400 [color-scheme:dark]"
                        />
                      </div>

                      {/* Transfer */}
                      <div className="flex items-center gap-3 px-2 py-1 rounded-3xl">
                        <input
                          {...register("transfer")}
                          type="checkbox"
                          id="transfer"
                          className="w-5 h-5 accent-blue-400 rounded-sm border border-blue-300/40 bg-black/40"
                        />
                        <label
                          htmlFor="transfer"
                          className="text-[15px] font-bold text-white"
                        >
                          Required transfer
                        </label>
                      </div>
                      {/* payment */}
                      <div className="flex items-center gap-3 px-2 py-1 rounded-3xl">
                        <input
                          {...register("payment")}
                          type="checkbox"
                          id="payment"
                          className="w-5 h-5 accent-blue-400 rounded-sm border border-blue-300/40 bg-black/40"
                        />
                        <label
                          htmlFor="payment"
                          className="text-[15px] font-bold text-white"
                        >
                          Payment Completed
                        </label>
                      </div>
                      {/* check in */}
                      <div className="flex items-center gap-3 px-2 py-1 rounded-3xl">
                        <input
                          {...register("checkIn")}
                          type="checkbox"
                          id="checkIn"
                          className="w-5 h-5 accent-blue-400 rounded-sm border border-blue-300/40 bg-black/40"
                        />
                        <label
                          htmlFor="payment"
                          className="text-[15px] font-bold text-white"
                        >
                          Check In
                        </label>
                      </div>

                      {/* Totals */}
                      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 backdrop-blur ring-1 ring-blue-300/30 px-4 py-3">
                        Total: {totalEuro} € / {totalEgp} EGP
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer h-12 rounded-3xl bg-gradient-to-r from-blue-400 via-blue-600 to-blue-300 text-black font-semibold tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-[1px] transition"
                      >
                        Book Now
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

//  ---------------- helper components
const Dot = () => (
  <span className="inline-block h-2 w-2 rounded-full bg-red-500 align-middle mr-2" />
);

const Img = ({ src, alt, className, children }) => (
  <div className={`relative overflow-hidden rounded-xl ${className}`}>
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover object-center"
    />
    {children}
  </div>
);
