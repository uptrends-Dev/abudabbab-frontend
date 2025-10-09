"use server";

import axios from "@/node_modules/axios/index";
import { cookies } from "@/node_modules/next/headers";

// const cookieStore = cookies();
// if (!cookieStore) console.log("cookie")
// const token = (await cookieStore).get("access_token")?.value;

export async function getallTrips(url) {
  const cookieStore = cookies();
  if (!cookieStore) console.log("cookie");
  const token = (await cookieStore).get("access_token")?.value;

  console.log(url, token)

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data)

    return data.data;
  } catch (error) {
    console.log(error);
    return "error ee";
  }
}

export async function getadvancedTripInfo(url) {
  // Simulate an API call
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Accept: "text/plain",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // next: { revalidate: 5 },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data:", data.data);

    return data.data;
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function getTotalInfo(url) {
  // Simulate an API call
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  // const BACKEND_URL = process.env.BACKEND_URL; // or NEXT_PUBLIC_BACKEND_URL if used in the browser
  // if (!BACKEND_URL) {
  //   throw new Error("Missing BACKEND_URL in environment");
  // }
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 5 },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data:", data);

    return data;
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function getallBooking(params) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(
      `https://abudabbba-backend.vercel.app/api/bookings/admin?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    return { data };
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function deleletrip(props) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  const fullUrl = `${props.url}/${props.id}`;
  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    // return {data};
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}
export async function updatetrip(props) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  const fullUrl = `${props.url}/${props.id}`;
  try {
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(props.tripData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const updated =
      data.data?.data ?? data.data?.trip ?? data.data?.result ?? data.data;
    console.log(updated);

    return updated;
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}
export async function posttrip(props) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  const fullUrl = `${props.url}`;
  console.log(props.tripData);
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(props.tripData),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.message}`
      );
    }

    const data = await response.json();
    console.log(data);

    // return updated;
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function getallUsers(params) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `https://abudabbba-backend.vercel.app/api/bookings/admin?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return { data };
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}


export async function getBooking(url) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return { data };
  } catch (e) {
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}