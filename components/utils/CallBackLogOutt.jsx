"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { logout } from "../../lib/apis/authApi";
const CallBackLogOut = () => {
  const router = useRouter();

  async function onLogout() {
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div>
      <div className="min-h-screen bg-black text-zinc-100 grid place-items-center">
        <div className="space-y-4 text-center">
          <p className="text-sm text-zinc-400">unauthorized</p>

          {/* Button that triggers the server action */}
          <form action={onLogout}>
            <button
              type="submit"
              aria-label="Log out"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 
                         text-sm font-medium text-zinc-300 hover:bg-red-900/60 hover:border-red-500 hover:text-red-400
                         active:scale-95 transition-all duration-300 ease-out"
            >
              <span>Login Again</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CallBackLogOut;
