'use client'
import React from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./adminHeader";

const Adminpro = () => {
      const pathname = usePathname();

  if (pathname != "/login") return <AdminHeader/>;
};

export default Adminpro;
