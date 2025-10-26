"use client";

import { deleteUser, getUsers, registerUser, updateUser } from "@/lib/apis/api";
import { AUTH } from "@/paths";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React from "react";

const API_BASE = AUTH;
const ROLES = ["FINANCE", "ADMIN", "EMPLOYEE", "GATE"];

export default function UsersPage() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
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

  const superAdmins = users.filter((user) => user.role === "SUPER_ADMIN");
  const otherUsers = users.filter((user) => user.role !== "SUPER_ADMIN");

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
      password: "",
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
        await registerUser(`${API_BASE}/register`, payload);
        const data = await getUsers(`${API_BASE}/getallusers`);
        if (!data) throw new Error("Failed to fetch users");
        setUsers(Array.isArray(data.users) ? data.users : []);
        setModalOpen(false);
      } else {
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
        await updateUser(`${API_BASE}/updateuser`, payload);
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

  // ---- small helpers for visuals only ----
  const roleStyle = (role) =>
    ({
      ADMIN: "bg-sky-500/10 text-sky-300 border-sky-700",
      EMPLOYEE: "bg-emerald-500/10 text-emerald-300 border-emerald-700",
      GATE: "bg-amber-500/10 text-amber-300 border-amber-700",
      FINANCE: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-700",
      SUPER_ADMIN: "bg-cyan-500/10 text-cyan-300 border-cyan-700",
    }[role] || "bg-zinc-800 text-zinc-300 border-zinc-700");

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Users</h1>
          <p className="text-sm text-zinc-400">Create, update, and manage your platform users.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-300">
            Total <span className="font-semibold text-zinc-100">{users.length}</span>
          </span>
          <button
            onClick={openCreate}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 shadow-sm hover:bg-zinc-800"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* SUPER_ADMIN showcase */}
      {superAdmins.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {superAdmins.map((admin) => (
            <div
              key={admin._id}
              className="group relative overflow-hidden rounded-xl border border-cyan-900/50 bg-gradient-to-b from-cyan-900/20 to-transparent p-5"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-cyan-700/50">
                  <Image
                    src={admin.profilePicture || "/avatar.svg"}
                    alt={admin.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-base font-semibold text-zinc-100">{admin.username}</div>
                  <div className="text-xs text-zinc-400">{admin.email}</div>
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 rounded-md border border-cyan-800 bg-cyan-900/20 px-2 py-0.5 text-xs text-cyan-300">
                  SUPER_ADMIN
                </span>
              </div>
              {admin.bio && <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{admin.bio}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 sm:grid-cols-3">
        <div className="sm:col-span-2 flex items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 pl-9 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              placeholder="Search by username or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔎</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-900/60" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur">
                <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-zinc-300">
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="bg-zinc-950/40 hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-zinc-800">
                          <Image
                            src={u.profilePicture || "/avatar.svg"}
                            alt={u.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-100">{u.username}</div>
                          <div className="text-xs text-zinc-500">ID: {u._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${roleStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                          u.isActive
                            ? "border border-emerald-800 bg-emerald-900/20 text-emerald-300"
                            : "border border-zinc-700 bg-zinc-900/40 text-zinc-300"
                        }`}
                      >
                        <span className="text-[10px]">●</span> {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: true, id: u._id, username: u.username })}
                          className="rounded-lg border border-red-800 px-3 py-1.5 text-red-200 hover:bg-red-950/40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                      No users found. Try a different search or role filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <h2 className="text-base font-semibold text-zinc-100">
                {mode === "create" ? "Add User" : "Edit User"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg border border-zinc-700 px-2 py-1 text-zinc-300 hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Username</label>
                  <input
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">
                    {mode === "create" ? "Password" : "New Password (optional)"}
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    {...(mode === "create" ? { required: true } : {})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Role</label>
                  <select
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profile */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-400">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    {form.profilePicture ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-800">
                        <Image src={form.profilePicture} alt="Profile preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-500">
                        N/A
                      </div>
                    )}
                    <CldUploadWidget
                      uploadPreset="image_abodbab"
                      options={{
                        maxFileSize: 2_000_000,
                        sources: ["local", "camera"],
                        resourceType: "image",
                        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                        multiple: false,
                      }}
                      onSuccess={(result) => {
                        const info = result?.info;
                        const url = info && typeof info === "object" && (info.secure_url || info.url);
                        if (url) setForm((f) => ({ ...f, profilePicture: String(url) }));
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 hover:bg-zinc-800"
                        >
                          {form.profilePicture ? "Change Photo" : "Upload Photo"}
                        </button>
                      )}
                    </CldUploadWidget>
                    {form.profilePicture && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, profilePicture: "" }))}
                        className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-900"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input type="hidden" name="profilePicture" value={form.profilePicture} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-400">Bio</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Phone</label>
                  <input
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Address</label>
                  <input
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg border border-amber-700 bg-amber-900/40 px-3 py-2 text-amber-200 hover:bg-amber-900/60 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-800 px-5 py-3">
              <h3 className="text-base font-semibold text-zinc-100">Delete user</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-zinc-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-zinc-100">{confirmDelete.username}</span>? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-5 py-3">
              <button
                onClick={() => setConfirmDelete({ open: false, id: "", username: "" })}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-lg border border-red-800 px-3 py-2 text-red-200 hover:bg-red-950/40 disabled:opacity-50"
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
