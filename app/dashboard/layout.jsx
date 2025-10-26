import AdminHeader from "../../components/admin/adminHeader";
import { whoisme } from "@/lib/apis/api";

async function getUserData() {
  try {
    // Make the API call or perform the check (assuming whoisme() is a function or API call)
    await whoisme();
    return true;
  } catch (error) {
    return false;
  }
}

export default async function dashboardLayout({ children }) {
  const headerVisible = await getUserData();

  return (
    <>
      {headerVisible && <AdminHeader />}
      <div className="bg-black min-h-screen">
        {children}
      </div>
    </>
  );
}