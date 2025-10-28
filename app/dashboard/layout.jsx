// app/dashboard/layout.tsx  (Server Component)
import { redirect } from "next/navigation";
import AdminHeader from "../../components/admin/adminHeader";
import { whoisme } from "../../lib/apis/api";
import { logout } from "../../lib/apis/authApi";
import CallbackLogOut from "../../components/utils/callbackLogOut";
import Adminpro from "../../components/admin/Adminpro";
async function getUserData() {
  try {
    await whoisme();
    return true;
  } catch {
    return false;
  }
}

// --- Server Action: runs on the server when the form is submitted ---
// async function logoutAction() {
//   "use server";
//   try {
//     await logout();
//   } finally {
//     redirect("/dashboard/login"); // server-side redirect
//   }
// }

export default async function DashboardLayout({ children }) {
  const authed = await getUserData();

  if (!authed) {
    // You could also just: redirect("/dashboard/login");
    return <CallbackLogOut />;
  }

  return (
    <>
      <Adminpro />
      <div className="bg-black min-h-screen">{children}</div>
    </>
  );
}
