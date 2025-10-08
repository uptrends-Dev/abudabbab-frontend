// get all trips
// post trip
// update trip
// delete trip
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { fetchTripsData, postTrip, updateTrip, deleteTrip, fetchAdvancedTripsInfos } from '../../lib/apis/tripsApi'

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
  reducers: {},
  extraReducers: (builder) => {
    builder

      // GET trip
      .addCase(fetchTripsData.pending, (state) => {
        state.loading = true; //
      })
      .addCase(fetchTripsData.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTripsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // POST trip
      .addCase(postTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(postTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.push(action.payload);
      })
      .addCase(postTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // UPDATE trip
      .addCase(updateTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload; // { id, ...fields }
        const idx = state.trips.findIndex(
          (t) => t.id === updated.id || t._id === updated._id
        );
        if (idx !== -1) {
          state.trips[idx] = { ...state.trips[idx], ...updated };
        } else {
          state.trips.push(updated); // optional fallback
        }
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // DELETE trip
      .addCase(deleteTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = state.trips.filter(
          (t) => t.id !== action.payload && t._id !== action.payload
        );
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // GET advanced trips infos
      .addCase(fetchAdvancedTripsInfos.pending, (state) => {
        state.advancedLoading = true;
        state.advancedError = null;
      })
      .addCase(fetchAdvancedTripsInfos.fulfilled, (state, action) => {
        state.advancedLoading = false;
        state.advancedTripsInfos = action.payload;
      })
      .addCase(fetchAdvancedTripsInfos.rejected, (state, action) => {
        state.advancedLoading = false;
        state.advancedError = action.error.message;
      });
  },
});

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