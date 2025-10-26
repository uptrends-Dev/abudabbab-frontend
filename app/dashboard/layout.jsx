// app/dashboard/layout.tsx  (Server Component)
import { redirect } from "next/navigation";
import AdminHeader from "../../components/admin/adminHeader";
import { whoisme } from "../../lib/apis/api";
import { logout } from "../../lib/apis/authApi";

async function getUserData() {
  try {
    await whoisme();
    return true;
  } catch {
    return false;
  }
}

// --- Server Action: runs on the server when the form is submitted ---
async function logoutAction() {
  "use server";
  try {
    await logout();
  } finally {
    redirect("/dashboard/login"); // server-side redirect
  }
}

export default async function DashboardLayout({
  children,
}) {
  const authed = await getUserData();

  if (!authed) {
    // You could also just: redirect("/dashboard/login");
    return (
      <div className="min-h-screen bg-black text-zinc-100 grid place-items-center">
        <div className="space-y-4 text-center">
          <p className="text-sm text-zinc-400">unauthorized</p>

          {/* Button that triggers the server action */}
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 
                         text-sm font-medium text-zinc-300 hover:bg-red-900/60 hover:border-red-500 hover:text-red-400
                         active:scale-95 transition-all duration-300 ease-out"
            >
              <span>Logout</span>
            </button>
          </form>

          {/* (Optional) direct-to-login button without calling logout */}
          <form
            action={async () => {
              "use server";
              redirect("/dashboard/login");
            }}
          >
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-zinc-200 underline"
            >
              Go to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="bg-black min-h-screen">{children}</div>
    </>
  );
}