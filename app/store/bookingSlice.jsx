// GET  all bookings
// POST booking
// GET  advancedTripInfo
// GET  getTotalBookingsAndRevenue
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { getAllBookings, postBooking, getAdvancedTripInfo, getTotalBookingsAndRevenue } from '../../lib/apis/bookingsApi'
// ============ Thunks ============


// ============ Initial State ============

const initialState = {
  // قوائم
  list: {},            // كل الحجوزات (لو هتستخدمها)
  advancedInfo: [],    // نتايج advancedTripsInfos (لكل رحلة)
  totals: {            // إجماليات عامة
    totalBookings: "",
    totalTickets: "",
    totalEgp: "",
    totalEuro: "",
  },

  // فورم الحجز (اختياري)
  tripId: null,
  trip: null,
  userInfo: {},
  bookingDetails: {},

  // حالات تحميل/أخطاء
  loading: false,
  error: null,
  advancedLoading: false,
  advancedError: null,
  totalsLoading: false,
  totalsError: null,

  // POST
  postLoading: false,
  postError: null,
  lastCreatedBooking: null,
};

// ============ Slice ============

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setTripId: (state, action) => {
      state.tripId = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
    setBookingDetails: (state, action) => {
      // Normalize date field and allow trip/tripId pass-through
      const { trip, tripId, date, bookingDate, ...rest } = action.payload || {};
      state.bookingDetails = {
        ...state.bookingDetails,
        ...rest,
        bookingDate: bookingDate ?? date ?? state.bookingDetails.bookingDate,
      };
      if (trip) state.trip = trip;
      if (tripId) state.tripId = tripId;
    },
    clearBookingState: (state) => {
      state.tripId = null;
      state.trip = null;
      state.userInfo = initialState.userInfo;
      state.bookingDetails = initialState.bookingDetails;
      state.lastCreatedBooking = null;
      state.postError = null;
      state.postLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET all bookings
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // POST booking
      .addCase(postBooking.pending, (state) => {
        state.postLoading = true;
        state.postError = null;
      })
      .addCase(postBooking.fulfilled, (state, action) => {
        state.postLoading = false;
        state.lastCreatedBooking = action.payload;
        state.list = Array.isArray(state.list)
          ? [action.payload, ...state.list]
          : [action.payload];
        // optional reset
        state.tripId = null;
        state.userInfo = initialState.userInfo;
        state.bookingDetails = initialState.bookingDetails;
      })
      .addCase(postBooking.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload || action.error.message;
      })


      // AdvancedTripInfo
      .addCase(getAdvancedTripInfo.pending, (state) => {
        state.advancedLoading = true; state.advancedError = null;
      })
      .addCase(getAdvancedTripInfo.fulfilled, (state, action) => {
        state.advancedLoading = false;
        state.advancedInfo = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAdvancedTripInfo.rejected, (state, action) => {
        state.advancedLoading = false; state.advancedError = action.payload || action.error.message;
      })


      // Totals
      .addCase(getTotalBookingsAndRevenue.pending, (state) => {
        state.totalsLoading = true; state.totalsError = null;
      })
      .addCase(getTotalBookingsAndRevenue.fulfilled, (state, action) => {
        state.totalsLoading = false;
        state.totals = {
          totalBookings: Number(action.payload?.totalBookings ?? 0),
          totalTickets: Number(action.payload?.totalTickets ?? 0),
          totalEgp: Number(action.payload?.totalEgp ?? 0),
          totalEuro: Number(action.payload?.totalEuro ?? 0),
        };
      })
      .addCase(getTotalBookingsAndRevenue.rejected, (state, action) => {
        state.totalsLoading = false; state.totalsError = action.payload || action.error.message;
      });
  },
});

export default bookingSlice.reducer;
export const { setTripId, setUserInfo, setBookingDetails, clearBookingState } =
  bookingSlice.actions;
