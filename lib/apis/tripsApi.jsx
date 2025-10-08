"use client"
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../helpers/token";
import { getTrips } from "./api";
// GET all trips
export const fetchTripsData = createAsyncThunk(
  "trips/fetchTripsData",
  async (url) => {
    
    // const response = await axios.get(url);
    const response = await getTrips(url)
    // console.log(response)
    return response.data;
  }
);
// POST trip
export const postTrip = createAsyncThunk(
  "trips/postTrip",
  async ({ url, tripData }) => {
    const response = await axios.post(url, tripData);
    return response.data.data; // return the created trip
  }
);
// update trip
export const updateTrip = createAsyncThunk(
  "trips/updateTrip",
  async ({ url, id, tripData }) => {
    try {
      const fullUrl = `${url}/${id}`;
      const response = await axios.put(fullUrl, tripData); // always PUT
      const updated =
        response.data?.data ??
        response.data?.trip ??
        response.data?.result ??
        response.data;
      return updated;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Update failed";
      return rejectWithValue(msg);
    }

  }
);
// delete trip
export const deleteTrip = createAsyncThunk(
  "trips/deleteTrip",
  async ({ url, id }) => {
    const fullUrl = `${url}/${id}`;
    await axios.delete(fullUrl);
    return id; // return the deleted trip id so we can remove it from state
  }
);

// GET advanced trips infos
export const fetchAdvancedTripsInfos = createAsyncThunk(
  "trips/fetchAdvancedTripsInfos",
  async (url) => {
    const response = await axios.get(url);
    return response.data.data;
  }
);
