"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import axios, { get } from "axios";
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChild, 
  FaBus, 
  FaArrowLeft,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
// import { setBookingDetails } from "@/app/store/bookingSlice";
// import { getTrip } from "@/lib/apis/api";
import { setBookingData } from "../../../../app/store/slice/checkoutSlice";

export default function Page() {
  const today = new Date().toISOString().split('T')[0];
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
  // const booking = useSelector((s) => s.bookings);

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

    // let mounted = true;
    // (async () => {
    //   try {
    //     setLoading(true);
    //     const data = await getTrip(id);
    //     console.log(data);
    //     if (!mounted) return;
    //     setTrip(data);
    //   } catch (e) {
    //     if (!mounted) return;
    //     setErr(e?.message || "Failed to load trip");
    //   } finally {
    //     if (mounted) setLoading(false);
    //   }
    // })();

    // return () => {
    //   mounted = false;
    // };
  }, [id, tripsInStore]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { adult: 1, child: 0, date: "", transfer: false },
  });

  const adult = Number(watch("adult") || 0);
  const child = Number(watch("child") || 0);
  const transfer = watch("transfer");

  const totalEgp = useMemo(() => {
    if (!trip) return 0;
    const baseTotal = (
      Number(egpPriceAdult.toFixed() || 0) * adult +
      Number(egpPriceChild.toFixed() || 0) * child
    );
    // No transfer fee added to total
    return baseTotal;
  }, [trip, adult, child, currancy]);

  const totalEuro = useMemo(() => {
    if (!trip) return 0;
    const baseTotal = (
      Number(trip?.prices?.adult?.euro || 0) * adult +
      Number(trip?.prices?.child?.euro || 0) * child
    );
    // No transfer fee added to total
    return baseTotal;
  }, [trip, adult, child, currancy]);

  const onSubmit = (data) => {
    if (!trip) return;
    // dispatch(
    //   setBookingDetails({
    //     adult: Number(data.adult),
    //     child: Number(data.child),
    //     transfer: !!data.transfer,
    //     payment: !!data.payment,
    //     bookingDate: data.date, // normalized
    //     totalPrice: { egp: totalEgp, euro: totalEuro },
    //     tripId: trip._id,
    //     trip, // keep trip for checkout summary
    //   })
    // );
    dispatch(setBookingData({
      adult: Number(data.adult),
      child: Number(data.child),
      transfer: !!data.transfer,
      payment: !!data.payment,
      bookingDate: data.date, // normalized
      totalPrice: { egp: totalEgp, euro: totalEuro },
      tripId: trip._id,
    }));
    router.push("/home/trip/checkOut");
  };

  // useEffect(() => {
  //   console.log("bookings updated:", booking);
  // }, [booking]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading trip details...</p>
      </div>
    </div>
  );
  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold">Error: {err}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <p className="text-gray-600 font-semibold">Trip not found.</p>
        <button 
          onClick={() => router.push('/trips')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Trips
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to trips</span>
        </button>

        {/* Brand Badge */}
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200">
          <Dot />
          <span className="text-sm font-medium text-gray-700">Originals by Abudabbab</span>
        </div>

        {/* Title with enhanced styling */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-orange-500 to-blue-800 bg-clip-text text-transparent mb-2">
            {trip.name ?? "Trip"}
          </h1>
          {trip.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <FaMapMarkerAlt className="text-orange-500" />
              <span className="text-sm">{trip.location}</span>
            </div>
          )}
        </div>

        {/* Enhanced Image Gallery with hover effects */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          <Img
            src={trip.images?.[0]}
            alt="Main trip image"
            className="md:col-span-3 h-72 md:h-[440px] group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Img>
          <Img
            src={trip.images?.[1]}
            alt="Trip highlight 1"
            className="md:col-span-6 h-72 md:h-[440px] group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Img>
          <div className="md:col-span-3 grid grid-rows-2 gap-3 sm:gap-4 h-72 md:h-[440px]">
            <Img src={trip.images?.[2]} alt="Trip highlight 2" className="row-span-1 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Img>
            <Img src={trip.images?.[3]} alt="Trip highlight 3" className="row-span-1 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Img>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: description + features */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <FaInfoCircle className="text-blue-600 text-xl" />
                <h2 className="text-2xl font-bold text-gray-900">Description</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                {trip.description}
              </p>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaCheckCircle className="text-orange-500 text-xl" />
                <h2 className="text-2xl font-bold text-gray-900">
                  About this activity
                </h2>
              </div>
              <div className="space-y-4">
                {(trip.features ?? []).map((f, i) => (
                  <div
                    key={f?.title ? `${f.title}-${i}` : i}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-orange-50 border border-orange-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">
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
          </div>

          {/* Right: Enhanced price card */}
          <aside className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-6">
              <div className="relative rounded-3xl p-[2px]  shadow-2xl shadow-blue-500/20">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#509ddb]  to-blue text-white px-5 sm:px-6 py-6 sm:py-7">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                        <FaCalendarAlt className="text-orange-400" />
                        <span className="text-sm font-semibold text-white tracking-wide uppercase">
                          Book Your Adventure
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit(onSubmit)}
                      >
                        {/* Adult Input - Enhanced */}
                        <div className="group">
                          <div className="flex items-center justify-between rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 px-4 py-4 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-orange-500/40 flex items-center justify-center">
                                <FaUsers className="text-white text-lg" />
                              </div>
                              <div className="flex flex-col">
                                <label
                                  htmlFor="adult"
                                  className="text-base font-bold text-white"
                                >
                                  Adults
                                </label>
                                <p className="text-xs text-blue-100">
                                  €{trip?.prices?.adult?.euro ?? 0} / {egpPriceAdult.toFixed() ?? 0} EGP
                                </p>
                              </div>
                            </div>
                            <input
                              {...register("adult", {
                                required: "At least 1 adult required",
                                min: {
                                  value: 1,
                                  message: "Minimum value is 1",
                                },
                                max: {
                                  value: 20,
                                  message: "Maximum 20 adults",
                                },
                              })}
                              type="number"
                              id="adult"
                              defaultValue={1}
                              className="w-20 h-12 rounded-xl bg-black/30 text-white text-center text-lg font-bold border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition"
                            />
                          </div>
                          {errors?.adult && (
                            <p className="mt-1.5 ml-1 text-orange-300 text-xs font-medium flex items-center gap-1">
                              <span>⚠</span> {errors?.adult?.message}
                            </p>
                          )}
                        </div>

                        {/* Child Input - Enhanced */}
                        <div className="group">
                          <div className="flex items-center justify-between rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 px-4 py-4 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-orange-500/40 flex items-center justify-center">
                                <FaChild className="text-white text-lg" />
                              </div>
                              <div className="flex flex-col">
                                <label
                                  htmlFor="child"
                                  className="text-base font-bold text-white"
                                >
                                  Children
                                </label>
                                <p className="text-xs text-blue-100">
                                  €{trip?.prices?.child?.euro ?? 0} / {egpPriceChild.toFixed() ?? 0} EGP
                                </p>
                              </div>
                            </div>
                            <input
                              {...register("child", { 
                                required: false, 
                                min: {
                                  value: 0,
                                  message: "Cannot be negative"
                                },
                                max: {
                                  value: 20,
                                  message: "Maximum 20 children"
                                }
                              })}
                              type="number"
                              id="child"
                              defaultValue={0}
                              className="w-20 h-12 rounded-xl bg-black/30 text-white text-center text-lg font-bold border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition"
                            />
                          </div>
                          {errors?.child && (
                            <p className="mt-1.5 ml-1 text-orange-300 text-xs font-medium flex items-center gap-1">
                              <span>⚠</span> {errors?.child?.message}
                            </p>
                          )}
                        </div>

                        {/* Date Input - Enhanced */}
                        <div className="group">
                          <div className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 px-4 py-4 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-orange-500/40 flex items-center justify-center">
                                <FaCalendarAlt className="text-white" />
                              </div>
                              <label
                                htmlFor="date"
                                className="text-base font-bold text-white"
                              >
                                Select Date
                              </label>
                            </div>
                            <input
                              {...register("date", { required: "Date is required" })}
                              type="date"
                              id="date"
                              min={today}
                              className="w-full h-12 px-4 rounded-xl bg-black/30 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 [color-scheme:dark] transition"
                            />
                            {errors?.date && (
                              <p className="mt-1.5 text-orange-300 text-xs font-medium flex items-center gap-1">
                                <span>⚠</span> {errors?.date?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Transfer Checkbox - Enhanced */}
                        <label
                          htmlFor="transfer"
                          className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/15 transition-all cursor-pointer group"
                        >
                          <input
                            {...register("transfer")}
                            type="checkbox"
                            id="transfer"
                            className="w-5 h-5 accent-orange-500 rounded border-2 border-white/40 bg-black/40 cursor-pointer"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <FaBus className="text-orange-400 text-lg" />
                            <div className="text-sm font-bold text-white">
                              Need Transfer?
                            </div>
                          </div>
                        </label>

                        {/* Price Summary - Simplified */}
                        <div className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 px-5 py-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-white">Total Price</span>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-400">€{totalEuro}</div>
                              <div className="text-sm text-blue-100">{totalEgp.toFixed()} EGP</div>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button - Enhanced */}
                        <button
                          type="submit"
                          className="relative group cursor-pointer h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange text-white font-bold text-lg tracking-wide shadow-md shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <FaCheckCircle />
                            Book Now
                          </span>
                          {/* <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"></div> */}
                        </button>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-white/80">
                            <FaCheckCircle className="text-orange-400" />
                            <span>Instant confirmation</span>
                          </div>
                          <div className="w-px h-4 bg-white/20"></div>
                          <div className="flex items-center gap-1.5 text-xs text-white/80">
                            <FaCheckCircle className="text-orange-400" />
                            <span>Free cancellation</span>
                          </div>
                        </div>
                      </form>
                    </div>
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
  <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-sm" />
);

const Img = ({ src, alt, className, children }) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${className}`}>
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-500"
    />
    {children}
  </div>
);
