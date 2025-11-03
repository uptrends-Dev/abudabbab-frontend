"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { LogOut, Settings, LayoutGrid, CircleX } from "lucide-react";
import { logout } from "../../lib/apis/authApi";
import { whoisme } from "../../lib/apis/api";
import { useMob } from "../Provides/mobProvider";

const ALL_TABS = [
  { label: "Advanced Statistics", path: "/dashboard/advancedInfos" },
  { label: "Control Trips", path: "/dashboard/controlTrips" },
  { label: "Bookings", path: "/dashboard/bookings" },
  { label: "Users", path: "/dashboard/users" },
  { label: "Coupons", path: "/dashboard/coupons" },
  { label: "Gate", path: "/dashboard/gate" },
];

function tabsForRole(role) {
  switch (role) {
    case "SUPER_ADMIN":
      return ALL_TABS;
    case "FINANCE":
      return ALL_TABS.filter((t) => ["Advanced Statistics", "Bookings"].includes(t.label));
    case "ADMIN":
      return ALL_TABS.filter((t) => !["Advanced Statistics", "Gate"].includes(t.label));
    case "EMPLOYEE":
      return ALL_TABS.filter((t) => t.label === "Bookings");
    case "GATE":
      return ALL_TABS.filter((t) => t.label === "Gate");
    default:
      return [];
  }
}

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = React.useState(null);
  const [username, setUsername] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const { isMobile, close } = useMob();

  useEffect(() => {
    // مبدئيًا خليه هنا، ويفضل تنقله للسيرفر في layout لاحقًا
    const checkAuth = async () => {
      try {
        const data = await whoisme();
        setUsername(data?.username || null);
        const normalized = String(data?.role || "").toUpperCase();
        if (!normalized) throw new Error("No role found");
        setRole(normalized);
        router.refresh();
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  async function onLogout() {
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading || !role) return null;
  const visibleTabs = tabsForRole(role);

  return (
    <>
      {/* Overlay للموبايل فقط */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          isMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar ثابت على الديسكتوب */}
      <aside
        className={`
          fixed md:fixed top-0 left-0
          h-screen md:h-screen
          z-50 w-[280px] md:w-[400px]
          overflow-y-auto overscroll-contain
          transition-transform duration-300
          ${isMobile ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
          bg-white/95 backdrop-blur border-r border-zinc-200 shadow-sm
        `}
      >
        <div className="flex flex-col min-h-screen">
          {/* Brand + Close (موبايل) */}
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center gap-3">
            <div>
              <img src="/AbuDabbabLogo.svg" className="w-32 h-auto" alt="AbuDabbabLogo" />
            </div>
            <button
              onClick={close}
              className="ml-auto xl:hidden inline-flex items-center gap-2 rounded-lg cursor-pointer px-3 py-1.5 text-sm"
            >
             <CircleX />
            </button>
          </div>

          {/* user card */}
          <div className="px-4 py-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-100 grid place-items-center">
                  <LayoutGrid className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">{username}</div>
                  <div className="text-xs text-zinc-500 truncate">{role}</div>
                </div>
                {role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4 text-zinc-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* nav */}
          <nav className="px-3 pt-1 space-y-1 flex-1">
            <div className="px-2 text-[11px] uppercase tracking-wide text-zinc-500">Navigation</div>
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link key={tab.label} href={tab.path} className="block" onClick={close}>
                  <div
                    aria-current={isActive ? "page" : undefined}
                    className={`mt-1 flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all ${
                      isActive
                        ? "border-blue-200 bg-blue-50/80 text-blue-700"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-blue-600" : "bg-zinc-300"
                      }`}
                    />
                    <span className="truncate">{tab.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* footer buttons */}
          <div className="px-4 py-4 border-t border-zinc-200">
            <button
              onClick={onLogout}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
