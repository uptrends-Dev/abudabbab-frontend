import { configureStore } from '@reduxjs/toolkit';
import tripsReducer from './tripsSlices'; // اسم الملف مفضّل يكون مفرد
import bookingReducer from './bookingSlice'; // اسم الملف مفضّل يكون مفرد

// Safely read persisted bookings from localStorage (client-side only)
function loadPersistedBookings() {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem('abudabbab:bookings');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {
    // ignore
  }
  return undefined;
}

const preloadedBookingsState = loadPersistedBookings();

// Minimal safe defaults for the bookings slice to avoid undefined fields
const defaultBookingsState = {
  list: {},
  advancedInfo: [],
  totals: {
    totalBookings: '',
    totalTickets: '',
    totalEgp: '',
    totalEuro: '',
  },
  tripId: null,
  trip: null,
  userInfo: {},
  bookingDetails: {},
  loading: false,
  error: null,
  advancedLoading: false,
  advancedError: null,
  totalsLoading: false,
  totalsError: null,
  postLoading: false,
  postError: null,
  lastCreatedBooking: null,
};

const tripsStore = configureStore({
  reducer: {
    trips: tripsReducer,
    bookings: bookingReducer,
  },
  // Preload the bookings slice if available, merged with safe defaults
  preloadedState: preloadedBookingsState
    ? { bookings: { ...defaultBookingsState, ...preloadedBookingsState } }
    : undefined,
});

// Persist bookings slice on any change (client-side only)
if (typeof window !== 'undefined') {
  tripsStore.subscribe(() => {
    try {
      const state = tripsStore.getState();
      // Persist the entire bookings state
      const dataToPersist = state?.bookings ?? {};
      window.localStorage.setItem(
        'abudabbab:bookings',
        JSON.stringify(dataToPersist)
      );
    } catch (_) {
      // ignore storage errors
    }
  });
}

export default tripsStore;
