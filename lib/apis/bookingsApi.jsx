import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { checkOut } from "./api";

// GET all bookings
export const getAllBookings = createAsyncThunk(
  "bookings/getAllBookings",
  async (url) => {
    const response = await axios.get(url);
    // console.log(response.data)
    return response;
  }
);

// POST booking
export const postBooking = createAsyncThunk(
  "bookings/postBooking",
  async ({ url }, { getState, rejectWithValue }) => {
    try {
      const s = getState();
      const b = s.bookings || s.booking;

      const raw =
        b?.bookingDetails?.bookingDate || b?.bookingDetails?.date || "";
      const bookingDate = raw
        ? new Date(`${raw}T14:00:00.000Z`).toISOString()
        : undefined;

      // ✅ مطابق للاسكيما
      const payload = {
        tripInfo: String(b.tripId),
        adult: Math.max(1, Number(b?.bookingDetails?.adult ?? 1)),
        child: Math.max(0, Number(b?.bookingDetails?.child ?? 0)),
        totalPrice: {
          egp: Number(b?.bookingDetails?.totalPrice?.egp ?? 0),
          euro: Number(b?.bookingDetails?.totalPrice?.euro ?? 0),
        },
        transportation: Boolean(b?.bookingDetails?.transfer),
        user: {
          firstName: b?.userInfo?.firstName || "",
          lastName: b?.userInfo?.lastName || "",
          email: b?.userInfo?.email || "",
          phone: b?.userInfo?.phone || "",
          message: b?.userInfo?.message || "",
        },
        payment: Boolean(b?.bookingDetails?.payment ?? false),
        checkIn: Boolean(b?.bookingDetails?.checkIn ?? false),
        ...(bookingDate ? { bookingDate } : {}),
      };

      const res = await checkOut(payload);

      // ✅ لو الباك بيرجع أي شكل (doc مباشرة / data / booking ...)
      const created =
        res.data?.data ?? res.data?.booking ?? res.data?.result ?? res.data; // آخر حل: رجّع الرد كله

      return created;
    } catch (err) {
      const server = err.response?.data || err.message || "Unknown error";
      return rejectWithValue(server);
    }
  }
);

// GET advancedTripInfo
export const getAdvancedTripInfo = createAsyncThunk(
  "bookings/getAdvancedTripInfo",
  async (url, { rejectWithValue }) => {
    try {
      const res = await axios.get(url);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// GET getTotalBookingsAndRevenue
export const getTotalBookingsAndRevenue = createAsyncThunk(
  "bookings/getTotalBookingsAndRevenue",
  async (url, { rejectWithValue }) => {
    try {
      const res = await axios.get(url);
      return res.data; // { totalBookings, totalRevenue, ... }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


export async function exportExsl(allBookings) {

  // const plainBookings = allBookings.map((b) => ({
  //   _id: b._id,
  //   user: {
  //     firstName: b.user?.firstName,
  //     phone: b.user?.phone,
  //   },
  //   tripInfo: b.tripInfo ? { name: b.tripInfo.name } : undefined,
  //   transportation: b.transportation,
  //   bookingDate: b.bookingDate,
  //   createdAt: b.createdAt,
  // }));

  try {
    const res = await axios.post(
      "https://abudabbba-backend.vercel.app/api/bookings/export",
      { bookings: allBookings },
      {
        headers: { "Content-Type": "application/json" },
        responseType: "arraybuffer", // ✅ important!
      }
    );

    if (res.status !== 200) {
      throw new Error("Failed to export bookings");
    }

    // res.data is already an ArrayBuffer
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      res.headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] ??
      "bookings.xlsx";
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export error:", error);
  }
}