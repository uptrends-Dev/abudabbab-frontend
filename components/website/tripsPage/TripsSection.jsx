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
    dispatch(fetchTripsData("https://abudabbba-backend.vercel.app/api/trips"));
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
                  : "group relative snap-center lg:snap-none rounded-xl border border-slate-200 bg-white shadow-sm transition"
              }
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(2,6,23,0.08)" }}
              whileTap={{ scale: 0.99 }}
            >
              {/* صورة الرحلة */}
              <div className="overflow-hidden rounded-t-xl">
                <motion.img
                  src={t.images[0]}
                  alt={t.name}
                  className="h-90 w-full object-cover"
                  initial={{ scale: 1.04 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  whileHover={{ scale: 1.06 }}
                />
              </div>

              {/* تفاصيل الرحلة */}
              <div className="p-5 text-left">
                <h3 className="text-md font-semibold text-slate-800">
                  {t.name}
                </h3>

                {/* تقييم الرحلة */}
                {/* <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>⭐⭐⭐⭐</span>
                  <span>({t.rating} Rating)</span>
                </div> */}

                {/* الأسعار */}
                <div className="mt-3 text-slate-900">
                  <span className="text-lg font-bold">
                    {t.prices.adult.euro} €
                  </span>
                  <span className="ml-1 text-sm text-slate-500">/Person</span>
                </div>

                {/* تفاصيل الوقت */}
                <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {t.tripTime.from} - {t.tripTime.to}
                  </span>
                  <Link href={`/trips/${t._id}`}>
                    <motion.button
                      onClick={() => handleTripSelection(t._id)} // تخزين الـ tripId عند النقر على "Book Now"
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs text-white transition hover:bg-orange-500/90"
                    >
                      Book Now
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
