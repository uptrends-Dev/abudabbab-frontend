'use client'
import React from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./adminHeader";

const Adminpro = () => {
      const pathname = usePathname();

  if (pathname != "/dashboard/login") return <AdminHeader/>;
};

export default Adminpro;
