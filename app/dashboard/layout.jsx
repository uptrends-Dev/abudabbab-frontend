// app/dashboard/layout.tsx  (Server Component)
import { whoisme } from "../../lib/apis/api";
import Adminpro from "../../components/admin/Adminpro";
import CallBackLogOut from "../../components/utils/CallBackLogOutt";
import { MobProvider } from "@/components/Provides/mobProvider";

async function getUserData() {
  try {
    await whoisme();
    return true;
  } catch {
    return false;
  }
}

export default async function DashboardLayout({ children }) {
  const authed = await getUserData();
  if (!authed) {
    // You could also just: redirect("/login");
    return <CallBackLogOut />;
  }

  return (
    <MobProvider>
      <div className="flex">
        <Adminpro />
        <div className={`bg-white min-h-screen w-full  xl:ml-[350px]`}>
          {children}
        </div>
      </div>
    </MobProvider>
  );
}
