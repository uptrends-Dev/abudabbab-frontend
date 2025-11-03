"use client";

import { useEffect, useState } from "react";
import { getallUsers } from "../../../lib/apis/api";
import { FaWhatsapp } from "react-icons/fa";
import { Menu } from "lucide-react";
import { useMob } from "@/components/Provides/mobProvider";

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toggle } = useMob();

  const resetPage = () => setPage(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          q,
          searchField,
          roleFilter,
          sort, // "desc" (Newest) | "asc" (Oldest)
        };
        const response = await getallUsers(params);

        // مرونة مع الـ API: يدعم users أو bookings
        const rows = response?.data?.users ?? response?.data?.bookings ?? [];

        const total =
          response?.data?.totalPages ??
          (response?.data?.totalBookings && limit
            ? Math.max(1, Math.ceil(response.data.totalBookings / limit))
            : 1);

        if (rows.length === 0 && page > 1) {
          setPage(1);
        }

        setAllUsers(rows);
        setTotalPages(total || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, q, searchField, roleFilter, sort]);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-4 py-6">
        <div className="flex gap-2">
          <button
            onClick={toggle}
            className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <header className="mb-5 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">All Users</h1>
          </header>
        </div>

        {/* Filters Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm mb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search + Field */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    resetPage();
                  }}
                  placeholder={`Search by ${searchField}`}
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 fill-slate-400"
                >
                  <path d="M10 2a8 8 0 105.3 14.1l4.3 4.3 1.4-1.4-4.3-4.3A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
                </svg>
              </div>
              <select
                value={searchField}
                onChange={(e) => {
                  setSearchField(e.target.value);
                  resetPage();
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
              >
                <option value="name">Name</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">
                Role
              </span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  resetPage();
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  resetPage();
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>

            {/* Pagination + Page size */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Rows
                </span>
                <select
                  value={String(limit)}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    resetPage();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <PageBtn disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Prev
                </PageBtn>
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  {page} / {totalPages}
                </span>
                <PageBtn
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </PageBtn>
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  allUsers.map((u, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-200 hover:bg-slate-50/70"
                    >
                      <Td>{u?.user?.firstName ?? "—"}</Td>
                      <Td>{u?.user?.lastName ?? "—"}</Td>
                      <Td className="truncate max-w-[260px]">
                        {u?.user?.email ?? "—"}
                      </Td>
                      <Td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {u?.user?.phone ? (
                            <a
                              href={`https://wa.me/${
                                "+20" + String(u.user.phone).replace(/\D/g, "")
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-500"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp />
                            </a>
                          ) : null}
                          {u?.user?.phone ?? "—"}
                        </div>
                      </Td>
                      <Td>
                        <RoleBadge role={u?.role} />
                      </Td>
                      <Td className="whitespace-nowrap">
                        {u?.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-GB")
                          : "—"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- UI bits ---------- */
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
function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-9 rounded-lg px-3 text-sm font-medium transition",
        disabled
          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
          : "bg-sky-600 text-white hover:bg-sky-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RoleBadge({ role }) {
  const r = (role || "user").toLowerCase();
  const styles =
    r === "admin"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : r === "manager"
      ? "bg-sky-50 text-sky-700 ring-sky-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  const label = r === "admin" ? "Admin" : r === "manager" ? "Manager" : "User";

  return (
    <span
      className={[
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1",
        styles,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
