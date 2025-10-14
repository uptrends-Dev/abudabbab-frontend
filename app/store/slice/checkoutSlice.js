import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  adult: 0,
  child: 0,
  transfer: false,
  payment: false,
  bookingDate: '',
  totalPrice: { egp: 0, euro: 0 },
  tripId: '',
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingData: (state, action) => {
      state.adult = action.payload.adult
      state.child = action.payload.child
      state.transfer = action.payload.transfer
      state.payment = action.payload.payment
      state.bookingDate = action.payload.bookingDate
      state.totalPrice = action.payload.totalPrice
      state.tripId = action.payload.tripId
    },
    updateTotalPrice: (state, action) => {
      state.totalPrice = action.payload
    },
    updateBookingDate: (state, action) => {
      state.bookingDate = action.payload
    },
  },
})

export const { setBookingData, updateTotalPrice, updateBookingDate } = bookingSlice.actions

export default bookingSlice.reducer