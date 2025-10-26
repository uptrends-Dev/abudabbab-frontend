"use client";

import { whoisme } from "@/lib/apis/api";
import { logout } from "../../lib/apis/authApi";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ALL_TABS = [
  { label: "Control Trips", path: "/dashboard/controlTrips" },
  { label: "Advanced Infos", path: "/dashboard/advancedInfos" },
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
      return ALL_TABS.filter((t) =>
        ["Advanced Infos", "Bookings"].includes(t.label)
      );
    case "ADMIN":
      return ALL_TABS.filter(
        (t) => !["Advanced Infos", "Gate"].includes(t.label)
      );
    case "EMPLOYEE":
      return ALL_TABS.filter((t) => t.label === "Bookings");
    case "GATE":
      return ALL_TABS.filter((t) => t.label === "Gate");
    default:
      return [];
  }
}

const AdminHeader = () => {
  // Hide header on login page
  const pathname = usePathname();
  if (pathname === "/dashboard/login") return null;

  const [role, setRole] = React.useState(null);
  const [username, setUsername] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  async function onLogout() {
    try {
      await logout();
      router.replace("/dashboard/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await whoisme(); // expect { role: "..." }
        setUsername(data?.username || null);
        if (!data?.role) throw new Error("No role found");
        // normalize role to match our enum
        // e.g. "super_admin" -> "SUPER_ADMIN"
        const normalized = String(data?.role || "").toUpperCase();
        setRole(normalized);
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.replace("/dashboard/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading || !role) return null;

  const visibleTabs = tabsForRole(role);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* left: admin */}
        <div className="flex items-center gap-3 min-w-0">
          {role === "SUPER_ADMIN" && (
            <button
              type="button"
              aria-label="Settings"
              onClick={() => router.push("/dashboard/settings")}
              className="h-8 w-8 rounded-full grid place-items-center border border-zinc-700 bg-zinc-900 cursor-pointer hover:bg-green-900 transition duration-200"
            >
              <Settings className="text-white hover:rotate-30 transition duration-200" />
            </button>
          )}

          <div className="hidden sm:block text-xs leading-tight text-zinc-300">
            <div className="font-semibold">{username}</div>
            <div className="text-zinc-500">{role}</div>
          </div>
        </div>

        {/* right: tabs */}
        <nav
          className="
            flex items-center gap-1 sm:gap-2
            overflow-x-auto max-w-full
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link key={tab.label} href={tab.path} className="shrink-0 rounded-lg  ">
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={` cursor-pointer px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0
                    ${
                      isActive
                        ? "border-orange-700 bg-orange-900/40 text-orange-200 hover:bg-gray-500"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-300  hover:bg-gray-500"
                    }`}
                >
                  {tab.label}
                </button>
              </Link>
            );
          })}
          <button
            onClick={onLogout}
            aria-label="Log out"
            className=" cursor-pointer flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 
             text-sm font-medium text-zinc-300 hover:bg-red-900/60 hover:border-red-500 hover:text-red-400
             active:scale-95 transition-all duration-300 ease-out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
