// get all trips
// post trip
// update trip
// delete trip
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { fetchTripsData, postTrip, updateTrip, deleteTrip, fetchAdvancedTripsInfos } from '../../../lib/apis/tripsApi'

const initialState = {
  trips: [],
  advancedTripsInfos: [],
  loading: false,
  advancedLoading: false,
  error: null,
  advancedError: null,
};

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    // Manually set entire trips array (e.g. after direct API fetch)
    setTrips: (state, action) => {
      state.trips = Array.isArray(action.payload) ? action.payload : [];
    },
    // Upsert a single trip (add if missing, replace if exists)
    upsertTrip: (state, action) => {
      const trip = action.payload;
      if (!trip || !trip._id) return;
      const idx = state.trips.findIndex((t) => t._id === trip._id);
      if (idx >= 0) {
        state.trips[idx] = { ...state.trips[idx], ...trip };
      } else {
        state.trips.push(trip);
      }
    },
    // Clear trips (optional utility)
    clearTrips: (state) => {
      state.trips = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // GET trips via thunk
      .addCase(fetchTripsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTripsData.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTripsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setTrips, upsertTrip, clearTrips } = tripsSlice.actions;
export default tripsSlice.reducer;

// update usage in component
// dispatch(
//   updateTrip({
//     url: "http://localhost:5000/api/trips",
//     id: "12345",
//     tripData: {
//       name: "Summer Trip",
//       destination: "Rome",
//       date: "2025-09-25"
//     }
//   })
// );

// post usage example
// const handleCreateTrip = () => {
//   dispatch(
//     postTrip({
//       url: "http://localhost:5000/api/trips",
//       tripData: {
//         name: "Winter Vacation",
//         destination: "Istanbul",
//         date: "2025-12-20"
//       }
//     })
//   );
// };

// delete usage
// const handleDelete = (id) => {
//   dispatch(
//     deleteTrip({
//       url: "http://localhost:5000/api/trips",
//       id,
//     })
//   );
// };