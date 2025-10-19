"use server";

import { cookies } from "@/node_modules/next/headers";
import { COUPONS_URL, COUPONS_ADMIN } from "@/paths";
import { logout } from "./authApi";
import { z } from "zod";

// Zod schemas
const AmountDiscountSchema = z.object({
  egp: z.number({ required_error: "EGP amount is required" }).min(0, "EGP must be >= 0"),
  euro: z.number({ required_error: "Euro amount is required" }).min(0, "Euro must be >= 0"),
});

const PercentDiscountSchema = z.object({
  percent: z
    .number({ required_error: "Percent is required" })
    .min(0, "Percent must be >= 0")
    .max(100, "Percent must be <= 100"),
});

const CouponBaseSchema = z.object({
  code: z.string({ required_error: "Code is required" }).min(1, "Code is required"),
  type: z.enum(["amount", "percent"], {
    required_error: 'Type is required and must be either "amount" or "percent"',
  }),
  expirationDate: z
    .union([z.string(), z.date()], { required_error: "Expiration date is required" })
    .refine((v) => !isNaN(new Date(v).getTime()), {
      message: "Expiration date must be a valid date",
    }),
  active: z.boolean({ required_error: "Active status must be a boolean" }),
});

const CouponSchema = z.discriminatedUnion("type", [
  CouponBaseSchema.extend({ type: z.literal("amount"), discount: AmountDiscountSchema }),
  CouponBaseSchema.extend({ type: z.literal("percent"), discount: PercentDiscountSchema }),
]);

// For PATCH operations: allow partial updates, but if fields are present, validate them
const PartialCouponUpdateSchema = z
  .object({
    code: z.string().min(1).optional(),
    type: z.enum(["amount", "percent"]).optional(),
    discount: z.union([AmountDiscountSchema, PercentDiscountSchema]).optional(),
    expirationDate: z
      .union([z.string(), z.date()])
      .refine((v) => v === undefined || !isNaN(new Date(v).getTime()), {
        message: "Expiration date must be a valid date",
      })
      .optional(),
    active: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    // If type is provided ensure discount shape (if provided) matches
    if (val.type === "percent" && val.discount && !("percent" in val.discount)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "For percent type, discount must have { percent }" });
    }
    if (val.type === "amount" && val.discount && !("egp" in val.discount && "euro" in val.discount)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "For amount type, discount must have { egp, euro }" });
    }
  });

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

  // Validate with Zod
  const parsed = CouponSchema.safeParse(couponData);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${msg}`);
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

  // Validate with Zod
  const parsed = CouponSchema.safeParse(couponData);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${msg}`);
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

  // Validate with Zod (partial)
  const parsed = PartialCouponUpdateSchema.safeParse(updateData);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${msg}`);
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
  try {
    const response = await fetch(`${COUPONS_ADMIN}/validate/${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const payload = await response.json();

    if (payload?.status !== "success") {
      const message = payload?.message || "Invalid or inactive coupon code";
      throw new Error(message);
    }

    // Normalize to { type, discount }
    return payload?.data;
  } catch (e) {
    throw new Error(`${e?.message || "Failed to validate coupon code"}`);
  }
}
