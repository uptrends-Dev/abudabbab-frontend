"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, RefreshCcw, Plus, Calendar, Menu } from "lucide-react";
import moment from "moment";
import { getadvancedTripInfo, getTotalInfo } from "../../../lib/apis/api";
import { ADVANCED_INFO_URL, TOTALS_URL } from "@/paths";
import { useMob } from "@/components/Provides/mobProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fmt = (n) => new Intl.NumberFormat().format(n);

export default function AdvancedInfosPage() {
  const [advancedInfo, setAdvancedInfo] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [totals, setTotals] = useState({});

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("revenue");

  // date filters
  const [dateMode, setDateMode] = useState("none");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [lastDays, setLastDays] = useState("");

  const { toggle } = useMob();

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

  const withParams = (base) => {
    const qs = new URLSearchParams(buildDateParams()).toString();
    return qs ? `${base}?${qs}` : base;
  };

  async function getAllInfo() {
    setAdvancedLoading(true);
    try {
      const tripInfo = await getadvancedTripInfo(withParams(ADVANCED_INFO_URL));
      setAdvancedInfo(Array.isArray(tripInfo) ? tripInfo : []);
      const totalInfo = await getTotalInfo(withParams(TOTALS_URL));
      setTotals(totalInfo || {});
    } catch (e) {
      console.error(e);
    } finally {
      setAdvancedLoading(false);
    }
  }

  useEffect(() => {
    getAllInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMode, day, month, year, from, to, lastDays]);

  // search/sort
  const filteredTrips = useMemo(() => {
    const src = Array.isArray(advancedInfo) ? advancedInfo : [];
    let list = src.filter((t) =>
      (t.tripName || "").toLowerCase().includes(query.toLowerCase())
    );
    if (sortBy === "revenue") {
      list.sort((a, b) => (b.totalEgp ?? 0) - (a.totalEgp ?? 0));
    } else if (sortBy === "bookings") {
      list.sort((a, b) => (b.totalBookings ?? 0) - (a.totalBookings ?? 0));
    } else {
      list.sort((a, b) =>
        (a.tripName || "").localeCompare(b.tripName || "")
      );
    }
    return list;
  }, [query, sortBy, advancedInfo]);

  const clearDate = () => {
    setDateMode("none");
    setDay("");
    setMonth("");
    setYear("");
    setFrom("");
    setTo("");
    setLastDays("");
  };

  // charts data (line only)
  const lineData = useMemo(() => {
    const top = [...filteredTrips]
      .sort((a, b) => (b.totalBookings ?? 0) - (a.totalBookings ?? 0))
      .slice(0, 8);
    return top.map((t) => ({
      name: t.tripName || "—",
      bookings: t.totalBookings ?? 0,
      tickets: t.totalTickets ?? 0,
    }));
  }, [filteredTrips]);

  const topTripsByRevenue = useMemo(
    () =>
      [...filteredTrips]
        .sort((a, b) => (b.totalEgp ?? 0) - (a.totalEgp ?? 0))
        .slice(0, 5),
    [filteredTrips]
  );

  const topTripsByBookings = useMemo(
    () =>
      [...filteredTrips]
        .sort((a, b) => (b.totalBookings ?? 0) - (a.totalBookings ?? 0))
        .slice(0, 5),
    [filteredTrips]
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips…"
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
              />
            </div>

            {/* Sort */}
            <div className="relative w-full sm:w-auto">
              <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value )}
                className="w-full appearance-none pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
              >
                <option value="revenue">Sort: Revenue</option>
                <option value="bookings">Sort: Bookings</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>

            {/* Mobile filter toggle */}
            <details className="sm:hidden w-full">
              <summary className="list-none w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                More filters
              </summary>

              <div className="mt-2 grid grid-cols-1 gap-2">
                <DateControls
                  {...{
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
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={clearDate}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={getAllInfo}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </details>

            {/* Desktop date controls */}
            <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
              <DateControls
                {...{
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
                }}
              />
              <button
                onClick={clearDate}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                onClick={getAllInfo}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <Link
              href="/dashboard/controlTrips/addTrip"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" /> Add Trip
            </Link>
          </div>
        </div>

        {/* KPIs + Line */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <KPICard
              icon="👥"
              label="Total Bookings"
              value={fmt(totals?.totalBookings ?? 0)}
              delta="+2.5k"
              hint="This Month"
              gradient="from-pink-100 to-white"
            />
            <KPICard
              icon="🎟️"
              label="Total Tickets"
              value={fmt(totals?.totalTickets ?? 0)}
              delta="+30"
              hint="This Month"
              gradient="from-violet-100 to-white"
            />
            <KPICard
              icon="💵"
              label="Overall Revenue (EGP)"
              value={`E£ ${fmt(totals?.totalEgp ?? 0)}`}
              delta="+1.5k"
              hint="This Month"
              gradient="from-sky-100 to-white"
            />
          </div>

          {/* Line chart spans 2 columns on lg */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold text-slate-700">
                Bookings vs Tickets (Top)
              </div>
              <span className="text-xs text-slate-400">
                Top {lineData.length} trips
              </span>
            </div>
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid stroke="#eef2ff" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    height={36}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TopList
            title="Top Trips (Revenue)"
            rightLink="#"
            items={topTripsByRevenue}
            rightFormat={(t) => `E£ ${fmt(t.totalEgp ?? 0)}`}
            badgeClass="bg-sky-50 text-sky-600"
            sub={(t) => `Bookings ${fmt(t.totalBookings ?? 0)}`}
          />

          <TopList
            title="Top Trips (Bookings)"
            rightLink="#"
            items={topTripsByBookings}
            rightFormat={(t) => fmt(t.totalBookings ?? 0)}
            badgeClass="bg-emerald-50 text-emerald-600"
            sub={(t) => `Tickets ${fmt(t.totalTickets ?? 0)}`}
          />

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold text-slate-700">Latest Trips</div>
              <Link href="#" className="text-xs text-sky-600">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {(advancedLoading ? [] : filteredTrips.slice(0, 6)).map(
                (t, i) => (
                  <div
                    key={(t.tripId || t._id || i) + "-latest"}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-16 overflow-hidden rounded-md bg-slate-100 shrink-0">
                        {t.coverImage ? (
                          <img
                            src={t.coverImage}
                            alt={t.tripName}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="text-sm min-w-0">
                        <div className="font-medium text-slate-700 truncate max-w-[180px] sm:max-w-[220px]">
                          {t.tripName || "—"}
                        </div>
                        <div className="text-slate-400 text-xs flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {moment(t.updatedAt || t.createdAt).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
              {!filteredTrips.length && (
                <div className="text-slate-400 text-sm">No data</div>
              )}
            </div>
          </div>
        </div>

        {/* Full list */}
        <section className="space-y-3">
          {advancedLoading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : filteredTrips.length ? (
            filteredTrips.map((t) => (
              <TripRow key={t.tripId ?? t._id ?? t.tripName} t={t} />
            ))
          ) : (
            <div className="text-slate-500 text-sm">No trips found</div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- sub components ---------- */

function DateControls(props) {
  const {
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
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <select
          value={dateMode}
          onChange={(e) => {
            const v = e.target.value 
            setDateMode(v);
            setDay("");
            setMonth("");
            setYear("");
            setFrom("");
            setTo("");
            setLastDays("");
          }}
          className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
          title="Date filter"
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      )}
      {dateMode === "month" && (
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
          className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      )}
      {dateMode === "range" && (
        <>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            title="From (inclusive)"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
          className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  delta,
  hint,
  gradient,
}) {
  return (
    <div
      className={`rounded-2xl p-4 border border-slate-200 bg-gradient-to-br ${
        gradient || "from-white to-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-2xl">{icon}</div>
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {delta}
        </span>
      </div>
      <div className="mt-3 text-2xl sm:text-3xl font-semibold">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{hint}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}

function TopList({
  title,
  rightLink,
  items,
  rightFormat,
  badgeClass,
  sub,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold text-slate-700">{title}</div>
        <Link href={rightLink} className="text-xs text-sky-600">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((t, i) => (
          <div
            key={(t.tripId || t._id || i) + title}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-9 w-9 rounded-lg grid place-items-center ${badgeClass} shrink-0`}
              >
                {i + 1}
              </div>
              <div className="text-sm min-w-0">
                <div className="font-medium text-slate-700 truncate max-w-[180px] sm:max-w-[220px]">
                  {t.tripName || "—"}
                </div>
                <div className="text-slate-400 text-xs">{sub(t)}</div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold shrink-0">
              {rightFormat(t)}
            </div>
          </div>
        ))}
        {!items.length && <div className="text-slate-400 text-sm">No data</div>}
      </div>
    </div>
  );
}

function TripRow({ t }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] lg:grid-cols-[220px_1fr_auto] gap-3 sm:gap-4 items-center">
        <div className="overflow-hidden rounded-xl border border-slate-200 aspect-[16/10] sm:aspect-[3/2]">
          {t.coverImage ? (
            <img
              src={t.coverImage}
              alt={t.tripName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-400">
              image
            </div>
          )}
        </div>

        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate max-w-full">
              {t.tripName}
            </h3>
            <Pill>Bookings: {fmt(t.totalBookings ?? 0)}</Pill>
            <Pill>Tickets: {fmt(t.totalTickets ?? 0)}</Pill>
          </div>
          <div className="text-sm text-slate-600">
            <Calendar className="inline-block h-4 w-4 mr-1 align-[-2px]" />
            Created:{" "}
            <span className="text-sky-600">
              {moment(t.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            <Calendar className="inline-block h-4 w-4 mr-1 align-[-2px]" />
            Updated:{" "}
            <span className="text-sky-600">
              {moment(t.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </div>
        </div>

        <div className="sm:text-right flex flex-col gap-2 sm:gap-3">
          <div className="px-4 py-1.5 rounded-2xl border bg-slate-50 flex flex-col justify-center items-center">
            <div className="text-xs text-slate-500">Revenue (EGP)</div>
            <div className="text-base sm:text-lg font-semibold text-emerald-600">
              {fmt(t.totalEgp ?? 0)} E£
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-2xl border bg-slate-50 flex flex-col justify-center items-center">
            <div className="text-xs text-slate-500">Revenue (EUR)</div>
            <div className="text-base sm:text-lg font-semibold text-amber-600">
              {fmt(t.totalEuro ?? 0)} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border border-slate-200 bg-slate-50 text-slate-600">
      {children}
    </span>
  );
}
