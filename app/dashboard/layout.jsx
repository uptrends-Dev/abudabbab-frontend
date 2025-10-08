import { headers } from "next/headers";
import AdminHeader from "@/components/admin/adminHeader";
import ReduxTripsProvider from '@/components/Provides/reduxTripsProvider'
export default function dashboardLayout({ children }) {
  return (
    <ReduxTripsProvider>
      <AdminHeader />
      <div className="bg-black">
        {children}
      </div>
    </ReduxTripsProvider>
  );
}
