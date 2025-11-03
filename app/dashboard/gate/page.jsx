"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import QrAutoScanner from "@/components/admin/QrAutoScanner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/helpers/token";
import { checkedInBooking, getBooking, paidBooking } from "../../../lib/apis/api";
import { BOOKING_ADMIN } from "@/paths";

// const url = "https://abudabbba-backend.vercel.app/api/bookings/admin"

export default function GatePage() {
  const [status, setStatus] = useState("Point the camera towards the QR code");
  const [error, setError] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [scanKey, setScanKey] = useState(0); // to re-mount scanner
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasResult = useMemo(() => !!decoded, [decoded]);
  const router = useRouter();

  const handleScanSuccess = useCallback((text) => {
    try {
      let bid = null;
      // try JSON first
      try {
        const obj = JSON.parse(String(text || ""));
        if (obj && obj.bid) bid = String(obj.bid);
      } catch (_) {}
      // fallback: extract 24-hex id from any string
      if (!bid) {
        const m = String(text || "").match(/[a-f\d]{24}/i);
        if (m) bid = m[0];
      }
      if (!bid) {
        setError("Invalid code: No booking ID found.");
        setStatus("");
        return;
      }
      setDecoded({ bid });
      setStatus("Scan successful");
      setError("");
    } catch (e) {
      setError("Error occurred while reading the code.");
      setStatus("");
    }
  }, []);

  const handleScanError = useCallback((err) => {
    const message = err?.message || String(err || "") || "";
    if (/NotAllowedError|Permission/i.test(message)) {
      setError(
        "Camera permission denied. Please allow camera access and reload the page."
      );
      setStatus("");
    }
  }, []);

  function handleRescan() {
    setDecoded(null);
    setError("");
    setStatus("Restarting scanner...");
    setScanKey((k) => k + 1); // Re-mount the scanner
    setTimeout(() => setStatus("Point the camera towards the QR code"), 300);
    setBooking(null); // Reset booking data
    router.replace("/dashboard/gate");
  }

  // Define the API requests for "Mark as Paid" and "Mark as Checked-in"
  const handleMarkAsPaid = async (id) => {

    try {
      // const response = await axios.patch(`https://abudabbba-backend.vercel.app/api/bookings/admin/${id}`, { payment: true });
      const response = await paidBooking(id)
      console.log(response.data);
      setBooking((prevBooking) => ({
        ...prevBooking,
        payment: true,
      })); // Update state to reflect the new payment status
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkAsCheckedIn = async (id) => {

    try {
      // const response = await axios.patch(`https://abudabbba-backend.vercel.app/api/bookings/admin/${id}`, { checkIn: true });
      const response = await checkedInBooking(id)
      console.log(response.data);
      setBooking((prevBooking) => ({
        ...prevBooking,
        checkIn: true,
      })); // Update state to reflect the new check-in status
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!decoded?.bid) return;
    let cancelled = false;
    async function fetchBooking() {

      setLoading(true);
      setError("");
      console.log(`${decoded.bid}`);
      try {
        const data = await getBooking(`${BOOKING_ADMIN}/${decoded.bid}`);

        if (!cancelled) setBooking(data.data);
      } catch (error) {
        if (!cancelled) setError("Failed to load booking details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBooking();
    return () => {
      cancelled = true;
    };
  }, [decoded]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#ffffff] to-[#e5edff] text-black"
    >
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-blue-500/90 flex items-center justify-center font-extrabold text-lg shadow-lg text-white">
            QR
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">Scan Gate</h1>
            <p className="text-gray-400 text-sm">
              Use the camera to scan visitor tickets
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner card */}
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="text-gray-300 font-semibold mb-3">Scanner</div>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div key={scanKey} className="w-full min-h-[350px] bg-black/30">
                <QrAutoScanner
                  onScanSuccess={(txt) => handleScanSuccess(txt)}
                  onScanError={(e) => handleScanError(e)}
                  fps={12}
                  qrBox={{ width: 280, height: 280 }}
                  aspectRatio={1}
                  cameraFacingMode="environment"
                  continuous={false} // Will stop after first successful scan
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-400 text-sm">{status}</span>
            </div>
            {error && (
              <div className="mt-2 text-red-400 font-semibold">{error}</div>
            )}
          </div>

          {/* Result card */}
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="text-gray-300 font-semibold mb-4">Result</div>
            {loading && (
              <div className="text-gray-400">Loading booking details…</div>
            )}
            {decoded && booking && !loading ? (
              <div className="space-y-4">
                {/* Booking ID */}
                <div className="text-xs text-gray-400">Booking ID</div>
                <div className="p-4 rounded-lg bg-gray-800/70 border border-white/10 break-all font-mono">
                  {decoded.bid}
                </div>

                {/* Trip Info */}
                <div className="text-xs text-gray-400">Trip Details</div>
                <div className="p-4 rounded-lg bg-gray-800/70 border border-white/10">
                  <div className="font-semibold">{booking.tripInfo.name}</div>
                </div>

                {/* User Info */}
                <div className="text-xs text-gray-400">User Information</div>
                <div className="p-4 rounded-lg bg-gray-800/70 border border-white/10">
                  <div className="font-semibold">
                    {booking.user.firstName} {booking.user.lastName}
                  </div>
                  <div className="text-sm">{booking.user.email}</div>
                  <div className="text-sm">{booking.user.phone}</div>
                  <div className="text-sm">{booking.user.message}</div>
                </div>

                {/* Price Info */}
                <div className="text-xs text-gray-400">Trip Details</div>
                <div className="p-4 rounded-lg bg-gray-800/70 border border-white/10">
                  <div className="font-semibold">Trip Details</div>
                  <div className="text-sm text-gray-400">
                    Adult Number: {booking.adult}
                  </div>
                  <div className="text-sm text-gray-400">
                    Child Number: {booking.child}
                  </div>
                  <hr />
                  <div className="text-sm text-gray-400">
                    Total Price: {booking.totalPrice.egp} EGP /{" "}
                    {booking.totalPrice.euro} EUR
                  </div>
                </div>

                {/* Check-in & Payment Info */}
                <div className="text-xs text-gray-400">Booking Status</div>
                <div className="p-4 rounded-lg bg-gray-800/70 border border-white/10">
                  <div className="font-semibold">Paid:</div>
                  <div className="text-sm text-gray-400">
                    {booking.payment ? "Yes" : "No"}
                    {!booking.payment && (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={() => handleMarkAsPaid(booking._id)}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                  <div className="font-semibold">Check-in:</div>
                  <div className="text-sm text-gray-400">
                    {booking.checkIn ? "Checked-in" : "Not Checked-in"}
                    {!booking.checkIn && (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={() => handleMarkAsCheckedIn(booking._id)}
                      >
                        Mark as Checked-in
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No result yet.</div>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-400 text-xs mt-6">
          Make sure there's good lighting and keep the QR code 15-25 cm away.
        </footer>
      </div>
    </div>
  );
}
