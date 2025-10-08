'use client'
import React from 'react'
import { Provider } from 'react-redux';
import store from '@/app/store/store';
const reduxTripsProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default reduxTripsProvider