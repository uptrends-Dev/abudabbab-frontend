"use client";


import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { deleletrip, getallTrips } from "@/lib/apis/api";
import { TRIP_API_ADMIN, TRIPS_URL } from "@/paths";



/* ---------- Page ---------- */
export default function DashboardTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  // fetch once
  useEffect(() => {
    // dispatch(fetchTripsData(API_LIST));

    getTrips()
  }, []);

  // delete one
  const handleDelete = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try {
      // await dispatch(deleteTrip({ url: API_ADMIN, id })).unwrap();
      await deleletrip({ url: TRIP_API_ADMIN, id })
    } catch (e) {
      const errorMessage = e?.message || e?.payload?.message || "Delete failed";
      alert(`Error: ${errorMessage}`);
    }
  };

  async function getTrips() {
    setLoading(true)
    try {
      const trip = await getallTrips(TRIPS_URL)
      setTrips(trip)
      // console.log(trip)
    } catch (error) {
      setError("error")
    }
    setLoading(false)
  }
  // retry function
  const handleRetry = async () => {
    getTrips()
  };

  // const [trips, setTrips] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");

  // // avoid setting state after unmount
  // const isMounted = useRef(true);

  // const getErrorMessage = (e) =>
  //   e?.message || e?.payload?.message || e?.response?.data?.message || "Something went wrong";

  // // fetch list (no signal)
  // const getTrips = useCallback(async () => {
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const data = await getallTrips(TRIPS_URL);
  //     if (!isMounted.current) return;
  //     setTrips(Array.isArray(data) ? data : []);
  //   } catch (e) {
  //     if (!isMounted.current) return;
  //     setError(getErrorMessage(e));
  //   } finally {
  //     if (isMounted.current) setLoading(false);
  //   }
  // }, []);

  // // delete one (optimistic, rollback on fail)
  // const handleDelete = useCallback(
  //   async (id) => {
  //     if (!id) return;
  //     if (!window.confirm("Delete this trip?")) return;

  //     const prev = trips;
  //     setTrips((cur) => cur.filter((t) => t.id !== id));

  //     try {
  //       await deleletrip({ url: TRIP_API_ADMIN, id }); // keep your original function name
  //     } catch (e) {
  //       alert(`Error: ${getErrorMessage(e)}`);
  //       setTrips(prev); // rollback
  //     }
  //   },
  //   [trips]
  // );

  // const handleRetry = useCallback(() => {
  //   getTrips();
  // }, [getTrips]);

  // // fetch once
  // useEffect(() => {
  //   isMounted.current = true;
  //   getTrips();
  //   return () => {
  //     isMounted.current = false;
  //   };
  // }, [getTrips]);

  // // ----- UI -----
  // if (loading && trips.length === 0) {
  //   return (
  //     <section className="p-4">
  //       <p>Loading trips…</p>
  //     </section>
  //   );
  // }

  // if (error && trips.length === 0) {
  //   return (
  //     <section className="p-4">
  //       <p role="alert" style={{ color: "crimson" }}>{error}</p>
  //       <button onClick={handleRetry}>Retry</button>
  //     </section>
  //   );
  // }





  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold">Control Your Trips</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/controlTrips/addTrip" className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm font-medium">
              ADD
            </Link>
            {/* TODO: delete all handler */}
            <Link href={'/trips'}>
              <button className=" cursor-pointer flex justify-center items-center gap-2 px-4 py-2 rounded-xl border border-yellow-700 bg-yellow-900/30 hover:bg-yellow-900/40 text-sm font-medium">
                <span> Preview</span>  <MdOutlineRemoveRedEye />
              </button>
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
            <div className="loader"></div>
            Loading trips...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-800 bg-rose-900/40 p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-rose-300 font-medium">Error Loading Trips</div>
              <p className="text-rose-200 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg border border-rose-700 bg-rose-900/60 hover:bg-rose-900/80 text-rose-200 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && trips.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
            No trips yet. Click <span className="text-zinc-200 font-medium">ADD</span> to create one.
          </div>
        )}

        {/* List */}
        {!loading && !error && trips.map((trip) => (
          <TripCard key={trip?._id} trip={trip} onDelete={handleDelete} />
        ))}
      </main>

      <div className="pointer-events-none fixed inset-4 rounded-3xl border border-zinc-800/80" />
    </div>
  );
}



// ---------------- bulider components

function Pill({ children, variant = "default", className = "", ...rest }) {
  const base =
    "inline-flex items-center gap-1 px-4 py-2 text-xs rounded-full border";
  const variants = {
    default: "border-zinc-700 bg-zinc-800 text-zinc-200",
    success: "border-emerald-700 bg-emerald-900/30 text-emerald-300",
    danger: "border-rose-700 bg-rose-900/30 text-rose-300",
    muted: "border-zinc-700 bg-zinc-900/40 text-zinc-400 ",
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </span>
  );
}

function TripCard({ trip, onDelete }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr_140px] gap-4 items-center">
        {/* image */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 aspect-[16/10] sm:aspect-[3/2]">
          {Array.isArray(trip.images) && trip.images.length > 0 ? (
            <img src={trip.images[0]} alt={trip.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-zinc-500">image</div>
          )}
        </div>

        {/* content */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100">{trip.name}</h3>
            <Pill>ADULT: {trip.prices.adult.euro}$ {trip.prices.adult.egp}EGP</Pill>
            <Pill>CHILD: {trip.prices.child.euro}$ {trip.prices.child.egp}EGP</Pill>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-md font-semibold text-zinc-100">Trip Time</h3>
            <Pill variant="muted">{trip.tripTime.from}</Pill>
            <Pill variant="muted">{trip.tripTime.to}</Pill>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
            {trip.description}
          </p>

          <ul className="flex flex-wrap gap-2 pt-1">
            {trip.features?.map((f) => (
              <li key={f._id || f.title}>
                <Pill variant="muted" className="flex gap-1">
                  <span className="font-semibold text-gray-300">{f.title}:</span>
                  <span>{f.subtitle}</span>
                </Pill>
              </li>
            ))}
          </ul>
        </div>

        {/* actions */}
        <div className="flex sm:flex-col justify-end sm:justify-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${trip.isActive
              ? "border-emerald-700 bg-emerald-900/30 text-emerald-200"
              : "border-zinc-700 bg-zinc-900/40 text-zinc-300"
              }`}
            aria-pressed={trip.isActive}
            disabled
          >
            {trip.isActive ? "● Is Active" : "○ Inactive"}
          </button>

          <Link href={`/dashboard/controlTrips/${trip._id}`} className=" cursor-pointer px-3 py-1.5 rounded-lg border border-sky-700 bg-sky-900/30 text-sky-200 text-xs font-medium hover:bg-sky-900/40 text-center">
            Update
          </Link>

          <button
            onClick={() => onDelete(trip._id)}
            className=" cursor-pointer px-3 py-1.5 rounded-lg border border-rose-700 bg-rose-900/30 text-rose-200 text-xs font-medium hover:bg-rose-900/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}