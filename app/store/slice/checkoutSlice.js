import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  adult: 0,
  child: 0,
  transfer: false,
  payment: false,
  bookingDate: '',
  totalPrice: { egp: 0, euro: 0 },
  tripId: '',
  bookingDetails: false,
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
      state.bookingDetails = true
    },
    updateTotalPrice: (state, action) => {
      state.totalPrice = action.payload
    },
    updateBookingDate: (state, action) => {
      state.bookingDate = action.payload
    },
    clearState: (state) => {
      state.adult = 0
      state.child = 0
      state.transfer = false
      state.payment = false
      state.bookingDate = ''
      state.totalPrice = { egp: 0, euro: 0 }
      state.tripId = ''
      state.bookingDetails = false
    }
  },
})

export const { setBookingData, updateTotalPrice, updateBookingDate, clearState } = bookingSlice.actions

export default bookingSlice.reducer