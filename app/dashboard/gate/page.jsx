"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import QrAutoScanner from "@/components/admin/QrAutoScanner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/helpers/token";
import { checkedInBooking, getBooking, paidBooking } from "../../../lib/apis/api";
import { BOOKING_ADMIN } from "@/paths";


export default function GatePage() {
  const [status, setStatus] = useState("وجه الكاميرا نحو رمز الاستجابة السريعة QR");
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
        setError("رمز غير صالح: لم يتم العثور على رقم الحجز.");
        setStatus("");
        return;
      }
      setDecoded({ bid });
      setStatus("تم المسح بنجاح");
      setError("");
    } catch (e) {
      setError("حدث خطأ أثناء قراءة الرمز.");
      setStatus("");
    }
  }, []);

  const handleScanError = useCallback((err) => {
    const message = err?.message || String(err || "") || "";
    if (/NotAllowedError|Permission/i.test(message)) {
      setError(
        "تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا وإعادة تحميل الصفحة."
      );
      setStatus("");
    }
  }, []);

  function handleRescan() {
    setDecoded(null);
    setError("");
    setStatus("إعادة تشغيل الماسح الضوئي...");
    setScanKey((k) => k + 1); // Re-mount the scanner
    setTimeout(() => setStatus("وجه الكاميرا نحو رمز الاستجابة السريعة QR"), 300);
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
        if (!cancelled) setError("فشل تحميل تفاصيل الحجز.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBooking();
    return () => {
      cancelled = true;
    };
  }, [decoded]);
 const qrReplace =  ()=>{
    router.replace("/dashboard/gate");
 } 
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#ffffff] to-[#e5edff] text-black"
    >
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center gap-3 mb-6">
          <button onClick={qrReplace} className="cursor-pointer w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-extrabold text-lg shadow-lg text-white hover:shadow-xl transition-all duration-200">
            QR
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">بوابة المسح الضوئي</h1>
            <p className="text-gray-600 text-sm mt-1">
              استخدم الكاميرا لمسح تذاكر الزوار ضوئياً
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              الماسح الضوئي
            </div>
            <div className="rounded-xl overflow-hidden border-2 border-blue-200">
              <div key={scanKey} className="w-full min-h-[350px] bg-gray-100">
                <QrAutoScanner
                  onScanSuccess={(txt) => handleScanSuccess(txt)}
                  onScanError={(e) => handleScanError(e)}
                  fps={12}
                  qrBox={{ width: 280, height: 280 }}
                  aspectRatio={1.777}
                  cameraFacingMode="environment"
                  continuous={false} // Will stop after first successful scan
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600 text-sm font-medium">{status}</span>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">{error}</div>
            )}
          </div>

          {/* Result card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              النتيجة
            </div>
            {loading && (
              <div className="text-gray-600 flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري تحميل تفاصيل الحجز...
              </div>
            )}
            {decoded && booking && !loading ? (
              <div className="space-y-4">
                {/* Booking ID */}
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">رقم الحجز</div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 break-all font-mono text-sm text-gray-800">
                  {decoded.bid}
                </div>

                {/* Trip Info */}
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">تفاصيل الرحلة</div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="font-bold text-gray-800">{booking.tripInfo.name}</div>
                </div>

                {/* User Info */}
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">معلومات المستخدم</div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-gray-800">
                    {booking.user.firstName} {booking.user.lastName}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {booking.user.email}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {booking.user.phone}
                  </div>
                  {booking.user.message && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                      <span className="font-semibold">رسالة: </span>{booking.user.message}
                    </div>
                  )}
                </div>

                {/* Price Info */}
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">تفاصيل الحجز</div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">عدد البالغين:</span>
                    <span className="font-bold text-gray-800">{booking.adult}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">عدد الأطفال:</span>
                    <span className="font-bold text-gray-800">{booking.child}</span>
                  </div>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-sm font-semibold text-gray-700">السعر الإجمالي:</span>
                    <span className="font-bold text-blue-600">
                      {booking.totalPrice.egp} جنيه / {booking.totalPrice.euro} يورو
                    </span>
                  </div>
                </div>

                {/* Check-in & Payment Info */}
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">حالة الحجز</div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">الدفع:</span>
                    <div className="flex items-center gap-2">
                      {booking.payment ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          مدفوع
                        </span>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">غير مدفوع</span>
                          <button
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => handleMarkAsPaid(booking._id)}
                          >
                            تحديد كمدفوع
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">تسجيل الدخول:</span>
                    <div className="flex items-center gap-2">
                      {booking.checkIn ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          تم التسجيل
                        </span>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">لم يتم التسجيل</span>
                          <button
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => handleMarkAsCheckedIn(booking._id)}
                          >
                            تسجيل الدخول
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="font-medium">لا توجد نتائج حتى الآن</p>
                <p className="text-sm text-gray-400 mt-1">قم بمسح رمز QR لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-600 text-sm mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <svg className="w-5 h-5 inline-block ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          تأكد من وجود إضاءة جيدة وأبقِ رمز الاستجابة السريعة على بعد 15-25 سم من الكاميرا
        </footer>
      </div>
    </div>
  );
}
