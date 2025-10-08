"use client";

import { logout } from "@/lib/apis/authApi";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const AdminHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  async function logut() {
    try {
      await logout()
      router.replace("/dashboard/login");
      router.refresh();
    } catch (error) {
      console.log(error)
    }
  }

  const tabs = [
    { label: "Control Trips", path: "/dashboard/controlTrips" },
    { label: "Advanced Infos", path: "/dashboard/advancedInfos" },
    { label: "Bookings", path: "/dashboard/bookings" },
    { label: "Users", path: "/dashboard/users" },
    { label: "Gate", path: "/dashboard/gate" },
  ];

  if(pathname == "/dashboard/login")return

  return (
    <header className={`sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* left: admin */}
        <div className="flex items-center gap-3 min-w-0">
          <div onClick={() => logut()} className="h-8 w-8 rounded-full grid place-items-center border border-zinc-700 bg-zinc-900">
            <LogOut className="text-white" />
          </div>
          {/* اخفي الاسم على الشاشات الصغيرة */}
          <div className="hidden sm:block text-xs leading-tight text-zinc-300">
            <div className="font-semibold">Admin</div>
            <div className="text-zinc-500">Name</div>
          </div>
        </div>

        {/* right: tabs */}
        <nav
          className="
            flex items-center gap-1 sm:gap-2
            overflow-x-auto max-w-full
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          // لإخفاء شريط التمرير في كروم وسفاري لو حابب (اختياري)
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link key={tab.label} href={tab.path} className="shrink-0">
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={`cursor-pointer px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0
                    ${isActive
                      ? "border-orange-700 bg-orange-900/40 text-orange-200"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900"
                    }`}
                >
                  {tab.label}
                </button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
