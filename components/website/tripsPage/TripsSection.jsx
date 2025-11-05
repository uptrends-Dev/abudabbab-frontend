"use client";
import React, { useEffect, useMemo } from "react"; // UPDATED: useMemo
import { motion } from "framer-motion";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchTripsData } from "../../../lib/apis/tripsApi";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function TripsSection() {
  const dispatch = useDispatch();
  const { trips = [], loading, error } = useSelector((state) => state.trips); // UPDATED: default []

  useEffect(() => {
    // طلب البيانات من الـ API عند تحميل المكون
    dispatch(fetchTripsData());
  }, [dispatch]); // UPDATED: add dispatch to deps, remove console.log

  // UPDATED: only active trips
  const visibleTrips = useMemo(
    () =>
      Array.isArray(trips) ? trips.filter((t) => t?.isActive === true) : [],
    [trips]
  );

  // if (loading)
  //   return (

  //   );
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};
  return (
    <section id="trips" className="bg-main py-16 overflow-hidden ">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8 overflow-hidden">
        <motion.p
          className="text-[#007DB0] font-serif text-xl"
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

        <motion.p
          className="mx-auto mt-3 max-w-2xl text-sm text-blue"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </motion.p>
     {/* حالة التحميل */}
        {loading && (
          <motion.div
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 max-w-7xl m-auto"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {Array.from({ length: 3 }).map(
              (_, idx) => (
                <motion.div key={idx} variants={item}>
                  <SkeletonTripCard />
                </motion.div>
              )
            )}
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
              <div
                key={t?._id}
                className="
                  group relative max-w-sm rounded-[12px] overflow-hidden bg-white shadow-lg ring-1 ring-slate-200/70
                  transition-all duration-500 motion-reduce:transition-none
                  hover:-translate-y-1 hover:shadow-2xl hover:ring-slate-300
                  will-change-transform
                  before:content-[''] before:absolute before:inset-0 before:-z-10 before:rounded-[14px]
                  before:bg-gradient-to-br before:from-orange-400/0 before:via-orange-400/15 before:to-fuchsia-500/0
                  before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500 w-3/3
                "
              >
                <div className="relative w-full flex justify-center items-center">
                  <Image
                    src={t?.images?.[0] ?? "/placeholder.jpg"} // UPDATED: safe access + fallback
                    alt={t?.name ?? "Trip image"} // UPDATED
                    className="
                      w-[90%] h-64 object-cover m-3 rounded-xl shadow-2xl shadow-black/20
                      transition-transform duration-700 ease-out motion-reduce:transition-none
                      group-hover:scale-[1.04] group-hover:rotate-[.75deg]
                      will-change-transform
                    "
                    width={400}
                    height={256}
                    priority
                  />
                  <div
                    className="
                      absolute m-3 left-3 top-2 flex items-center gap-2
                      transition-all duration-500 motion-reduce:transition-none
                      group-hover:-translate-y-0.5 group-hover:drop-shadow
                    "
                  >
                    <span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-800 ring-1 ring-slate-200 backdrop-blur">
                      {t?.tripTime?.from ?? "--"} – {t?.tripTime?.to ?? "--"}{" "}
                      {/* UPDATED */}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h2 className="text-[17px] font-semibold text-gray-800 text-left transition-colors duration-300">
                    {t?.name ?? "Untitled Trip"} {/* UPDATED */}
                  </h2>

                  <div className="flex items-center mt-2 text-gray-600 ">
                    {/* <span className="text-yellow-500 text-xs">★★★★★</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (650+ Ratings)
                    </span> */}
                    {t.description?.split(' ').slice(0, 5).join(' ')}
                    {t.description?.split(' ').length > 5 && '...'}
                  </div>

                  <div className="flex justify-end items-center mt-4 gap-2">
                    <span
                      className="
                        text-xl font-semibold text-gray-800 transition-all duration-300
                        group-hover:-translate-y-0.5 group-hover:text-gray-900 
                      "
                    >
                      €{t?.prices?.adult?.euro ?? "--"}{" "}
                      {/* UPDATED: safe access + € */}
                    </span>
                    <Link href={`/home/trip/${t?._id ?? ""}`}>
                      {" "}
                      {/* UPDATED: safe href */}
                      <button
                        className="
                          relative bg-orange-500 text-white py-2 px-4 rounded-[10px]
                          transition-all duration-300 ease-out motion-reduce:transition-none
                          hover:bg-orange-600 active:scale-95 focus-visible:outline-none
                          focus-visible:ring-2 focus-visible:ring-orange-400/70
                          shadow-md hover:shadow-lg
                          overflow-hidden
                          after:content-[''] after:absolute after:inset-0
                          after:translate-x-[-120%] group-hover:after:translate-x-[120%]
                          after:bg-white/25 after:transition-transform after:duration-700 cursor-pointer
                        "
                      >
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
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
