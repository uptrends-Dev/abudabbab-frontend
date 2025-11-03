"use client";

import { usePathname } from "next/navigation";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

const MobContext = createContext(undefined);

export function MobProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const toggle = useCallback(() =>   setIsMobile((t) => !t), []);
  const open = useCallback(() =>   setIsMobile(true), []);
  const close = useCallback(() =>   setIsMobile(false), []);

  const value = useMemo(
    () => ({ isMobile, setIsMobile, toggle, open, close }),
    [isMobile, toggle, open, close]
  );

  return <MobContext.Provider value={value}>{children}</MobContext.Provider>;
}

export function useMob() {
  const ctx = useContext(MobContext);
  if (!ctx) throw new Error("useMob must be used inside <MobProvider>");
  return ctx;
}
