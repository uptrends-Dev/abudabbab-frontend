"use client"
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getallTrips } from "./api";

// GET all trips
export const fetchTripsData = createAsyncThunk(
  "trips/fetchTripsData",
  async () => {
    const response = await getallTrips()
    console.log(response)
    return response;
  }
);