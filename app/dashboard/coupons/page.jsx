"use client";
import React, { useEffect, useState } from "react";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "../../../lib/apis/couponApi";
import { useMob } from "@/components/Provides/mobProvider";
import { Menu } from "lucide-react";

/* ---------- Helpers ---------- */
const toLocalDatetimeInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

const fromLocalDatetimeInputToISO = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString();
};

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// للتعامل مع احتمالية إن الـ API ترجع discount كرقم في حالة percent
const normalizeCoupon = (c) => {
  let discount = c.discount ?? {};
  if (c.type === "percent") {
    if (typeof discount === "number") {
      discount = { percent: discount };
    } else if (typeof discount?.percent !== "number") {
      discount = { percent: safeNum(discount?.percent) };
    }
  } else if (c.type === "amount") {
    discount = {
      egp: safeNum(discount?.egp),
      euro: safeNum(discount?.euro),
    };
  }
  return { ...c, discount };
};

/* ---------- Component ---------- */
const CouponTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // unified shape for forms
  const emptyForm = {
    code: "",
    type: "amount",
    discount: { egp: "", euro: "", percent: "" },
    expirationDate: "",
    active: true,
    ticketLimit: "", // optional number of total allowed tickets
  };

  const [newCoupon, setNewCoupon] = useState(structuredClone(emptyForm));
  const [editCoupon, setEditCoupon] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toggle } = useMob();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCoupons();
      const list = Array.isArray(data?.coupons) ? data.coupons : data ?? [];
      setCoupons(list.map(normalizeCoupon));
    } catch (err) {
      setError(err?.message || "Failed to fetch coupons");
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload =
        newCoupon.type === "amount"
          ? {
              code: newCoupon.code.trim(),
              type: "amount",
              discount: {
                egp: safeNum(newCoupon.discount.egp),
                euro: safeNum(newCoupon.discount.euro),
              },
              expirationDate: fromLocalDatetimeInputToISO(
                newCoupon.expirationDate
              ),
              active: !!newCoupon.active,
              ...(newCoupon.ticketLimit !== "" && newCoupon.ticketLimit !== null
                ? { ticketLimit: safeNum(newCoupon.ticketLimit) }
                : {}),
            }
          : {
              code: newCoupon.code.trim(),
              type: "percent",
              discount: { percent: safeNum(newCoupon.discount.percent) },
              expirationDate: fromLocalDatetimeInputToISO(
                newCoupon.expirationDate
              ),
              active: !!newCoupon.active,
              ...(newCoupon.ticketLimit !== "" && newCoupon.ticketLimit !== null
                ? { ticketLimit: safeNum(newCoupon.ticketLimit) }
                : {}),
            };

      const res = await createCoupon(payload);
      const added = normalizeCoupon(res?.coupon ?? res);
      setCoupons((prev) => [...prev, added]);
      setNewCoupon(structuredClone(emptyForm));
      setShowAddModal(false);
    } catch (err) {
      setError(err?.message || "Error creating coupon");
      console.error("Error creating coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    const prev = coupons;
    setCoupons(coupons.filter((c) => c._id !== id));
    try {
      await deleteCoupon(id);
    } catch (err) {
      console.error("Error deleting coupon:", err);
      setCoupons(prev); // rollback
    }
  };

  const handleUpdateCoupon = async (id) => {
    if (!editCoupon) return;
    try {
      setLoading(true);
      setError(null);

      const payload =
        editCoupon.type === "amount"
          ? {
              code: String(editCoupon.code || "").trim(),
              type: "amount",
              discount: {
                egp: safeNum(editCoupon.discount?.egp),
                euro: safeNum(editCoupon.discount?.euro),
              },
              expirationDate: fromLocalDatetimeInputToISO(
                editCoupon.expirationDate
              ),
              active: !!editCoupon.active,
              ...(editCoupon.ticketLimit !== undefined && editCoupon.ticketLimit !== ""
                ? { ticketLimit: safeNum(editCoupon.ticketLimit) }
                : {}),
            }
          : {
              code: String(editCoupon.code || "").trim(),
              type: "percent",
              discount: {
                percent: safeNum(
                  editCoupon.discount?.percent ?? editCoupon.discount
                ),
              },
              expirationDate: fromLocalDatetimeInputToISO(
                editCoupon.expirationDate
              ),
              active: !!editCoupon.active,
              ...(editCoupon.ticketLimit !== undefined && editCoupon.ticketLimit !== ""
                ? { ticketLimit: safeNum(editCoupon.ticketLimit) }
                : {}),
            };

      const res = await updateCoupon(id, payload);
      const updated = normalizeCoupon(res?.coupon ?? res);
      setCoupons((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setEditCoupon(null);
      setShowEditModal(false);
    } catch (err) {
      setError(err?.message || "Error updating coupon");
      console.error("Error updating coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const prev = coupons;
    setCoupons((list) =>
      list.map((c) => (c._id === id ? { ...c, active: !c.active } : c))
    );
    try {
      await toggleCouponStatus(id);
    } catch (err) {
      console.error("Error toggling coupon status:", err);
      setCoupons(prev); // rollback on failure
    }
  };

  const handleOpenAddModal = () => {
    setNewCoupon(structuredClone(emptyForm));
    setError(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (coupon) => {
    const normalized = normalizeCoupon(coupon);
    setEditCoupon({
      ...normalized,
      expirationDate: toLocalDatetimeInput(normalized.expirationDate),
    });
    setError(null);
    setShowEditModal(true);
  };

  const closeAdd = () => {
    setShowAddModal(false);
    setError(null);
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditCoupon(null);
    setError(null);
  };

  return (
    <div className="bg-white text-neutral-900">
      <main className="p-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={toggle}
              className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold">
              Coupons
            </h1>
          </div>
          <div className="flex flex-row   gap-2">
            <button
              onClick={fetchCoupons}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-60 text-sm font-medium"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium"
            >
              + Add 
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <Th>Code</Th>
                  <Th>Type</Th>
                  <Th>Discount</Th>
                  <Th>Usage</Th>
                  <Th>Expiration</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-neutral-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-neutral-500"
                    >
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon._id ?? coupon.code}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <Td className="font-mono break-all">{coupon.code}</Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${
                            coupon.type === "amount"
                              ? "bg-blue-600/10 text-blue-700 ring-blue-600/20"
                              : "bg-green-600/10 text-green-700 ring-green-600/20"
                          }`}
                        >
                          {coupon.type}
                        </span>
                      </Td>
                      <Td>
                        {coupon.type === "amount" ? (
                          <div className="text-sm">
                            <div>EGP: {coupon?.discount?.egp ?? 0}</div>
                            <div>EUR: {coupon?.discount?.euro ?? 0}</div>
                          </div>
                        ) : (
                          `${
                            coupon?.discount?.percent ??
                            safeNum(coupon?.discount)
                          }%`
                        )}
                      </Td>
                      <Td>
                        {(() => {
                          const used = Number(coupon?.ticketsUsed ?? 0);
                          const limitVal =
                            coupon?.ticketLimit !== undefined && coupon?.ticketLimit !== null
                              ? Number(coupon.ticketLimit)
                              : null;
                          const remaining =
                            limitVal !== null && Number.isFinite(limitVal)
                              ? Math.max(0, limitVal - used)
                              : null;
                          return (
                            <div className="text-xs">
                              <div>Used: {used}</div>
                              <div>
                                Limit: {limitVal !== null && Number.isFinite(limitVal) ? limitVal : "∞"}
                              </div>
                              {remaining !== null && (
                                <div>Remaining: {remaining}</div>
                              )}
                            </div>
                          );
                        })()}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {coupon.expirationDate
                          ? new Date(coupon.expirationDate).toLocaleDateString()
                          : "-"}
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${
                            coupon.active
                              ? "bg-emerald-600/10 text-emerald-700 ring-emerald-600/20"
                              : "bg-rose-600/10 text-rose-700 ring-rose-600/20"
                          }`}
                        >
                          {coupon.active ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td className="space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white disabled:opacity-60"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon._id)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm text-white ${
                            coupon.active
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-green-600 hover:bg-green-700"
                          } disabled:opacity-60`}
                        >
                          {coupon.active ? "Deactivate" : "Activate"}
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Add New Coupon</h2>
              <button
                onClick={closeAdd}
                className="text-neutral-500 hover:text-neutral-800 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-600 text-white rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, code: e.target.value })
                  }
                  placeholder="Enter coupon code"
                  className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setNewCoupon({
                      ...newCoupon,
                      type,
                      discount:
                        type === "amount"
                          ? { ...newCoupon.discount, percent: "" }
                          : {
                              egp: "",
                              euro: "",
                              percent: newCoupon.discount.percent || "",
                            },
                    });
                  }}
                  className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="amount">Amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {newCoupon.type === "amount" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      EGP Amount
                    </label>
                    <input
                      type="number"
                      value={newCoupon.discount.egp}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: {
                            ...newCoupon.discount,
                            egp: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter EGP amount"
                      className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Euro Amount
                    </label>
                    <input
                      type="number"
                      value={newCoupon.discount.euro}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: {
                            ...newCoupon.discount,
                            euro: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter Euro amount"
                      className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Percentage
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newCoupon.discount.percent}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discount: {
                          egp: "",
                          euro: "",
                          percent: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter percentage (0-100)"
                    className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                value={newCoupon.expirationDate}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, expirationDate: e.target.value })
                }
                className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Usage limit (tickets)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Optional: e.g., 100"
                value={newCoupon.ticketLimit}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, ticketLimit: e.target.value })
                }
                className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Leave empty for unlimited uses. This caps the total number of tickets that can use this coupon.
              </p>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="active"
                checked={newCoupon.active}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, active: e.target.checked })
                }
                className="mr-3 w-4 h-4"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Active
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddCoupon}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-400 rounded-md text-white font-semibold transition-colors"
              >
                {loading ? "Adding..." : "Add Coupon"}
              </button>
              <button
                onClick={closeAdd}
                className="flex-1 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-md text-neutral-900 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && editCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Edit Coupon</h2>
              <button
                onClick={closeEdit}
                className="text-neutral-500 hover:text-neutral-800 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-600 text-white rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={editCoupon.code}
                  onChange={(e) =>
                    setEditCoupon({ ...editCoupon, code: e.target.value })
                  }
                  placeholder="Enter coupon code"
                  className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={editCoupon.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setEditCoupon((prev) => ({
                      ...prev,
                      type,
                      discount:
                        type === "amount"
                          ? {
                              egp: prev.discount?.egp ?? "",
                              euro: prev.discount?.euro ?? "",
                            }
                          : { percent: prev.discount?.percent ?? "" },
                    }));
                  }}
                  className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="amount">Amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {editCoupon.type === "amount" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      EGP Amount
                    </label>
                    <input
                      type="number"
                      value={editCoupon.discount?.egp ?? ""}
                      onChange={(e) =>
                        setEditCoupon({
                          ...editCoupon,
                          discount: {
                            ...editCoupon.discount,
                            egp: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter EGP amount"
                      className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Euro Amount
                    </label>
                    <input
                      type="number"
                      value={editCoupon.discount?.euro ?? ""}
                      onChange={(e) =>
                        setEditCoupon({
                          ...editCoupon,
                          discount: {
                            ...editCoupon.discount,
                            euro: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter Euro amount"
                      className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Percentage
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editCoupon.discount?.percent ?? ""}
                    onChange={(e) =>
                      setEditCoupon({
                        ...editCoupon,
                        discount: { percent: e.target.value },
                      })
                    }
                    placeholder="Enter percentage (0-100)"
                    className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                value={editCoupon.expirationDate || ""}
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon,
                    expirationDate: e.target.value,
                  })
                }
                className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Usage limit (tickets)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editCoupon.ticketLimit ?? ""}
                  onChange={(e) =>
                    setEditCoupon({
                      ...editCoupon,
                      ticketLimit: e.target.value,
                    })
                  }
                  placeholder="Optional: e.g., 100"
                  className="w-full p-3 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current usage
                </label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm">
                  <div>
                    Used: {Number(editCoupon?.ticketsUsed ?? 0)}
                  </div>
                  <div>
                    Limit: {editCoupon?.ticketLimit !== undefined && editCoupon?.ticketLimit !== null && editCoupon?.ticketLimit !== ""
                      ? Number(editCoupon.ticketLimit)
                      : "∞"}
                  </div>
                  {editCoupon?.ticketLimit !== undefined && editCoupon?.ticketLimit !== null && editCoupon?.ticketLimit !== "" && (
                    <div>
                      Remaining: {Math.max(0, Number(editCoupon.ticketLimit) - Number(editCoupon?.ticketsUsed ?? 0))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="editActive"
                checked={!!editCoupon.active}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, active: e.target.checked })
                }
                className="mr-3 w-4 h-4"
              />
              <label htmlFor="editActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const iso = fromLocalDatetimeInputToISO(
                    editCoupon.expirationDate
                  );
                  handleUpdateCoupon(
                    editCoupon._id,
                    (editCoupon.expirationDate = iso)
                  );
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-400 rounded-md text-white font-semibold transition-colors"
              >
                {loading ? "Updating..." : "Update Coupon"}
              </button>
              <button
                onClick={closeEdit}
                className="flex-1 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-md text-neutral-900 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Small table cells ---------- */
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-4 align-middle ${className}`}>{children}</td>;
}

export default CouponTable;
