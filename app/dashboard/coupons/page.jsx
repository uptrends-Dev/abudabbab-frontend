"use client";
import React, { useEffect, useState } from "react";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "../../../lib/apis/couponApi";

/* ---------- Helpers ---------- */
const toLocalDatetimeInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  // yyyy-MM-ddTHH:mm (بدون ثواني/ملي)
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

const fromLocalDatetimeInputToISO = (val) => {
  // المتصفح بيرجّع قيمة local؛ هنحوّل لـ ISO
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
  };

  const [newCoupon, setNewCoupon] = useState(structuredClone(emptyForm));
  const [editCoupon, setEditCoupon] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
            }
          : {
              code: newCoupon.code.trim(),
              type: "percent",
              discount: { percent: safeNum(newCoupon.discount.percent) },
              expirationDate: fromLocalDatetimeInputToISO(
                newCoupon.expirationDate
              ),
              active: !!newCoupon.active,
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
      // لخانة الإدخال الخاصّة بـ datetime-local
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
    <div className="bg-neutral-900 text-zinc-100">
      <main className="p-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-semibold">Coupon Management</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCoupons}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 disabled:opacity-60 text-sm font-medium"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm font-medium"
            >
              + Add New Coupon
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">{error}</div>
        )}

        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-900/50 text-neutral-400">
                <tr>
                  <Th>Code</Th>
                  <Th>Type</Th>
                  <Th>Discount</Th>
                  <Th>Expiration</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-neutral-400">
                      Loading...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-neutral-400">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon._id ?? coupon.code}
                      className="border-t border-neutral-800 hover:bg-neutral-900/40"
                    >
                      <Td className="font-mono break-all">{coupon.code}</Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${
                            coupon.type === "amount"
                              ? "bg-blue-600/25 text-blue-300 ring-blue-500/40"
                              : "bg-green-600/25 text-green-300 ring-green-500/40"
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
                          `${coupon?.discount?.percent ?? safeNum(coupon?.discount)}%`
                        )}
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
                              ? "bg-emerald-600/25 text-emerald-300 ring-emerald-500/40"
                              : "bg-rose-600/25 text-rose-300 ring-rose-500/40"
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
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Add New Coupon</h2>
              <button onClick={closeAdd} className="text-zinc-400 hover:text-zinc-100 text-2xl">
                ×
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-600 text-white rounded-md">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="Enter coupon code"
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => {
                    const type = e.target.value ;
                    setNewCoupon({
                      ...newCoupon,
                      type,
                      discount:
                        type === "amount"
                          ? { ...newCoupon.discount, percent: "" }
                          : { egp: "", euro: "", percent: newCoupon.discount.percent || "" },
                    });
                  }}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                    <label className="block text-sm font-medium mb-2">EGP Amount</label>
                    <input
                      type="number"
                      value={newCoupon.discount.egp}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: { ...newCoupon.discount, egp: e.target.value },
                        })
                      }
                      placeholder="Enter EGP amount"
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Euro Amount</label>
                    <input
                      type="number"
                      value={newCoupon.discount.euro}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: { ...newCoupon.discount, euro: e.target.value },
                        })
                      }
                      placeholder="Enter Euro amount"
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Percentage</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newCoupon.discount.percent}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discount: { egp: "", euro: "", percent: e.target.value },
                      })
                    }
                    placeholder="Enter percentage (0-100)"
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Expiration Date</label>
              <input
                type="datetime-local"
                value={newCoupon.expirationDate}
                onChange={(e) => setNewCoupon({ ...newCoupon, expirationDate: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="active"
                checked={newCoupon.active}
                onChange={(e) => setNewCoupon({ ...newCoupon, active: e.target.checked })}
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
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 rounded-md text-white font-semibold transition-colors"
              >
                {loading ? "Adding..." : "Add Coupon"}
              </button>
              <button
                onClick={closeAdd}
                className="flex-1 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-100 font-semibold transition-colors"
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
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Edit Coupon</h2>
              <button onClick={closeEdit} className="text-zinc-400 hover:text-zinc-100 text-2xl">
                ×
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-600 text-white rounded-md">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={editCoupon.code}
                  onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value })}
                  placeholder="Enter coupon code"
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={editCoupon.type}
                  onChange={(e) => {
                    const type = e.target.value ;
                    setEditCoupon((prev) => ({
                      ...prev,
                      type,
                      discount:
                        type === "amount"
                          ? { egp: prev.discount?.egp ?? "", euro: prev.discount?.euro ?? "" }
                          : { percent: prev.discount?.percent ?? "" },
                    }));
                  }}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                    <label className="block text-sm font-medium mb-2">EGP Amount</label>
                    <input
                      type="number"
                      value={editCoupon.discount?.egp ?? ""}
                      onChange={(e) =>
                        setEditCoupon({
                          ...editCoupon,
                          discount: { ...editCoupon.discount, egp: e.target.value },
                        })
                      }
                      placeholder="Enter EGP amount"
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Euro Amount</label>
                    <input
                      type="number"
                      value={editCoupon.discount?.euro ?? ""}
                      onChange={(e) =>
                        setEditCoupon({
                          ...editCoupon,
                          discount: { ...editCoupon.discount, euro: e.target.value },
                        })
                      }
                      placeholder="Enter Euro amount"
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Percentage</label>
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
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Expiration Date</label>
              <input
                type="datetime-local"
                value={editCoupon.expirationDate || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, expirationDate: e.target.value })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="editActive"
                checked={!!editCoupon.active}
                onChange={(e) => setEditCoupon({ ...editCoupon, active: e.target.checked })}
                className="mr-3 w-4 h-4"
              />
              <label htmlFor="editActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  // رجّع قيمة datetime-local إلى ISO قبل الإرسال
                  const iso = fromLocalDatetimeInputToISO(editCoupon.expirationDate);
                  handleUpdateCoupon(editCoupon._id, (editCoupon.expirationDate = iso));
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 rounded-md text-white font-semibold transition-colors"
              >
                {loading ? "Updating..." : "Update Coupon"}
              </button>
              <button
                onClick={closeEdit}
                className="flex-1 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-100 font-semibold transition-colors"
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
function Th({ children } ) {
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
