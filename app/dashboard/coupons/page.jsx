"use client";
import React, { useState, useEffect } from "react";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "@/lib/apis/couponApi";

const CouponTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "amount",
    discount: { egp: "", euro: "" },
    expirationDate: "",
    active: true,
  });
  const [editCoupon, setEditCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch all coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCoupons();
      console.log(data);
      setCoupons(data.coupons);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add coupon
  const handleAddCoupon = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare coupon data based on type
      const couponData = {
        code: newCoupon.code,
        type: newCoupon.type,
        discount:
          newCoupon.type === "amount"
            ? {
                egp: Number(newCoupon.discount.egp),
                euro: Number(newCoupon.discount.euro),
              }
            : {
                percent: Number(newCoupon.discount),
              },
        expirationDate: newCoupon.expirationDate,
        active: newCoupon.active,
      };

      const addedCoupon = await createCoupon(couponData);
      setCoupons([...coupons, addedCoupon.coupon]);
      setNewCoupon({
        code: "",
        type: "amount",
        discount: { egp: "", euro: "" },
        expirationDate: "",
        active: true,
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
      console.error("Error creating coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete coupon (silent delete)
  const handleDeleteCoupon = async (id) => {
    // Optimistically remove from UI immediately
    setCoupons(coupons.filter((coupon) => coupon._id !== id));

    // Silently attempt to delete from server
    try {
      await deleteCoupon(id);
    } catch (err) {
      // If delete fails, revert the optimistic update
      console.error("Error deleting coupon:", err);
      // Re-fetch coupons to restore correct state
      fetchCoupons();
    }
  };

  // Handle update coupon
  const handleUpdateCoupon = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare coupon data based on type
      const couponData = {
        code: editCoupon.code,
        type: editCoupon.type,
        discount:
          editCoupon.type === "amount"
            ? {
                egp: Number(editCoupon.discount.egp),
                euro: Number(editCoupon.discount.euro),
              }
            : Number(editCoupon.discount),
        expirationDate: editCoupon.expirationDate,
        active: editCoupon.active,
      };

      const updatedCoupon = await updateCoupon(id, couponData);
      setCoupons(
        coupons.map((coupon) =>
          coupon._id === id ? updatedCoupon.coupon : coupon
        )
      );
      setEditCoupon(null);
      setShowEditModal(false);
    } catch (err) {
      setError(err.message);
      console.error("Error updating coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle coupon status (silent, optimistic)
  const handleToggleStatus = async (id) => {
    const previousCoupons = coupons;
    // Optimistically flip active state in UI
    setCoupons(
      coupons.map((coupon) =>
        coupon._id === id ? { ...coupon, active: !coupon.active } : coupon
      )
    );

    try {
      await toggleCouponStatus(id);
      // Do nothing on success (UI already updated). Optionally re-fetch to sync server state.
    } catch (err) {
      console.error("Error toggling coupon status:", err);
      // Revert UI on failure
      setCoupons(previousCoupons);
    }
  };

  // Handle opening add modal
  const handleOpenAddModal = () => {
    setNewCoupon({
      code: "",
      type: "amount",
      discount: { egp: "", euro: "" },
      expirationDate: "",
      active: true,
    });
    setError(null);
    setShowAddModal(true);
  };

  // Handle opening edit modal
  const handleOpenEditModal = (coupon) => {
    setEditCoupon(coupon);
    setError(null);
    setShowEditModal(true);
  };

  // Handle closing modals
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setError(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditCoupon(null);
    setError(null);
  };

  return (
    <div className=" bg-neutral-900 text-neutral-200 text-zinc-100">
      <main className="p-6 max-w-7xl mx-auto min-h-screen">
        {/* Header with Add Button */}
        <div className="mb-6 flex justify-between items-center  ">
          <h1 className="text-lg sm:text-xl font-semibold">
            Coupon Management
          </h1>
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

        {/* Global Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}

        {/* Coupon Table */}
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
                    <td
                      colSpan="6"
                      className="p-6 text-center text-neutral-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-6 text-center text-neutral-400"
                    >
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon, i) => (
                    <tr
                      key={i}
                      className="border-t border-neutral-800 hover:bg-neutral-900/40"
                    >
                      <Td className="font-mono">{coupon.code}</Td>
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
                            <div>EGP: {coupon.discount.egp}</div>
                            <div>EUR: {coupon.discount.euro}</div>
                          </div>
                        ) : (
                          `${coupon.discount.percent}%`
                        )}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {new Date(coupon.expirationDate).toLocaleDateString()}
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
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon._id)}
                          className={`px-3 py-1 rounded text-sm text-white ${
                            coupon.active
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Add New Coupon</h2>
              <button
                onClick={handleCloseAddModal}
                className="text-zinc-400 hover:text-zinc-100 text-2xl"
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
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      type: e.target.value,
                      discount:
                        e.target.value === "amount"
                          ? { egp: "", euro: "" }
                          : "",
                    })
                  }
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
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                    value={newCoupon.discount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discount: e.target.value })
                    }
                    placeholder="Enter percentage (0-100)"
                    min="0"
                    max="100"
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
              />
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
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 rounded-md text-white font-semibold transition-colors"
              >
                {loading ? "Adding..." : "Add Coupon"}
              </button>
              <button
                onClick={handleCloseAddModal}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Edit Coupon</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-zinc-400 hover:text-zinc-100 text-2xl"
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
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={editCoupon.type}
                  onChange={(e) =>
                    setEditCoupon({
                      ...editCoupon,
                      type: e.target.value,
                      discount:
                        e.target.value === "amount"
                          ? typeof editCoupon.discount === "object"
                            ? editCoupon.discount
                            : { egp: "", euro: "" }
                          : typeof editCoupon.discount === "number"
                          ? editCoupon.discount
                          : "",
                    })
                  }
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="amount">Amount</option>
                  <option value="percentage">Percentage</option>
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
                      value={editCoupon.discount.egp || ""}
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
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Euro Amount
                    </label>
                    <input
                      type="number"
                      value={editCoupon.discount.euro || ""}
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
                      className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                    value={editCoupon.discount || ""}
                    onChange={(e) =>
                      setEditCoupon({ ...editCoupon, discount: e.target.value })
                    }
                    placeholder="Enter percentage (0-100)"
                    min="0"
                    max="100"
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                value={
                  editCoupon.expirationDate
                    ? editCoupon.expirationDate.slice(0, 16)
                    : ""
                } // Remove milliseconds and Z
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon,
                    expirationDate: e.target.value,
                  })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="editActive"
                checked={editCoupon.active}
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
                onClick={() => handleUpdateCoupon(editCoupon._id)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 rounded-md text-white font-semibold transition-colors"
              >
                {loading ? "Updating..." : "Update Coupon"}
              </button>
              <button
                onClick={handleCloseEditModal}
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

/* ---------- Helper Components ---------- */
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
