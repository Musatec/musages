"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setLoading(true);
    }, 0);
    const endTimer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3.5px] z-[99999] overflow-hidden bg-emerald-950/20 backdrop-blur-xs">
      <div 
        className="h-full w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.9)] transition-all duration-500 ease-out animate-pulse"
        style={{
          animation: "topLoaderSwipe 1.2s ease-in-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes topLoaderSwipe {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
