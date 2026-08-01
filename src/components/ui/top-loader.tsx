"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-emerald-500 z-[9999] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
  );
}
