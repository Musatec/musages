"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // On commence le chargement quand le chemin change (différé pour éviter les rendus en cascade)
    const startTimer = setTimeout(() => setLoading(true), 0);
    
    // On simule une fin de chargement rapide (ou on attend que le rendu soit fait)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
        clearTimeout(startTimer);
        clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed top-0 left-0 h-[3px] bg-primary z-[9999] shadow-[0_0_10px_rgba(249,115,22,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
