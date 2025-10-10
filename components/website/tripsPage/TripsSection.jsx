"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchTripsData } from "@/lib/apis/tripsApi"; // استيراد الـ action
import { setTripId } from "@/app/store/bookingSlice";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 24 },
  },
};

export default function TripsSection() {
  const dispatch = useDispatch();
  const { trips, loading, error } = useSelector((state) => state.trips);

  const handleTripSelection = (tripId) => {
    // عندما يضغط المستخدم على الرحلة، نقوم بتخزين الـ tripId في Redux
    dispatch(setTripId(tripId));
  };
  useEffect(() => {
    // طلب البيانات من الـ API عند تحميل المكون
    dispatch(fetchTripsData("https://abudabbab-backend.vercel.app/api/trips"));
  }, [dispatch]);

  if (loading) return <div className="loader"></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section id="trips" className="bg-main py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8 overflow-hidden">
        <motion.p
          className="text-teal-900/80 font-serif text-xl"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          Best Place For You
        </motion.p>

        <motion.h2
          className="mt-2 text-4xl font-bold text-teal-900"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-orange-500">Our</span> Trips
        </motion.h2>

        <motion.p
          className="mx-auto mt-3 max-w-2xl text-sm text-slate-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </motion.p>

        {/* عرض الرحلات */}
        <motion.div
          className="
            mt-10 grid grid-cols-1 gap-6
            sm:grid-cols-2 lg:grid-cols-3
            overflow-x-auto lg:overflow-visible
            snap-x snap-mandatory lg:snap-none pb-2
          "
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {trips.map((t) => (
            <motion.article
              key={t._id}
              variants={item}
              className={
                t.isActive !== true
                  ? "hidden"
                  : [
                    "group relative snap-center lg:snap-none",
                    "rounded-2xl p-[1px]",
                    "bg-gradient-to-br from-orange-400/70 via-rose-300/60 to-teal-400/70",
                    "shadow-[0_8px_24px_rgba(2,6,23,0.06)]",
                    "transform-gpu will-change-transform"
                  ].join(" ")
              }
              initial={{ opacity: 0, y: 10, rotateX: -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{
                y: -6,
                rotateX: 1.2,
                rotateY: -1.2,
                // keep shadow change subtle to avoid jank
                boxShadow: "0 18px 40px rgba(2,6,23,0.10)"
              }}
              whileTap={{ scale: 0.988 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} // snappier entry
              aria-label={t.name}
            >
              <div className="rounded-2xl bg-white/80 backdrop-blur-md ring-1 ring-white/40 overflow-hidden">
                <div className="relative overflow-hidden rounded-t-2xl">
                  <motion.img
                    src={t.images[0]}
                    alt={t.name}
                    className="h-60 w-full object-cover transform-gpu"
                    initial={{ scale: 1.04 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: "easeOut" }}  // was 0.7
                    whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.6 } }}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

                  {/* shimmer sweep — faster */}
                  <div className="pointer-events-none absolute -inset-x-10 -top-1/2 h-[140%] skew-x-[-18deg] bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition duration-300 group-hover:opacity-100 group-hover:translate-x-6" />

                  {/* chips */}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-800 ring-1 ring-slate-200 backdrop-blur">
                      {t.tripTime.from} – {t.tripTime.to}
                    </span>
                  </div>
                  <div className="absolute right-3 bottom-3">
                    <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                      {t.prices.adult.euro}€ <span className="opacity-80 font-normal">/person</span>
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-[15px] font-semibold tracking-tight text-slate-800 line-clamp-2">
                    {t.name}
                  </h3>

                  <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4 opacity-70">
                        <path
                          fill="currentColor"
                          d="M12 22a9.95 9.95 0 1 1 0-19.9A9.95 9.95 0 0 1 12 22Zm0-1.8a8.15 8.15 0 1 0 0-16.3 8.15 8.15 0 0 0 0 16.3Zm.9-8.34 3.92 2.26-.9 1.56L11.1 13V6.6h1.8V11.86Z"
                        />
                      </svg>
                      <span className="tabular-nums">{t.tripTime.from}–{t.tripTime.to}</span>
                    </div>

                    <Link href={`/trips/${t._id}`}>
                      <motion.button
                        onClick={() => handleTripSelection(t._id)}
                        type="button"
                        className={[
                          "inline-flex items-center gap-2 rounded-full",
                          "bg-slate-900 px-4 py-2 text-xs font-medium text-white",
                          "shadow-sm transition-colors hover:bg-slate-800",
                          "focus:outline-none focus:ring-2 focus:ring-slate-900/30"
                        ].join(" ")}
                        initial={false}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
                      >
                        <span>Book Now</span>
                        <motion.span
                          aria-hidden="true"
                          initial={false}
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 500, damping: 26, mass: 0.5 }}
                          className="inline-block"
                        >
                          →
                        </motion.span>
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* lighter glow, faster fade */}
              <span className="pointer-events-none absolute -z-10 -left-10 -top-10 h-24 w-24 rounded-full bg-orange-400/15 blur-2xl transition-opacity duration-300 group-hover:opacity-95" />
              <span className="pointer-events-none absolute -z-10 -right-8 -bottom-8 h-24 w-24 rounded-full bg-teal-400/15 blur-2xl transition-opacity duration-300 group-hover:opacity-95" />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
