"use client";

import { deleteUser, getUsers, registerUser, updateUser } from "@/lib/apis/api";
import { AUTH } from "@/paths";
import React from "react";

const API_BASE = AUTH; // ← change if your authRouter is mounted elsewhere
const ROLES = ["FINANCE", "ADMIN", "EMPLOYEE", "GATE"]; // finance not allowed in register per your controller

export default function UsersPage() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState(""); // For searching by username/email
  const [roleFilter, setRoleFilter] = React.useState(""); // For filtering by role
  const [modalOpen, setModalOpen] = React.useState(false);
  const [mode, setMode] = React.useState("create"); // "create" | "edit"
  const [form, setForm] = React.useState({
    id: "",
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    profilePicture: "",
    bio: "",
    phoneNumber: "",
    address: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState({ open: false, id: "", username: "" });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUsers(`${API_BASE}/getallusers`);
        if (!data) throw new Error("Failed to fetch users");
        if (alive) setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (e) {
        if (alive) setError(e.message || "Error loading users");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Separate SUPER_ADMIN users
  const superAdmins = users.filter((user) => user.role === "SUPER_ADMIN");
  const otherUsers = users.filter((user) => user.role !== "SUPER_ADMIN");

  // Filter users based on search and role
  const filteredUsers = otherUsers.filter((user) => {
    const usernameMatch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = roleFilter ? user.role === roleFilter : true;

    return (usernameMatch || emailMatch) && roleMatch;
  });

  function openCreate() {
    setMode("create");
    setForm({
      id: "",
      username: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      profilePicture: "",
      bio: "",
      phoneNumber: "",
      address: "",
    });
    setModalOpen(true);
  }

  function openEdit(u) {
    setMode("edit");
    setForm({
      id: u._id,
      username: u.username || "",
      email: u.email || "",
      password: "", // optional; only set if changing
      role: u.role || "EMPLOYEE",
      profilePicture: u.profilePicture || "",
      bio: u.bio || "",
      phoneNumber: u.phoneNumber || "",
      address: u.address || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "create") {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          profilePicture: form.profilePicture,
          bio: form.bio,
          phoneNumber: form.phoneNumber,
          address: form.address,
        };
        const res = await registerUser(`${API_BASE}/register`, payload);

        // Instead of updating the state directly, refetch all users
        const data = await getUsers(`${API_BASE}/getallusers`);
        if (!data) throw new Error("Failed to fetch users");
        setUsers(Array.isArray(data.users) ? data.users : []);

        setModalOpen(false);
      } else {
        // Edit user logic
        const payload = {
          id: form.id,
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          profilePicture: form.profilePicture,
          bio: form.bio,
          phoneNumber: form.phoneNumber,
          address: form.address,
        };
        if (form.password && form.password.trim().length) {
          payload.password = form.password;
        }
        const res = await updateUser(`${API_BASE}/updateuser`, payload);

        // Refetch users after update to sync frontend and backend data
        const data = await getUsers(`${API_BASE}/getallusers`);
        if (!data) throw new Error("Failed to fetch users");
        setUsers(Array.isArray(data.users) ? data.users : []);
        setModalOpen(false);
      }
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const id = confirmDelete.id;
    setSubmitting(true);
    setError("");
    try {
      await deleteUser(`${API_BASE}/deleteuser`, id);

      // Refetch users after delete to sync data
      const data = await getUsers(`${API_BASE}/getallusers`);
      if (!data) throw new Error("Failed to fetch users");
      setUsers(Array.isArray(data.users) ? data.users : []);

      setConfirmDelete({ open: false, id: "", username: "" });
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Display SUPER_ADMIN in a Card */}
      {superAdmins.length > 0 && (
        <div className="flex justify-center mb-4">
          {superAdmins.map((admin) => (
            <div
              key={admin._id}
              className="bg-zinc-800 p-6 rounded-xl shadow-lg w-full max-w-[350px] flex flex-col items-center justify-center"
            >
              <h2 className="text-2xl text-zinc-100 font-semibold text-center">{admin.username}</h2>
              <p className="text-zinc-400 text-center">{admin.email}</p>
              <p className="text-zinc-400 text-center">{admin.role}</p>
              <p className="text-zinc-400 text-center">{admin.bio}</p>
              <div className="flex gap-2 mt-4 justify-center">
                {/* <button
                  onClick={() => openEdit(admin)}
                  className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                >
                  Edit
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Role Filter */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-zinc-100">Manage Users</h1>
        <div className="flex gap-4">
        <button
          onClick={() => openCreate()}
          className="px-2 py-1 rounded border text-white border-zinc-700 hover:bg-zinc-900"
        >
          add
        </button>
          <input
            type="text"
            className="px-3 py-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-100"
            placeholder="Search by username/email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-100"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error ? (
        <div className="mb-3 text-sm text-red-400">{error}</div>
      ) : null}

      {/* Loading indicator */}
      {loading ? (
        <div className="text-zinc-400">Loading users…</div>
      ) : (
        <div className="overflow-x-auto">
          {/* Users Table */}
          <table className="w-full text-sm border border-zinc-800 rounded-lg overflow-hidden">
            <thead className="bg-zinc-950">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-zinc-300">
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Created</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="[&>td]:px-3 [&>td]:py-2 text-zinc-200">
                  <td className="font-medium">{u.username}</td>
                  <td className="text-zinc-400">{u.email}</td>
                  <td>
                    <span className="inline-flex items-center rounded-md border border-zinc-700 px-2 py-0.5 text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td>{u.isActive ? "Yes" : "No"}</td>
                  <td className="text-zinc-400">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                  <td className="text-zinc-400">{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}</td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ open: true, id: u._id, username: u.username })}
                      className="px-2 py-1 rounded border border-red-700 text-red-300 hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-zinc-100">
                {mode === "create" ? "Add User" : "Edit User"}
              </h2>
              <button
                onClick={closeModal}
                className="px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Username</label>
                  <input
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                {/* Password */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    {mode === "create" ? "Password" : "New Password (optional)"}
                  </label>
                  <input
                    type="password"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    {...(mode === "create" ? { required: true } : {})}
                  />
                </div>
                {/* Role */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Role</label>
                  <select
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {/* Profile Picture URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Profile Picture URL</label>
                  <input
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.profilePicture}
                    onChange={(e) => setForm((f) => ({ ...f, profilePicture: e.target.value }))}
                  />
                </div>
                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Phone</label>
                  <input
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Address</label>
                  <input
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-2 rounded border border-orange-700 bg-orange-900/40 text-orange-200 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="text-base font-semibold text-zinc-100 mb-2">Delete user</h3>
            <p className="text-sm text-zinc-300 mb-4">
              Are you sure you want to delete <span className="font-semibold">{confirmDelete.username}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete({ open: false, id: "", username: "" })}
                className="px-3 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-3 py-2 rounded border border-red-700 text-red-200 hover:bg-red-950/30 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}