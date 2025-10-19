"use server";

import { cookies } from "@/node_modules/next/headers";
import { COUPONS_URL, COUPONS_ADMIN } from "@/paths";
import { logout } from "./authApi";

// Coupon schema validation
const validateCouponSchema = (couponData) => {
  const errors = [];

  if (!couponData.code || typeof couponData.code !== "string") {
    errors.push("Code is required and must be a string");
  }

  if (!couponData.type || !["amount", "percent"].includes(couponData.type)) {
    errors.push('Type is required and must be either "amount" or "percentage"');
  }

  if (!couponData.discount) {
    errors.push("Discount is required");
  } else {
    if (couponData.type === "amount") {
      if (!couponData.discount.egp || !couponData.discount.euro) {
        errors.push(
          "For amount type, both EGP and Euro discount values are required"
        );
      }
      if (
        typeof couponData.discount.egp !== "number" ||
        typeof couponData.discount.euro !== "number"
      ) {
        errors.push("Discount values must be numbers");
      }
    } else if (couponData.type === "percent") {
      if (
        typeof couponData.discount.percent !== "number" ||
        couponData.discount.percent < 0 ||
        couponData.discount.percent > 100
      ) {
        errors.push("Percentage discount must be a number between 0 and 100");
      }
    }
  }

  if (!couponData.expirationDate) {
    errors.push("Expiration date is required");
  } else {
    const expirationDate = new Date(couponData.expirationDate);
    if (isNaN(expirationDate.getTime())) {
      errors.push("Expiration date must be a valid date");
    }
  }

  if (typeof couponData.active !== "boolean") {
    errors.push("Active status must be a boolean");
  }

  return errors;
};

// Helper function to format coupon data according to schema
const formatCouponData = (couponData) => {
  return {
    code: couponData.code,
    type: couponData.type,
    discount: couponData.discount,
    expirationDate: couponData.expirationDate,
    active: couponData.active,
  };
};

// GET all coupons
export async function getAllCoupons(params = {}) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${COUPONS_ADMIN}?${queryString}` : COUPONS_ADMIN;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Coupons data:", data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to fetch coupons"}`);
  }
}

// GET single coupon by ID
export async function getCoupon(id) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    const response = await fetch(`${COUPONS_ADMIN}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Coupon data:", data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to fetch coupon"}`);
  }
}

// CREATE new coupon
export async function createCoupon(couponData) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;
  console.log(couponData);

  // Validate coupon schema
  const validationErrors = validateCouponSchema(couponData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
  }

  try {
    const formattedData = formatCouponData(couponData);

    console.log(formattedData)

    const response = await fetch(COUPONS_ADMIN, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created coupon:", data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to create coupon"}`);
  }
}

// UPDATE existing coupon
export async function updateCoupon(id, couponData) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  // Validate coupon schema
  const validationErrors = validateCouponSchema(couponData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
  }

  try {
    const formattedData = formatCouponData(couponData);

    const response = await fetch(`${COUPONS_ADMIN}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Updated coupon:", data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to update coupon"}`);
  }
}

// DELETE coupon
export async function deleteCoupon(id) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    const response = await fetch(`${COUPONS_ADMIN}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // const data = await response.json();
    // console.log("Deleted coupon:", data);

    // return data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to delete coupon"}`);
  }
}

// PATCH coupon (for partial updates like status changes)
export async function patchCoupon(id, updateData) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  // Validate partial update data
  const allowedFields = [
    "code",
    "type",
    "discount",
    "expirationDate",
    "active",
  ];
  const updateFields = Object.keys(updateData);
  const invalidFields = updateFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Invalid fields for update: ${invalidFields.join(", ")}`);
  }

  try {
    const response = await fetch(`${COUPONS_ADMIN}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Patched coupon:", data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to patch coupon"}`);
  }
}

// GET coupons with specific filters (e.g., active coupons, expired coupons)
export async function getCouponsByStatus(status) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    const response = await fetch(`${COUPONS_ADMIN}?active=${status}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Coupons with active status ${status}:`, data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to fetch coupons by status"}`);
  }
}

// GET coupons by type (amount or percentage)
export async function getCouponsByType(type) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  if (!["amount", "percentage"].includes(type)) {
    throw new Error('Type must be either "amount" or "percentage"');
  }

  try {
    const response = await fetch(`${COUPONS_ADMIN}?type=${type}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Coupons with type ${type}:`, data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to fetch coupons by type"}`);
  }
}

// GET active coupons only
export async function getActiveCoupons() {
  return await getCouponsByStatus(true);
}

// GET inactive coupons only
export async function getInactiveCoupons() {
  return await getCouponsByStatus(false);
}

// Toggle coupon active status
export async function toggleCouponStatus(id) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    // First get the current coupon to check its status
    const response = await fetch(`${COUPONS_ADMIN}/${id}/toggle`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // const data = await response.json();
    // console.log("Patched coupon:", data);

    // return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to toggle coupon status"}`);
  }
}

// Validate coupon code (check if it exists and is active)
export async function validateCouponCode(code) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  try {
    const response = await fetch(`${COUPONS_ADMIN}/validate/${code}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Coupon validation for code ${code}:`, data);

    return data.data || data;
  } catch (e) {
    await logout();
    throw new Error(`${e?.message || "Failed to validate coupon code"}`);
  }
}
