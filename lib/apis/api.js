"use server";

import { cookies } from "@/node_modules/next/headers";
import { BOOKING, BOOKING_ADMIN, EXPORT, TRIPS_URL, WHOISME } from "@/paths";
import { logout } from "./authApi";
import axios from "axios";
import { redirect } from "next/navigation";

export async function getallTrips() {
  try {
    // Fetch trips data from the provided URL
    const res = await fetch(TRIPS_URL, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${token}`, // Uncomment if authorization is needed
        "Content-Type": "application/json",
      },
    });

    // Check if the request was successful
    if (!res.ok) {
      throw new Error(`Failed to fetch trips: ${res.statusText}`);
    }

    const data = await res.json();

    // Check for valid data response
    if (data && data.data) {
      return data.data;
    } else {
      throw new Error("Invalid data structure received");
    }
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw new Error("Error fetching trips. Please try again.");
  }
}

export async function getTrip(id) {
  // Simulate an API call
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  // console.log(url, token);

  try {
    const response = await fetch(`${TRIPS_URL}/${id}`, {
      method: "GET",
      headers: {
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
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function getadvancedTripInfo(url) {
  // Simulate an API call
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  console.log(url, token);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
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
    await logout();
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
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function getallBooking(params) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${BOOKING_ADMIN}?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    return { data };
  } catch (e) {
    await logout();
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
    await logout();
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
    await logout();
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
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function getallUsers(params) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${BOOKING_ADMIN}?${queryString}`, {
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
    await logout();
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
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function checkOut(payload) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(BOOKING, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return { data };
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function paidBooking(id) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(`${BOOKING_ADMIN}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment: true }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return { data };
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function checkedInBooking(id) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(`${BOOKING_ADMIN}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkIn: true }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return { data };
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function whoisme() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("access_token")?.value;

  // console.log(token)
  if (token == undefined) {
    return
  }
  try {
    const response = await fetch(WHOISME, {
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
    return data;
  } catch (e) {
    throw new Error(` "Failed to load"`);
  }
}

export async function getUsers(url) {
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
    return data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to load"}`);
  }
}

export async function registerUser(url, payload) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

export async function updateUser(url, payload) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

export async function deleteUser(url, id) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
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

export async function exportExsl(allBookings) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  const chunkSize = 1000; // Break the data into chunks of 1000 bookings
  let allData = [];

  try {
    // Function to process each chunk and handle the export
    const processChunk = async (chunk) => {
      const res = await axios.post(
        EXPORT,
        { bookings: chunk },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer", // ✅ important!
        }
      );

      if (res.status === 200) {
        allData.push(res.data);
      } else {
        throw new Error("Failed to export bookings");
      }
    };

    // Break the bookings into chunks and process them
    for (let i = 0; i < allBookings.length; i += chunkSize) {
      const chunk = allBookings.slice(i, i + chunkSize);
      await processChunk(chunk); // Process each chunk sequentially
    }

    // Combine all the chunked data (if necessary) and return the result
    const blob = new Blob(allData, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return {
      data: blob,
      headers: { "content-disposition": "attachment; filename=bookings.xlsx" },
    };
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Error exporting bookings");
  }
}

export async function direct() {
  redirect("/login");
}
