"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Ticket,
  DollarSign,
  Euro,
  Search,
  Calendar,
  ArrowUpDown,
  RefreshCcw,
  Plus,
} from "lucide-react";
import moment from "moment";
import { getadvancedTripInfo, getTotalInfo } from "@/lib/apis/api";
import { ADVANCED_INFO_URL, TOTALS_URL } from "@/paths";



export default function AdvancedInfosPage() {
  const [advancedInfo, setAdvancedInfo] = useState([])
  const [advancedLoading, setAdvancedLoading] = useState(false)
  const [totals, setTotals] = useState({})

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("revenue");

  // NEW: تاريخ
  const [dateMode, setDateMode] = useState("none"); // none | day | month | year | range | lastDays
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [lastDays, setLastDays] = useState("");

  const buildDateParams = () => {
    const p = {};
    if (dateMode === "day" && day) p.day = day;
    else if (dateMode === "month" && month) p.month = month;
    else if (dateMode === "year" && year) p.year = year;
    else if (dateMode === "range") {
      if (from) p.from = from;
      if (to) p.to = to;
    } else if (dateMode === "lastDays" && lastDays) p.lastDays = lastDays;
    return p;
  };

  // يبني query params للتاريخ

  // يبني URL كامل مع الـ params
  const withParams = (base) => {
    const p = buildDateParams();
    const qs = new URLSearchParams(p).toString();
    return qs ? `${base}?${qs}` : base;
  };



  async function getAllInfo() {
    setAdvancedLoading(true)
    try {
      const tripInfo = await getadvancedTripInfo(withParams(ADVANCED_INFO_URL))
      setAdvancedInfo(tripInfo)
      const totalInfo = await getTotalInfo(withParams(TOTALS_URL))
      console.log(totalInfo)
      setTotals(totalInfo)
    } catch (error) {
      console.log(error)
    }
    setAdvancedLoading(false)
  }
  // جلب البيانات عند فتح الصفحة وأي تغيير في التاريخ
  useEffect(() => {
    try {
      getAllInfo()
    } catch (error) {
      console.log(error)
    }
    // dispatch(getAdvancedTripInfo(withParams(ADVANCED_URL))); //res.data.data
    // dispatch(getTotalBookingsAndRevenue(withParams(TOTALS_URL)));

  }, [dateMode, day, month, year, from, to, lastDays]);


  // فلترة + ترتيب محلي
  const filteredTrips = useMemo(() => {
    const src = Array.isArray(advancedInfo) ? advancedInfo : [];
    let list = src.filter((t) =>
      t.tripName?.toLowerCase().includes(query.toLowerCase())
    );

    if (sortBy === "revenue") {
      list.sort((a, b) => (b.totalEgp ?? 0) - (a.totalEgp ?? 0));
    } else if (sortBy === "bookings") {
      list.sort((a, b) => (b.totalBookings ?? 0) - (a.totalBookings ?? 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.tripName || "").localeCompare(b.tripName || ""));
    }
    return list;
  }, [query, sortBy, advancedInfo]);

  const clearDate = () => {
    setDateMode("none");
    setDay(""); setMonth(""); setYear(""); setFrom(""); setTo(""); setLastDays("");
  };



  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold">Advanced Infos</h1>
          <Link
            href="/dashboard/controlTrips"
            className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm"
          >
            Back to Trips
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={BarChart3}
            label="Total Booking"
            value={fmt(totals?.totalBookings ?? 0)}
          />
          <StatCard
            icon={Ticket}
            label="Total Tickets"
            value={fmt(totals?.totalTickets ?? 0)}
          />
          <StatCard
            icon={DollarSign}
            label="Revenue EGP"
            value={fmt(totals?.totalEgp ?? 0)}
            sub={dateMode === "none" ? "All-time gross revenue (EGP)" : "Filtered revenue (EGP)"}
          />
          <StatCard
            icon={Euro}
            label="Revenue EUR"
            value={fmt(totals?.totalEuro ?? 0)}
            sub={dateMode === "none" ? "All-time gross revenue (EUR)" : "Filtered revenue (EUR)"}
          />
        </div>

        {/* Toolbar */}
        <Toolbar
          query={query}
          setQuery={setQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onRefresh={() => {
            // dispatch(getAdvancedTripInfo(withParams(ADVANCED_URL)));
            // dispatch(getTotalBookingsAndRevenue(withParams(TOTALS_URL)));
            getAllInfo()
          }}
          // date props
          dateMode={dateMode}
          setDateMode={setDateMode}
          day={day}
          setDay={setDay}
          month={month}
          setMonth={setMonth}
          year={year}
          setYear={setYear}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          lastDays={lastDays}
          setLastDays={setLastDays}
          onClearDate={clearDate}
        />

        {/* List */}
        {advancedLoading ? (
          <div className="loader" />
        ) : filteredTrips?.length ? (
          filteredTrips.map((t) => (
            <TripRow key={t.tripId ?? t._id ?? t.tripName} t={t} />
          ))
        ) : (
          <div className="text-center text-red-500 font-semibold">
            Trip Not Found
          </div>
        )}
      </main>

      <div className="pointer-events-none fixed inset-4 rounded-3xl border border-zinc-800/80" />
    </div>
  );
}




// -------------------------helper functions

const fmt = (n) => new Intl.NumberFormat().format(n);


// --------------------------helper Components

function Pill({ children, variant = "default", className = "" }) {
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border";
  const variants = {
    default: "border-zinc-700 bg-zinc-800 text-zinc-200",
    success: "border-emerald-700 bg-emerald-900/30 text-emerald-300",
    muted: "border-zinc-700 bg-zinc-900/40 text-zinc-400",
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, className }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center border border-zinc-700 bg-zinc-900">
          <Icon className="h-5 w-5 text-zinc-200" />
        </div>
        <div>
          <div className="text-xl font-semibold text-zinc-100 leading-tight">
            {value ?? "—"}
          </div>
          <div className="text-xs text-zinc-400">{label}</div>
        </div>
      </div>
      {sub && <div className="mt-3 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

function Toolbar({
  query,
  setQuery,
  sortBy,
  setSortBy,
  onRefresh,
  // date props
  dateMode,
  setDateMode,
  day,
  setDay,
  month,
  setMonth,
  year,
  setYear,
  from,
  setFrom,
  to,
  setTo,
  lastDays,
  setLastDays,
  onClearDate,
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips…"
            className="pl-9 pr-3 py-2 w-64 rounded-lg border border-zinc-800 bg-zinc-950/60 text-sm outline-none focus:ring-2 focus:ring-zinc-700/50"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            date
          </span>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <select
              value={dateMode}
              onChange={(e) => {
                const v = e.target.value;
                setDateMode(v);
                setDay(""); setMonth(""); setYear(""); setFrom(""); setTo(""); setLastDays("");
              }}
              className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-zinc-800 bg-zinc-950/60 text-sm outline-none focus:ring-2 focus:ring-zinc-700/50"
            >
              <option value="none">All time</option>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="range">Range</option>
              <option value="lastDays">Last N days</option>
            </select>
          </div>

          {dateMode === "day" && (
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            />
          )}

          {dateMode === "month" && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            />
          )}

          {dateMode === "year" && (
            <input
              type="number"
              min="1970"
              max="2100"
              placeholder="YYYY"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            />
          )}

          {dateMode === "range" && (
            <>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
                title="From (inclusive)"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
                title="To (inclusive)"
              />
            </>
          )}

          {dateMode === "lastDays" && (
            <input
              type="number"
              min="1"
              placeholder="e.g. 7"
              value={lastDays}
              onChange={(e) => setLastDays(e.target.value)}
              className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            />
          )}

          <button
            onClick={onClearDate}
            className="rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-zinc-800 bg-zinc-950/60 text-sm outline-none focus:ring-2 focus:ring-zinc-700/50"
          >
            <option value="revenue">Sort: Revenue</option>
            <option value="bookings">Sort: Bookings</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        <Link
          href="/dashboard/controlTrips/addTrip"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-900/30 hover:bg-emerald-900/40 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Trip
        </Link>
      </div>
    </div>
  );
}

function TripRow({ t, currency = "EGP" }) {
  const revenue = currency === "EGP" ? t.totalEgp : t.totalEuro;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr_auto] gap-4 items-center">
        <div className="overflow-hidden rounded-xl border border-zinc-800 aspect-[16/10] sm:aspect-[3/2]">
          {t.coverImage ? (
            <img
              src={t.coverImage}
              alt={t.tripName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-zinc-500">
              image
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              {t.tripName}
            </h3>
            <Pill>Bookings: {fmt(t.totalBookings)}</Pill>
            <Pill>Tickets: {fmt(t.totalTickets)}</Pill>
          </div>
          <div className="text-sm text-zinc-300">
            <Calendar className="inline-block h-4 w-4 mr-1 align-[-2px]" />
            Created At :{" "}
            <span className="text-teal-400">
              {moment(t.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </div>
          <div className="text-sm text-zinc-300">
            <Calendar className="inline-block h-4 w-4 mr-1 align-[-2px]" />
            Last Update At :{" "}
            <span className="text-teal-400">
              {moment(t.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </div>
        </div>

        <div className="sm:text-right flex flex-col gap-3">
          <div className="px-5 py-1 bg-[#181818] rounded-2xl border-2 border-[#232323] flex flex-col justify-center items-center">
            <div className="text-xs text-zinc-400">revenue EGP:</div>
            <div className="text-lg font-semibold text-emerald-400">
              {t.totalEgp} .LE
            </div>
          </div>
          <div className="px-5 py-1 bg-[#181818] rounded-2xl border-2 border-[#232323] flex flex-col justify-center items-center">
            <div className="text-xs text-zinc-400">revenue Euro:</div>
            <div className="text-lg font-semibold text-amber-400">
              {t.totalEuro} $
            </div>
          </div>

          <div className=" flex gap-2 sm:justify-end">
            <Link
              href={`/dashboard/controlTrips/${t.tripId}`}
              className="px-3 py-1.5 rounded-lg border border-sky-700 bg-sky-900/30 text-sky-200 text-xs font-medium hover:bg-sky-900/40"
            >
              Manage
            </Link>
            <Link
              href="/dashboard/controlTrips"
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/40 text-zinc-300 text-xs font-medium hover:bg-zinc-900"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}