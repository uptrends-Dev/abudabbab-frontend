"use client";
import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { getallTrips } from "../../../lib/apis/api";
import { setTrips as setTripsStore } from "../../../app/store/slice/tripsSlices";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function TripsSection() {
  const dispatch = useDispatch();
  const [trips, setTripsState] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
  const response = await getallTrips();
  // console.log("Fetched trips:", response);
  setTripsState(response);
  // persist in Redux for downstream usage (e.g., checkout)
  dispatch(setTripsStore(response));
        setLoading(false);
      } catch (error) {
        // console.error("Error fetching trips:", error);
        setError(error);
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, []);

  const visibleTrips = useMemo(
    () =>
      Array.isArray(trips) ? trips.filter((t) => t?.isActive === true) : [],
    [trips]
  );

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section id="trips" className="bg-main py-16 overflow-hidden ">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8 overflow-hidden">
        <motion.p
          className="text-[#007DB0]  text-xl"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          Best Place For You
        </motion.p>

        <motion.h2
          className="mt-2 text-4xl font-bold text-blue"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-orange">Find Your Trip</span>
        </motion.h2>

        {/* <motion.p
          className="mx-auto mt-3 max-w-2xl text-sm text-blue"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </motion.p> */}
        {/* حالة التحميل */}
        {loading && (
          <motion.div
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 max-w-7xl m-auto"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {Array.from({ length: 3 }).map((_, idx) => (
              <motion.div key={idx} variants={item}>
                <SkeletonTripCard />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* UPDATED: empty state when no active trips */}
        {!loading && (
          <motion.div
            className="
              mt-10 grid grid-cols-1 gap-6
              sm:grid-cols-2 lg:grid-cols-3
              overflow-x-auto lg:overflow-visible
              snap-x snap-mandatory lg:snap-none pb-2 justify-items-center 
            "
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* UPDATED: map over visibleTrips only */}
            {visibleTrips.map((t) => (
              <motion.div
                key={t?._id}
                variants={item}
                className="
                  group relative max-w-sm rounded-2xl overflow-hidden bg-white shadow-xl 
                  ring-1 ring-slate-200/80
                  transition-all duration-500 motion-reduce:transition-none
                  hover:-translate-y-2 hover:shadow-2xl hover:ring-orange-200
                  will-change-transform
                  before:content-[''] before:absolute before:inset-0 before:-z-10 before:rounded-2xl
                  before:bg-gradient-to-br before:from-orange-400/5 before:via-blue-400/10 before:to-orange-500/5
                  before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500
                "
              >
                <div className="relative w-full overflow-hidden">
                  <Image
                    src={t?.images?.[0] ?? "/placeholder.jpg"}
                    alt={t?.name ?? "Trip image"}
                    className="
                      w-full h-56 object-cover
                      transition-all duration-700 ease-out motion-reduce:transition-none
                      group-hover:scale-110 group-hover:brightness-95
                      will-change-transform
                    "
                    width={400}
                    height={224}
                    priority
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Date Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 transition-all duration-500 group-hover:scale-105">
                    <span className="rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-gray-800 shadow-lg ring-1 ring-white/20">
                      {t?.tripTime?.from ?? "--"} – {t?.tripTime?.to ?? "--"}
                    </span>
                  </div>

                  {/* Price Tag on Image */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                    {/* <span className="text-xs font-medium">From</span> */}
                    <span className="text-lg font-bold">€{t?.prices?.adult?.euro ?? "--"}</span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">
                    {t?.name ?? "Untitled Trip"}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {t.description || "Explore amazing destinations with us!"}
                  </p>

                  {/* Info Row */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      <span className="font-medium">Adventure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Online Booking</span>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Link href={`/home/trip/${t?._id ?? ""}`} className="block">
                    <button
                      className="
                        w-full relative bg-gradient-to-r from-orange-500 to-orange-600 
                        text-white py-3 px-6 rounded-xl font-semibold
                        transition-all duration-300 ease-out motion-reduce:transition-none
                        hover:from-orange-600 hover:to-orange-700 hover:shadow-lg
                        active:scale-[0.98] focus-visible:outline-none
                        focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2
                        overflow-hidden group/btn
                        shadow-md hover:shadow-orange-500/50
                      "
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Book Your Adventure
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
/* ---------------- Skeleton Card ---------------- */
function SkeletonTripCard() {
  return (
    <div
      className="
        relative max-w-sm rounded-[12px] overflow-hidden bg-white shadow-lg ring-1 ring-slate-200/70
        animate-pulse
      "
    >
      {/* image placeholder */}
      <div className="relative w-full flex justify-center items-center">
        <div
          className="
            w-[90%] h-64 m-3 rounded-xl bg-slate-200/80 overflow-hidden
            shadow-2xl shadow-black/10
          "
        >
          <div className="h-full w-full shimmer" />
        </div>

        {/* chip placeholder */}
        <div className="absolute m-3 left-3 top-2">
          <div className="h-6 w-28 rounded-lg bg-white/80 ring-1 ring-slate-200 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        </div>
      </div>

      {/* content placeholder */}
      <div className="p-3">
        <div className="h-4 w-2/3 rounded bg-slate-200 mb-3 overflow-hidden">
          <div className="h-full w-full shimmer" />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 w-16 rounded bg-slate-200 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
          <div className="h-3 w-24 rounded bg-slate-200 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        </div>

        <div className="flex justify-end items-center mt-4 gap-2">
          <div className="h-6 w-16 rounded bg-slate-200 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
          <div className="h-9 w-28 rounded-[10px] bg-orange-200/60 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
