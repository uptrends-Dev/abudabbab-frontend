"use client";

import { useEffect, useState } from "react";
import { FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { Menu } from "lucide-react";
import { exportExsl, getallBooking, getallTrips } from "../../../lib/apis/api";
import { TRIPS_URL } from "@/paths";
import { useMob } from "@/components/Provides/mobProvider";

/* -------------------------------------------------- */

export default function BookingsPage() {
  const [trips, setTrips] = useState([]);

  // search & filters
  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("firstName");
  const [transferFilter, setTransferFilter] = useState("all");
  const [payment, setPaymentFilter] = useState("all");
  const [checkIn, setcheckInFilter] = useState("all");
  const [tripName, setTripNameFilter] = useState("");
  const [sort, setSort] = useState("desc");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // data
  const [allBookings, setAllBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // date filters
  const [dateMode, setDateMode] = useState("none"); // none | day | month | year | range | lastDays
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [lastDays, setLastDays] = useState("");

  const { isMobile, toggle } = useMob();
  // UI-only state for responsive filters (doesn't change any data logic)
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount = (() => {
    let n = 0;
    if (q) n++;
    if (transferFilter !== "all") n++;
    if (payment !== "all") n++;
    if (checkIn !== "all") n++;
    if (tripName) n++;
    if (dateMode !== "none") n++;
    return n;
  })();

  const buildDateParams = () => {
    const p = {};
    switch (dateMode) {
      case "day":
        if (day) p.day = day;
        break;
      case "month":
        if (month) p.month = month;
        break;
      case "year":
        if (year) p.year = year;
        break;
      case "range":
        if (from) p.from = from;
        if (to) p.to = to;
        break;
      case "lastDays":
        if (lastDays) p.lastDays = lastDays;
        break;
      default:
        break;
    }
    return p;
  };

  async function getTrips() {
    try {
      const trip = await getallTrips(TRIPS_URL);
      setTrips(trip);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTrips();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = {
          page,
          limit,
          sort,
          q,
          searchField,
          transferFilter,
          payment,
          checkIn,
          tripName,
          ...buildDateParams(),
        };

        const response = await getallBooking(params);

        if (response.data.bookings?.length === 0 && page > 1) {
          setPage(1);
        }

        setAllBookings(response.data.bookings || []);
        setTotalBookings(response.data.totalBookings || 0);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [
    page,
    q,
    searchField,
    transferFilter,
    sort,
    limit,
    dateMode,
    day,
    month,
    year,
    from,
    to,
    lastDays,
    payment,
    checkIn,
    tripName,
  ]);

  const resetToFirst = () => setPage(1);
  const totalPages = Math.max(1, Math.ceil(totalBookings / limit));

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const clearDateFilters = () => {
    setDateMode("none");
    setDay("");
    setMonth("");
    setYear("");
    setFrom("");
    setTo("");
    setLastDays("");
    resetToFirst();
  };

  const exportEx = async (rows) => {
    try {
      const limited = rows.slice(0, 1000);
      const data = await exportExsl(limited);
      const blob = new Blob([data.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        data.headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] ??
        "bookings.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold">
              Bookings <span className="text-slate-500">• {totalBookings}</span>
            </h1>
          </div>

          <button
            onClick={() => exportEx(allBookings)}
            className="cursor-pointer rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
          >
            Export Excel
          </button>
        </div>

        {/* Mobile filters opener */}
        <div className="mt-4 md:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm flex items-center justify-between"
          >
            <span>Filters</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
              {activeFiltersCount} active
            </span>
          </button>
        </div>

        {/* Filters Card (desktop/tablet) */}
        <div className="hidden md:block mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">


          {/* Primary Row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search + Field */}
            <div className="flex items-center gap-2 w-full md:max-w-xl">
              <div className="relative flex-1">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    resetToFirst();
                  }}
                  placeholder={`Search by ${searchField}`}
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 fill-slate-400"
                >
                  <path d="M10 2a8 8 0 105.3 14.1l4.3 4.3 1.4-1.4-4.3-4.3A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
                </svg>
              </div>

              <SelectMini
                value={searchField}
                onChange={(v) => {
                  setSearchField(v);
                  resetToFirst();
                }}
                label="Field"
                options={[
                  { value: "firstName", label: "Name" },
                  { value: "phone", label: "Phone" },
                  { value: "email", label: "Email" },
                ]}
              />
            </div>

            {/* Sort + Rows + Pager */}
            <div className="flex items-center gap-2 justify-between md:justify-end">
              <div className="hidden sm:flex items-center gap-2">
                <SelectMini
                  value={sort}
                  onChange={(v) => {
                    setSort(v);
                    resetToFirst();
                  }}
                  label="Sort"
                  options={[
                    { value: "desc", label: "Newest" },
                    { value: "asc", label: "Oldest" },
                  ]}
                />
                <SelectMini
                  value={String(limit)}
                  onChange={(v) => {
                    setLimit(Number(v));
                    resetToFirst();
                  }}
                  label="Rows"
                  options={[
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                  ]}
                />
              </div>

              <div className="flex items-center gap-2">
                <PageBtn disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Prev
                </PageBtn>
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  {page} / {totalPages}
                </span>
                <PageBtn
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </PageBtn>
              </div>
            </div>

          </div>

          {/* Quick chips row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              filters
            </span>

            <FilterChip
              label={`Transfer: ${transferFilter}`}
              active={transferFilter !== "all"}
              onClear={() => {
                setTransferFilter("all");
                resetToFirst();
              }}
            />
            <FilterChip
              label={`Payment: ${payment}`}
              active={payment !== "all"}
              onClear={() => {
                setPaymentFilter("all");
                resetToFirst();
              }}
            />
            <FilterChip
              label={`CheckIn: ${checkIn}`}
              active={checkIn !== "all"}
              onClear={() => {
                setcheckInFilter("all");
                resetToFirst();
              }}
            />
            <FilterChip
              label={tripName ? `Trip: ${tripName}` : "Trip: All"}
              active={!!tripName}
              onClear={() => {
                setTripNameFilter("");
                resetToFirst();
              }}
            />

            {/* Date summary chip */}
            <FilterChip
              label={
                dateMode === "none"
                  ? "Date: All time"
                  : dateMode === "day"
                  ? `Date: ${day || "—"}`
                  : dateMode === "month"
                  ? `Month: ${month || "—"}`
                  : dateMode === "year"
                  ? `Year: ${year || "—"}`
                  : dateMode === "range"
                  ? `Range: ${from || "—"} → ${to || "—"}`
                  : `Last ${lastDays || "—"} days`
              }
              active={dateMode !== "none"}
              onClear={clearDateFilters}
            />

            <span className="mx-2 h-5 w-px bg-slate-200" />
            <button
              onClick={() => {
                setQ("");
                setSearchField("firstName");
                setTransferFilter("all");
                setPaymentFilter("all");
                setcheckInFilter("all");
                setTripNameFilter("");
                setSort("desc");
                setLimit(20);
                clearDateFilters();
                resetToFirst();
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Reset all
            </button>

            {/* More filters */}
            <details className="ml-auto group">
              <summary className="list-none inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                More filters
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SelectLabeled
                  label="Transfer"
                  value={transferFilter}
                  onChange={(v) => {
                    setTransferFilter(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                <SelectLabeled
                  label="Payment"
                  value={payment}
                  onChange={(v) => {
                    setPaymentFilter(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                <SelectLabeled
                  label="Check in"
                  value={checkIn}
                  onChange={(v) => {
                    setcheckInFilter(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />

                {/* Trip select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Trip
                  </label>
                  <select
                    value={tripName}
                    onChange={(e) => {
                      setTripNameFilter(e.target.value);
                      resetToFirst();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                  >
                    <option value="">All Trips</option>
                    {trips.map((e) => (
                      <option value={e?.name} key={e?.name}>
                        {e?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </details>
          </div>

          {/* Date filter row */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              date
            </span>

            <select
              value={dateMode}
              onChange={(e) => {
                const v = e.target.value;
                setDateMode(v);
                setDay("");
                setMonth("");
                setYear("");
                setFrom("");
                setTo("");
                setLastDays("");
                resetToFirst();
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
            >
              <option value="none">All time</option>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="range">Range</option>
              <option value="lastDays">Last N days</option>
            </select>

            {dateMode === "day" && (
              <input
                type="date"
                value={day}
                onChange={(e) => {
                  setDay(e.target.value);
                  resetToFirst();
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            )}

            {dateMode === "month" && (
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  resetToFirst();
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            )}

            {dateMode === "year" && (
              <input
                type="number"
                min="1970"
                max="2100"
                placeholder="YYYY"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  resetToFirst();
                }}
                className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            )}

            {dateMode === "range" && (
              <>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    resetToFirst();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  title="From (inclusive)"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    resetToFirst();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
                onChange={(e) => {
                  setLastDays(e.target.value);
                  resetToFirst();
                }}
                className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            )}

            <button
              onClick={clearDateFilters}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>


        </div>

        {/* Mobile Filters Drawer */}
        {filtersOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-white p-4 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm"
                >
                  Close
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-500">Search</label>
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    resetToFirst();
                  }}
                  placeholder={`Search by ${searchField}`}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                />
                <SelectLabeled
                  label="Field"
                  value={searchField}
                  onChange={(v) => {
                    setSearchField(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "firstName", label: "Name" },
                    { value: "phone", label: "Phone" },
                    { value: "email", label: "Email" },
                  ]}
                />
              </div>

              {/* Toggles */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectLabeled
                  label="Transfer"
                  value={transferFilter}
                  onChange={(v) => {
                    setTransferFilter(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                <SelectLabeled
                  label="Payment"
                  value={payment}
                  onChange={(v) => {
                    setPaymentFilter(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                <SelectLabeled
                  label="Check in"
                  value={checkIn}
                  onChange={(v) => {
                    setcheckInFilter(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wide text-slate-500">Trip</label>
                  <select
                    value={tripName}
                    onChange={(e) => {
                      setTripNameFilter(e.target.value);
                      resetToFirst();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">All Trips</option>
                    {trips.map((e) => (
                      <option value={e?.name} key={e?.name}>
                        {e?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date controls */}
              <div className="mt-4 space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-500">Date</label>
                <select
                  value={dateMode}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDateMode(v);
                    setDay("");
                    setMonth("");
                    setYear("");
                    setFrom("");
                    setTo("");
                    setLastDays("");
                    resetToFirst();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="none">All time</option>
                  <option value="day">Day</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="range">Range</option>
                  <option value="lastDays">Last N days</option>
                </select>

                {dateMode === "day" && (
                  <input
                    type="date"
                    value={day}
                    onChange={(e) => {
                      setDay(e.target.value);
                      resetToFirst();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                )}
                {dateMode === "month" && (
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value);
                      resetToFirst();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                )}
                {dateMode === "year" && (
                  <input
                    type="number"
                    min="1970"
                    max="2100"
                    placeholder="YYYY"
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      resetToFirst();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                )}
                {dateMode === "range" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        resetToFirst();
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      title="From (inclusive)"
                    />
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        resetToFirst();
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      title="To (inclusive)"
                    />
                  </div>
                )}
                {dateMode === "lastDays" && (
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 7"
                    value={lastDays}
                    onChange={(e) => {
                      setLastDays(e.target.value);
                      resetToFirst();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                )}

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={clearDateFilters}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    Clear date
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="ml-auto rounded-xl bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Sorting & rows */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <SelectLabeled
                  label="Sort"
                  value={sort}
                  onChange={(v) => {
                    setSort(v);
                    resetToFirst();
                  }}
                  options={[
                    { value: "desc", label: "Newest" },
                    { value: "asc", label: "Oldest" },
                  ]}
                />
                <SelectLabeled
                  label="Rows"
                  value={String(limit)}
                  onChange={(v) => {
                    setLimit(Number(v));
                    resetToFirst();
                  }}
                  options={[
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                  ]}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => {
                    setQ("");
                    setSearchField("firstName");
                    setTransferFilter("all");
                    setPaymentFilter("all");
                    setcheckInFilter("all");
                    setTripNameFilter("");
                    setSort("desc");
                    setLimit(20);
                    clearDateFilters();
                    resetToFirst();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  Reset all
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-xl bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>User name</Th>
                  <Th>Phone</Th>
                  <Th>Trip name</Th>
                  <Th>Transfer</Th>
                  <Th>Adult</Th>
                  <Th>Child</Th>
                  <Th>Booking date</Th>
                  <Th>Created At</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {allBookings?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      No results.
                    </td>
                  </tr>
                ) : (
                  allBookings?.map((r) => (
                    <tr
                      key={r._id}
                      className="border-t border-slate-200 hover:bg-slate-50/60"
                    >
                      <Td>{r.user.firstName}</Td>
                      <Td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${"+20" + r.user.phone.replace(/\D/g, "")
                              }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-500"
                            title="WhatsApp"
                          >
                            <FaWhatsapp />
                          </a>
                          {r.user.phone}
                        </div>
                      </Td>
                      <Td>{r?.tripInfo?.name}</Td>
                      <Td>
                        <span
                          className={[
                            "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1",
                            r.transportation === true
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-slate-50 text-slate-600 ring-slate-200",
                          ].join(" ")}
                        >
                          {r.transportation ? "Yes" : "No"}
                        </span>
                      </Td>
                      <Td>{r.adult}</Td>
                      <Td>{r.child}</Td>

                      <Td className="whitespace-nowrap">
                        {new Date(r.bookingDate).toLocaleDateString("en-GB", {
                          timeZone: "Africa/Cairo",
                        })}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString("en-GB", {
                          timeZone: "Africa/Cairo",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                      <Td>
                        <button
                          onClick={() => openModal(r)}
                          className="px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                        >
                          See More
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal (light theme) */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-5xl rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Booking Details
                </h2>
                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                >
                  Close
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
                {/* Summary row */}
                <div className="mb-5 grid grid-cols-1 md:grid-cols-[180px,1fr,auto] gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Trip</p>
                    <p className="text-lg font-semibold text-sky-700">
                      {selectedBooking?.tripInfo?.name ?? "—"}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Booking Date:</span>{" "}
                      {selectedBooking?.bookingDate
                        ? new Date(
                            selectedBooking.bookingDate
                          ).toLocaleDateString("en-GB", {
                            timeZone: "Africa/Cairo",
                          })
                        : "—"}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Transportation:</span>{" "}
                      <span
                        className={
                          selectedBooking?.transportation
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }
                      >
                        {selectedBooking?.transportation ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Stat label="Adults" value={selectedBooking?.adult ?? "—"} />
                    <Stat
                      label="Children"
                      value={selectedBooking?.child ?? "—"}
                    />
                    <Stat
                      label="Paid"
                      value={selectedBooking?.payment ? "Yes" : "No"}
                    />
                    <Stat
                      label="Check In"
                      value={selectedBooking?.checkIn ? "Yes" : "No"}
                    />
                  </div>
                </div>

                {/* 3 equal-height cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch auto-rows-fr">
                  {/* User */}
                  <LightCard title="User Information">
                    <p>
                      <strong>Name:</strong>{" "}
                      {(selectedBooking?.user?.firstName ?? "—") +
                        " " +
                        (selectedBooking?.user?.lastName ?? "")}
                    </p>
                    <div className="flex items-center gap-2">
                      <strong>Email:</strong>
                      {selectedBooking?.user?.email ? (
                        <a
                          href={`mailto:${selectedBooking.user.email}`}
                          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-600 underline"
                          title="Send email"
                        >
                          <FaEnvelope />
                          {selectedBooking.user.email}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {selectedBooking?.user?.phone ?? "—"}
                    </p>
                    <p title={selectedBooking?.user?.message ?? ""} className="line-clamp-3">
                      <strong>Message:</strong>{" "}
                      {selectedBooking?.user?.message ?? "—"}
                    </p>
                  </LightCard>

                  {/* Trip */}
                  <LightCard title="Trip Information">
                    <p>
                      <strong>Trip Name:</strong>{" "}
                      {selectedBooking?.tripInfo?.name ?? "—"}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        <p className="font-semibold">Adult Price</p>
                        <ul className="text-sm mt-1 space-y-0.5">
                          <li>
                            EURO:{" "}
                            {selectedBooking?.tripInfo?.prices?.adult?.euro ??
                              "—"}{" "}
                            €
                          </li>
                          <li>
                            EGP:{" "}
                            {selectedBooking?.tripInfo?.prices?.adult?.egp ??
                              "—"}
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        <p className="font-semibold">Child Price</p>
                        <ul className="text-sm mt-1 space-y-0.5">
                          <li>
                            EURO:{" "}
                            {selectedBooking?.tripInfo?.prices?.child?.euro ??
                              "—"}{" "}
                            €
                          </li>
                          <li>
                            EGP:{" "}
                            {selectedBooking?.tripInfo?.prices?.child?.egp ??
                              "—"}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p>
                      <strong>Transportation:</strong>{" "}
                      {selectedBooking?.transportation ? "Yes" : "No"}
                    </p>
                  </LightCard>

                  {/* Booking */}
                  <LightCard title="Booking Info">
                    <p>
                      <strong>Adults:</strong>{" "}
                      {selectedBooking?.adult ?? "—"}
                    </p>
                    <p>
                      <strong>Children:</strong>{" "}
                      {selectedBooking?.child ?? "—"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold">Total (EURO)</p>
                        <p>{selectedBooking?.totalPrice?.euro ?? "—"} €</p>
                      </div>
                      <div>
                        <p className="font-semibold">Total (EGP)</p>
                        <p>{selectedBooking?.totalPrice?.egp ?? "—"}</p>
                      </div>
                    </div>
                    <p>
                      <strong>Created:</strong>{" "}
                      {selectedBooking?.createdAt
                        ? new Date(
                            selectedBooking.createdAt
                          ).toLocaleString("en-GB", {
                            timeZone: "Africa/Cairo",
                          })
                        : "—"}
                    </p>
                    <p>
                      <strong>Updated:</strong>{" "}
                      {selectedBooking?.updatedAt
                        ? new Date(
                            selectedBooking.updatedAt
                          ).toLocaleString("en-GB", {
                            timeZone: "Africa/Cairo",
                          })
                        : "—"}
                    </p>
                  </LightCard>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- components ---------------- */

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-4 align-middle ${className}`}>{children}</td>;
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-9 rounded-lg px-3 text-sm font-medium border",
        disabled
          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SelectMini({ value, onChange, options, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectLabeled({ value, onChange, options, label }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterChip({ label, active, onClear }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-600 ring-slate-200",
      ].join(" ")}
    >
      {label}
      {active && (
        <button
          onClick={onClear}
          className="rounded-md px-1.5 py-0.5 text-[10px] bg-white hover:bg-slate-50 border border-slate-200"
          title="Clear"
        >
          ×
        </button>
      )}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function LightCard({ title, children }) {
  return (
    <section className="h-full overflow-hidden rounded-2xl bg-white text-slate-800 ring-1 ring-slate-200 shadow-sm flex flex-col">
      <header className="px-4 pt-4">
        <h3 className="text-lg font-semibold text-sky-700">{title}</h3>
      </header>
      <div className="px-4 pb-4 pt-2 space-y-2 grow overflow-y-auto">
        {children}
      </div>
    </section>
  );
}
