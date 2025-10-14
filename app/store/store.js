import { configureStore } from '@reduxjs/toolkit'
import checkoutReducer from './slice/checkoutSlice'
import tripsReducer from './slice/tripsSlices'  // Import your trips slice here
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  checkout: checkoutReducer,
  trips: tripsReducer,  // Add trips reducer to the rootReducer
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['checkout', 'trips'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)