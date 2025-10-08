"use client";

import { useEffect, useState } from "react";
import { getallUsers } from "@/lib/apis/api";
import { FaWhatsapp } from "react-icons/fa"; // Importing WhatsApp icon

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("firstName");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = {
          page,
          limit,
          q,           // نص البحث
          searchField, // firstName / lastName / email / phone
          roleFilter,  // all / admin / manager / user
          sort,        // recent / oldest / nameAsc / nameDesc
        };

        const response = await getallUsers(params)

        if (response.data.bookings?.length === 0) {
          setPage(0)
        }
        setAllUsers(response.data.bookings); // أو response.data.users حسب الـ API
        setTotalPages(response.data.totalPages || Math.ceil(response.data.totalBookings / limit));
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [page, limit, q, searchField, roleFilter, sort]); // كل فلتر أو بحث أو صفحة يعيد تحميل البيانات


  const resetPage = () => setPage(1);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold tracking-wide text-neutral-200 mb-6">
          All Users
        </h1>

        {/* Controls */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                placeholder={`Search by ${searchField}`}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-10 py-2 text-sm placeholder-neutral-400 outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 fill-neutral-400"
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
              className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-neutral-400">
              Role
            </span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                resetPage();
              }}
              className="rounded-lg border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-neutral-400">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                resetPage();
              }}
              className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>

            </select>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2 justify-end">
            <PageBtn disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </PageBtn>
            <span className="text-sm text-neutral-400">
              {page} / {totalPages}
            </span>
            <PageBtn
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </PageBtn>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-900/50 text-neutral-400">
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
                {allUsers?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-neutral-400"
                    >
                      No users found.
                      {/* <div className="loader"></div> */}
                    </td>
                  </tr>
                ) : (
                  allUsers?.map((u, i) => (
                    <tr
                      key={i}
                      className="border-t border-neutral-800 hover:bg-neutral-900/40"
                    >
                      <Td>{u.user.firstName}</Td>
                      <Td>{u.user.lastName}</Td>
                      <Td className="truncate max-w-[280px]">{u.user.email}</Td>
                      <Td className="whitespace-nowrap flex items-center gap-2">
                        {" "}
                        <a
                          href={`https://wa.me/${"+20" + u.user.phone.replace(/\D/g, "")
                            }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp />
                        </a>
                        {u.user.phone}
                      </Td>
                      <Td>
                        <span
                          className={[
                            "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1",
                            u.role === "admin"
                              ? "bg-amber-600/25 text-amber-300 ring-amber-500/40"
                              : u.role === "manager"
                                ? "bg-sky-600/25 text-sky-300 ring-sky-500/40"
                                : "bg-neutral-700/30 text-neutral-300 ring-neutral-700/50",
                          ].join(" ")}
                        >
                          {/* {u.role} */}
                          user
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Helpers ---------- */
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
        "h-9 rounded-lg px-3 text-sm font-medium",
        disabled
          ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
          : "bg-[#1c4521b3] text-gray-200 border-[#32c800] border-1 hover:bg-[#1c4521cc]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
