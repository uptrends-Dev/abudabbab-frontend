"use client";

import { useEffect, useState } from "react";
import { FaEnvelope, FaWhatsapp } from "react-icons/fa";

import { exportExsl, getallBooking, getallTrips } from "@/lib/apis/api";
import { TRIPS_URL } from "@/paths";


export default function BookingsPage() {
  const [trips, setTrips] = useState([])

  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("firstName");
  const [transferFilter, setTransferFilter] = useState("all");
  const [payment, setPaymentFilter] = useState("all");
  const [checkIn, setcheckInFilter] = useState("all");
  const [tripName, setTripNameFilter] = useState("");
  const [sort, setSort] = useState("desc"); // NEW: خلي الافتراضي desc
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [allBookings, setAllBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // filters
  const [dateMode, setDateMode] = useState("none"); // none | day | month | year | range | lastDays
  const [day, setDay] = useState(""); // YYYY-MM-DD
  const [month, setMonth] = useState(""); // YYYY-MM
  const [year, setYear] = useState(""); // YYYY
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD
  const [lastDays, setLastDays] = useState(""); // number

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
        // none
        break;
    }
    return p;
  };


  async function getTrips() {
    try {
      const trip = await getallTrips(TRIPS_URL)
      setTrips(trip)
      // console.log(trip)
    } catch (error) {
      console.log(error)
    }
  }
  // get trips for filter
  useEffect(() => {
    try {
      getTrips()
    } catch (error) {
      console.log(error)
    }
  }, []);
  // get all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // بناء الـ query string بناءً على كل الفلاتر (بما فيها التاريخ)
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
          ...buildDateParams(), // NEW
        };

        const response = await getallBooking(params)

        if (response.data.bookings?.length === 0 && page > 1) {
          // اختياري: لو الصفحة الحالية فاضية ارجع لأول صفحة
          setPage(1);
        }

        setAllBookings(response.data.bookings || []);
        setTotalBookings(response.data.totalBookings || 0);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
    // NEW: زودنا توابع التاريخ في الـ deps
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

  const totalPages = Math.max(1, Math.ceil(totalBookings / limit)); // اختياري: ما تنزلش عن 1

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





  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex gap-4  items-center">
          <button
            onClick={() => exportExsl(allBookings)}
            className=" cursor-pointer rounded-xl border border-neutral-800 bg-blue-800/90 font-bold px-3 py-2 text-sm text-neutral-300 hover:bg-blue-800/75 transition duration-200"
          >
            Export Excel
          </button>
          <h1 className="text-lg font-semibold tracking-wide">
            TOTAL BOOKINGS : {totalBookings}
          </h1>
        </div>
        {/* NEW — Date Filter */}
        <div className="flex items-center gap-2 mt-7">
          <span className="text-xs uppercase tracking-wide text-neutral-400">
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
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
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
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
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
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
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
              className="w-24 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
            />
          )}

          {dateMode === "range" && (
            <>
              <div className="">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    resetToFirst();
                  }}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
                  title="From (inclusive)"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    resetToFirst();
                  }}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
                  title="To (inclusive)"
                />
              </div>
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
              className="w-24 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
            />
          )}

          <button
            onClick={clearDateFilters}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800/60"
          >
            Clear
          </button>
        </div>
        {/* Controls (Redesigned) */}
        <div className=" top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
          {/* Primary Row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Left cluster: Search + Field */}
            <div className="flex items-center gap-2 w-full md:max-w-xl">
              <div className="relative flex-1">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    resetToFirst();
                  }}
                  placeholder={`search by ${searchField}`}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-10 py-2 text-sm placeholder-neutral-500 outline-none focus:ring-2 focus:ring-neutral-700"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 fill-neutral-500"
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
                  { value: "firstName", label: "name" },
                  { value: "phone", label: "phone" },
                  { value: "email", label: "email" },
                ]}
              />
            </div>

            {/* Right cluster: Pagination + Sort + Limit + Export */}
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
                <span className="text-sm text-neutral-400 whitespace-nowrap">
                  {page} / {totalPages}
                </span>
                <PageBtn
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </PageBtn>
              </div>

              {/* <button
                onClick={() => exportExsl(allBookings)}
                className="rounded-lg border border-neutral-800 bg-blue-600/90 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Export
              </button> */}
            </div>
          </div>

          {/* Quick chips row (reflect active filters) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-neutral-400">
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
              onClear={() => {
                clearDateFilters();
              }}
            />

            <span className="mx-2 h-5 w-px bg-neutral-800" />
            <button
              onClick={() => {
                // reset everything at once
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
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800/60"
            >
              Reset all
            </button>

            {/* Toggle more filters */}
            <details className="ml-auto group">
              <summary className="list-none inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800/60 cursor-pointer">
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

              {/* Advanced row */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Transfer */}
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
                {/* Payment */}
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
                {/* CheckIn */}
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
                {/* Trip */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wide text-neutral-400">
                    Trip
                  </label>
                  <select
                    value={tripName}
                    onChange={(e) => {
                      setTripNameFilter(e.target.value);
                      resetToFirst();
                    }}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
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
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-900/50 text-neutral-400">
                <tr>
                  <Th>User name</Th>
                  <Th>phone</Th>
                  <Th>Trip name</Th>
                  <Th>transfer</Th>
                  <Th>Adult num</Th>
                  <Th>child num</Th>
                  <Th>booking date</Th>
                  <Th>Created At</Th>
                  <Th>more info</Th>
                </tr>
              </thead>
              <tbody>
                {allBookings?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-6 text-center text-neutral-400"
                    >
                      No results.
                    </td>
                  </tr>
                ) : (
                  allBookings?.map((r) => (
                    <tr
                      key={r._id}
                      className="border-t border-neutral-800 hover:bg-neutral-900/40"
                    >
                      <Td>{r.user.firstName}</Td>
                      <Td className="whitespace-nowrap flex items-center gap-2">
                        <a
                          href={`https://wa.me/${"+20" + r.user.phone.replace(/\D/g, "")
                            }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp />
                        </a>
                        {r.user.phone}
                      </Td>
                      <Td>{r?.tripInfo?.name}</Td>
                      <Td>
                        <span
                          className={[
                            "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                            r.transportation === true
                              ? "bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-700/40"
                              : "bg-neutral-700/30 text-neutral-300 ring-1 ring-neutral-700/50",
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
                      <Td className="px-4 py-4">
                        <button
                          onClick={() => openModal(r)}
                          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
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

        {/* Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-5xl rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl ring-1 ring-white/10 overflow-hidden"
            >
              {/* Header ثابت */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Booking Details
                </h2>
                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-red-600 hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                >
                  Close
                </button>
              </div>

              {/* جسم المودال مع أقصى ارتفاع + Scroll عام لو المحتوى كتير */}
              <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
                {/* Grid أنضف + نفس الارتفاع للكروت */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch auto-rows-fr">
                  {/* ===== Card 1: User Information ===== */}
                  <section className="h-full overflow-hidden rounded-2xl bg-white/80 text-neutral-900 ring-1 ring-black/5 shadow-sm flex flex-col">
                    <header className="px-4 pt-4">
                      <h3 className="text-lg font-semibold text-[#003cff]">
                        User Information
                      </h3>
                    </header>
                    {/* جزء المحتوى بيتمدّد ويعمل Scroll لو زاد */}
                    <div className="px-4 pb-4 pt-2 space-y-2 grow overflow-y-auto">
                      <p>
                        <strong>Name:</strong> {selectedBooking.user.firstName}{" "}
                        {selectedBooking.user.lastName}
                      </p>

                      <div className="flex items-center gap-2">
                        <strong>Email:</strong>
                        <a
                          href={`mailto:${selectedBooking.user.email}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500"
                          title="Send email"
                        >
                          <FaEnvelope />
                          <span className="underline">
                            {selectedBooking.user.email}
                          </span>
                        </a>
                      </div>

                      <p>
                        <strong>Phone:</strong> {selectedBooking.user.phone}
                      </p>

                      {/* اقصى 3 سطور علشان ما يطوّلاش الكارت */}
                      <p
                        title={selectedBooking.user.message}
                        className="line-clamp-3"
                      >
                        <strong>Message:</strong> {selectedBooking.user.message}
                      </p>
                    </div>
                  </section>

                  {/* ===== Card 2: Trip Information ===== */}
                  <section className="h-full overflow-hidden rounded-2xl bg-white/80 text-neutral-900 ring-1 ring-black/5 shadow-sm flex flex-col">
                    <header className="px-4 pt-4">
                      <h3 className="text-lg font-semibold text-[#003cff]">
                        Trip Information
                      </h3>
                    </header>
                    <div className="px-4 pb-4 pt-2 space-y-3 grow overflow-y-auto">
                      <p>
                        <strong>Trip Name:</strong>{" "}
                        {selectedBooking.tripInfo?.name}
                      </p>

                      <p>
                        <strong>Booking Date:</strong>{" "}
                        {new Date(
                          selectedBooking.bookingDate
                        ).toLocaleDateString("en-GB", {
                          timeZone: "Africa/Cairo",
                        })}
                      </p>

                      {/* أسعار مرتبة في عمودين */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
                          <p className="font-semibold">Adult Price</p>
                          <ul className="text-sm mt-1 space-y-0.5">
                            <li>
                              EURO:{" "}
                              {selectedBooking?.tripInfo?.prices?.adult?.euro} €
                            </li>
                            <li>
                              EGP:{" "}
                              {selectedBooking?.tripInfo?.prices?.adult?.egp}
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
                          <p className="font-semibold">Child Price</p>
                          <ul className="text-sm mt-1 space-y-0.5">
                            <li>
                              EURO:{" "}
                              {selectedBooking?.tripInfo?.prices?.child?.euro} €
                            </li>
                            <li>
                              EGP:{" "}
                              {selectedBooking?.tripInfo?.prices?.child?.egp}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <p>
                        <strong>Transportation:</strong>{" "}
                        {selectedBooking.transportation ? "Yes" : "No"}
                      </p>
                    </div>
                  </section>

                  {/* ===== Card 3: Booking Info ===== */}
                  <section className="h-full overflow-hidden rounded-2xl bg-white/80 text-neutral-900 ring-1 ring-black/5 shadow-sm flex flex-col">
                    <header className="px-4 pt-4">
                      <h3 className="text-lg font-semibold text-[#003cff]">
                        Booking Info
                      </h3>
                    </header>
                    <div className="px-4 pb-4 pt-2 space-y-2 grow overflow-y-auto">
                      <p>
                        <strong>Trip Name:</strong>{" "}
                        {selectedBooking.tripInfo?.name}
                      </p>
                      <p>
                        <strong>Booking Date:</strong>{" "}
                        {new Date(
                          selectedBooking.bookingDate
                        ).toLocaleDateString("en-GB", {
                          timeZone: "Africa/Cairo",
                        })}
                      </p>
                      <p>
                        <strong>Transportation:</strong>{" "}
                        {selectedBooking.transportation ? "Yes" : "No"}
                      </p>
                      {/* لو حابب تضيف أي ملاحظات/Status هنا */}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-5xl rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl ring-1 ring-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Booking Details
                </h2>
                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-red-600 hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                >
                  Close
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
                {/* Summary Row */}
                <div className="mb-5 grid grid-cols-1 md:grid-cols-[160px,1fr,auto] gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-300">Trip</p>
                    <p className="text-lg font-semibold text-indigo-400">
                      {selectedBooking?.tripInfo?.name ?? "—"}
                    </p>
                    <p className="text-sm">
                      <span className="text-neutral-300">Booking Date:</span>{" "}
                      {selectedBooking?.bookingDate
                        ? new Date(
                          selectedBooking.bookingDate
                        ).toLocaleDateString("en-GB", {
                          timeZone: "Africa/Cairo",
                        })
                        : "—"}
                    </p>
                    <p className="text-sm">
                      <span className="text-neutral-300">Transportation:</span>{" "}
                      <span
                        className={
                          selectedBooking?.transportation
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {selectedBooking?.transportation ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>

                  {/* Booking Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                      <p className="text-xs text-neutral-300">Adults</p>
                      <p className="text-base font-semibold text-blue-400">
                        {selectedBooking?.adult ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                      <p className="text-xs text-neutral-300">Children</p>
                      <p className="text-base font-semibold text-pink-400">
                        {selectedBooking?.child ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                      <p className="text-xs text-neutral-300">Paid</p>
                      <p className="text-base font-semibold text-green-500">
                        {selectedBooking?.payment ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                      <p className="text-xs text-neutral-300">Check In</p>
                      <p className="text-base font-semibold text-yellow-500">
                        {selectedBooking?.checkIn ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Cards grid with equal height */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch auto-rows-fr">
                  {/* User Information */}
                  <section className="h-full overflow-hidden rounded-2xl bg-white/10 text-gray-300 ring-1 ring-black/5 shadow-sm flex flex-col">
                    <header className="px-4 pt-4 bg-gradient-to-r from-green-500 to-teal-400 text-white">
                      <h3 className="text-lg font-semibold">
                        User Information
                      </h3>
                    </header>
                    <div className="px-4 pb-4 pt-2 space-y-2 grow overflow-y-auto">
                      <p>
                        <strong className="text-blue-500">Name:</strong>{" "}
                        {(selectedBooking?.user?.firstName ?? "—") +
                          " " +
                          (selectedBooking?.user?.lastName ?? "")}
                      </p>

                      <div className="flex items-center gap-2">
                        <strong className="text-blue-500">Email:</strong>
                        {selectedBooking?.user?.email ? (
                          <a
                            href={`mailto:${selectedBooking.user.email}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 underline"
                            title="Send email"
                          >
                            {selectedBooking.user.email}
                          </a>
                        ) : (
                          <span>—</span>
                        )}
                      </div>

                      <p>
                        <strong className="text-blue-500">Phone:</strong>{" "}
                        {selectedBooking?.user?.phone ?? "—"}
                      </p>

                      <p
                        title={selectedBooking?.user?.message ?? ""}
                        className="line-clamp-3"
                      >
                        <strong className="text-blue-500">Message:</strong>{" "}
                        {selectedBooking?.user?.message ?? "—"}
                      </p>
                    </div>
                  </section>

                  {/* Trip Information */}
                  <section className="h-full overflow-hidden rounded-2xl bg-white/10 text-gray-300 ring-1 ring-black/5 shadow-sm flex flex-col">
                    <header className="px-4 pt-4 bg-gradient-to-r from-yellow-500 to-orange-400 text-white">
                      <h3 className="text-lg font-semibold">
                        Trip Information
                      </h3>
                    </header>
                    <div className="px-4 pb-4 pt-2 space-y-3 grow overflow-y-auto">
                      <p>
                        <strong className="text-yellow-400">Trip Name:</strong>{" "}
                        {selectedBooking?.tripInfo?.name ?? "—"}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/10 p-3 ring-1 ring-black/5">
                          <p className="font-semibold text-green-400">
                            Adult Price
                          </p>
                          <ul className="text-sm mt-1 space-y-0.5">
                            <li className="text-green-500">
                              EURO:{" "}
                              {selectedBooking?.tripInfo?.prices?.adult?.euro ??
                                "—"}{" "}
                              €
                            </li>
                            <li className="text-green-500">
                              EGP:{" "}
                              {selectedBooking?.tripInfo?.prices?.adult?.egp ??
                                "—"}
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-xl bg-white/10 p-3 ring-1 ring-black/5">
                          <p className="font-semibold text-pink-400">
                            Child Price
                          </p>
                          <ul className="text-sm mt-1 space-y-0.5">
                            <li className="text-pink-500">
                              EURO:{" "}
                              {selectedBooking?.tripInfo?.prices?.child?.euro ??
                                "—"}{" "}
                              €
                            </li>
                            <li className="text-pink-500">
                              EGP:{" "}
                              {selectedBooking?.tripInfo?.prices?.child?.egp ??
                                "—"}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <p>
                        <strong className="text-yellow-500">
                          Transportation:
                        </strong>{" "}
                        {selectedBooking?.transportation ? "Yes" : "No"}
                      </p>
                    </div>
                  </section>

                  {/* Booking Info */}
                  <section className="h-full overflow-hidden rounded-2xl bg-white/10 text-gray-300 ring-1 ring-black/5 shadow-sm flex flex-col">
                    <header className="px-4 pt-4 bg-gradient-to-r from-pink-500 to-red-400 text-white">
                      <h3 className="text-lg font-semibold">Booking Info</h3>
                    </header>
                    <div className="px-4 pb-4 pt-2 space-y-2 grow overflow-y-auto">
                      <p>
                        <strong className="text-pink-500">Adults:</strong>{" "}
                        {selectedBooking?.adult ?? "—"}
                      </p>
                      <p>
                        <strong className="text-pink-500">Children:</strong>{" "}
                        {selectedBooking?.child ?? "—"}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-semibold text-red-400">
                            Total (EURO)
                          </p>
                          <p>{selectedBooking?.totalPrice?.euro ?? "—"} €</p>
                        </div>
                        <div>
                          <p className="font-semibold text-red-400">
                            Total (EGP)
                          </p>
                          <p>{selectedBooking?.totalPrice?.egp ?? "—"}</p>
                        </div>
                      </div>
                      <p>
                        <strong className="text-red-400">Created:</strong>{" "}
                        {selectedBooking?.createdAt
                          ? new Date(selectedBooking.createdAt).toLocaleString(
                            "en-GB",
                            { timeZone: "Africa/Cairo" }
                          )
                          : "—"}
                      </p>
                      <p>
                        <strong className="text-red-400">Updated:</strong>{" "}
                        {selectedBooking?.updatedAt
                          ? new Date(selectedBooking.updatedAt).toLocaleString(
                            "en-GB",
                            { timeZone: "Africa/Cairo" }
                          )
                          : "—"}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



// ------------------------- bulider functions

function tripFilter() {
  trips.map((e) => {
    console.log(e.name);
    return ` <option value="${e?.name}">${e?.name}</option>`;
  });
}

const ExportToExcel = async () => {
  try {
    const arrayBuffer = await exportExsl(allBookings);
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download =
      res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
      "bookings.xlsx";
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export error:", error);
  }
};





// ------------------------- bulider components
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
        "h-9 rounded-lg px-3 text-sm font-medium",
        disabled
          ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
          : "bg-[#1c4521b3] text-gray-200 border-[#32c800] border-1 hover:bg-[#1c4521cc]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
function SelectMini({ value, onChange, options, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300 focus:ring-2 focus:ring-neutral-700"
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
      <label className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-700"
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
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
        active
          ? "bg-emerald-600/15 text-emerald-300 ring-1 ring-emerald-700/40"
          : "bg-neutral-800/60 text-neutral-300 ring-1 ring-neutral-700/50",
      ].join(" ")}
    >
      {label}
      {active && (
        <button
          onClick={onClear}
          className="rounded-md px-1.5 py-0.5 text-[10px] bg-neutral-900/70 hover:bg-neutral-800/70"
          title="Clear"
        >
          ×
        </button>
      )}
    </span>
  );
}