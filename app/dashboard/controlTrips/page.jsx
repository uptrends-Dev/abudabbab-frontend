"use client";

import Link from "next/link";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { deleletrip, getallTrips } from "../../../lib/apis/api";
import { TRIP_API_ADMIN } from "@/paths";
import { useMob } from "@/components/Provides/mobProvider";
import { Edit3, Trash2, Clock, Tag, ImageOff, Menu } from "lucide-react";


/* ---------------------------- helpers ---------------------------- */
const cls = (...a) => a.filter(Boolean).join(" ");

/* ---------------------------- tiny ui ---------------------------- */
const Chip = memo(function Chip({
  children,
  variant = "default",
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border";
  const variants = useMemo(
    () => ({
      default: "border-slate-200 bg-slate-50 text-slate-700",
      success: "border-emerald-200 bg-emerald-50 text-emerald-700",
      danger: "border-rose-200 bg-rose-50 text-rose-700",
      muted: "border-slate-200 bg-white text-slate-500",
      info: "border-sky-200 bg-sky-50 text-sky-700",
    }),
    []
  );
  return (
    <span className={cls(base, variants[variant], className)} {...rest}>
      {children}
    </span>
  );
});

const IconBtn = ({ className, ...rest }) => (
  <button
    className={cls(
      "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors",
      "border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
      className
    )}
    {...rest}
  />
);

/* ---------------------------- card ---------------------------- */
const TripCard = memo(function TripCard({ trip, onDelete }) {
  const cover =
    Array.isArray(trip.images) && trip.images.length > 0 ? trip.images[0] : null;

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-2xl border border-slate-200 bg-white
        shadow-sm transition-all duration-300
        hover:shadow-lg hover:-translate-y-[2px] hover:border-slate-300
      "
      role="article"
    >
      {/* Media */}
      <div className="relative">
        <div className="aspect-[18/8] sm:aspect-[18/6] overflow-hidden bg-slate-100">
          {cover ? (
            <img
              src={cover}
              alt={trip?.name || "Trip cover"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-400">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Gradient overlay + Status badge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium
              ${trip?.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
              }`}
          >
            {trip?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        {trip?.category && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
              <Tag className="h-3.5 w-3.5" />
              {trip.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 leading-tight line-clamp-1">
            {trip?.name || "—"}
          </h3>
        </div>

        {/* Prices */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            <span className="font-medium">Adult:</span>&nbsp;
            {trip?.prices?.adult?.euro}$&nbsp;{trip?.prices?.adult?.egp} EGP
          </span>
          <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            <span className="font-medium">Child:</span>&nbsp;
            {trip?.prices?.child?.euro}$&nbsp;{trip?.prices?.child?.egp} EGP
          </span>
        </div>

        {/* Time */}
        {(trip?.tripTime?.from || trip?.tripTime?.to) && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            {trip?.tripTime?.from && (
              <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5">
                {trip.tripTime.from}
              </span>
            )}
            {trip?.tripTime?.to && (
              <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5">
                {trip.tripTime.to}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {trip?.description && (
          <p className="mb-3 text-sm leading-relaxed text-slate-600 line-clamp-2">
            {trip.description}
          </p>
        )}

        {/* Features (horizontal scroll) */}
        {Array.isArray(trip?.features) && trip.features.length > 0 && (
          <div className="-mx-1 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <ul className="flex gap-2 px-1 min-w-max">
              {trip.features.slice(0, 8).map((f) => (
                <li key={f?._id || f?.title}>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                    <span className="text-slate-700">{f?.title}:</span>
                    <span className="text-slate-500">{f?.subtitle}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-slate-100" />

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            ID:&nbsp;<span className="font-mono">{trip?._id?.slice(-6) || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/controlTrips/${trip?._id}`}
              title="Update"
              className="
                inline-flex items-center justify-center gap-2 rounded-lg
                border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700
                hover:bg-sky-100 active:scale-[0.98] transition
              "
            >
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">Update</span>
            </Link>
            <button
              onClick={() => onDelete(trip?._id)}
              title="Delete"
              className="
                inline-flex items-center justify-center gap-2 rounded-lg
                border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700
                hover:bg-rose-100 active:scale-[0.98] transition
              "
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});


/* ---------------------------- skeleton ---------------------------- */
const CardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr_170px]">
      <div className="aspect-[16/10] sm:aspect-[3/2] bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="h-4 w-1/2 bg-slate-100 rounded" />
      </div>
      <div className="p-5 flex sm:flex-col gap-2">
        <div className="h-9 w-full bg-slate-100 rounded" />
        <div className="h-9 w-full bg-slate-100 rounded" />
      </div>
    </div>
  </div>
);

/* ---------------------------- page ---------------------------- */
export default function DashboardTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState("all"); // all | active | inactive
  const [sortBy, setSortBy] = useState("newest"); // newest | name | price

  const mounted = useRef(true);
  const { toggle } = useMob();

  const getTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getallTrips();
      if (mounted.current) setTrips(Array.isArray(data) ? data : []);
    } catch (e) {
      if (mounted.current) setError("Error loading trips. Please try again.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    getTrips();
    return () => {
      mounted.current = false;
    };
  }, [getTrips]);

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this trip?")) return;
      try {
        await deleletrip({ url: TRIP_API_ADMIN, id });
        getTrips();
      } catch (e) {
        const msg = e?.message || e?.payload?.message || "Delete failed";
        alert(`Error: ${msg}`);
      }
    },
    [getTrips]
  );

  const filtered = useMemo(() => {
    let list = [...trips];

    // filter by active
    if (onlyActive !== "all") {
      const flag = onlyActive === "active";
      list = list.filter((t) => !!t?.isActive === flag);
    }

    // search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => (t?.name || "").toLowerCase().includes(q));
    }

    // sort
    if (sortBy === "name") {
      list.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    } else if (sortBy === "price") {
      // sort by adult EGP as anchor
      list.sort(
        (a, b) => (b?.prices?.adult?.egp ?? 0) - (a?.prices?.adult?.egp ?? 0)
      );
    } else {
      // newest (createdAt desc)
      list.sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime()
      );
    }

    return list;
  }, [trips, onlyActive, sortBy, query]);

  // quick stats
  const stats = useMemo(() => {
    const total = trips.length;
    const active = trips.filter((t) => !!t?.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [trips]);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold">Control Trips</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/controlTrips/addTrip"
              className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium"
            >
              Add Trip
            </Link>
            <Link href="/">
              <button className="cursor-pointer flex justify-center items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium">
                <span>Preview</span> <MdOutlineRemoveRedEye />
              </button>
            </Link>
          </div>
        </div>

        {/* quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Active</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {stats.active}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Inactive</div>
            <div className="text-2xl font-semibold text-rose-600">
              {stats.inactive}
            </div>
          </div>
        </div>

        {/* toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* search */}
            <div className="lg:col-span-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
              />
            </div>

            {/* filters */}
            <div className="flex gap-2">
              <select
                value={onlyActive}
                onChange={(e) => setOnlyActive(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                title="Status"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                title="Sort by"
              >
                <option value="newest">Sort: Newest</option>
                <option value="name">Sort: Name</option>
                <option value="price">Sort: Price (Adult EGP)</option>
              </select>
            </div>

            {/* refresh */}
            <div className="flex lg:justify-end">
              <IconBtn onClick={getTrips}>Refresh</IconBtn>
            </div>
          </div>
        </div>

        {/* states */}
        {loading && (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}
{/* 
        {!!error && !loading && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <div className="text-rose-700 font-medium mb-1">
              Error Loading Trips
            </div>
            <p className="text-rose-600 text-sm mb-4">{error}</p>
            <button
              onClick={getTrips}
              className="px-4 py-2 rounded-lg border border-rose-200 bg-white hover:bg-rose-100 text-rose-700 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )} */}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No trips found. Try adjusting filters or add a new trip.
          </div>
        )}

        {/* list / grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map((trip) => (
              <TripCard key={trip?._id} trip={trip} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
