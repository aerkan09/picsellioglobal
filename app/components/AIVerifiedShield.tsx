"use client";

import { motion } from "framer-motion";

export function AIVerifiedShield({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-[var(--accent-green)] bg-[var(--accent-green)]/20 shadow-[0_0_40px_rgba(34,197,94,0.4)] md:h-56 md:w-56 lg:h-64 lg:w-64">
        <svg className="absolute inset-0 h-full w-full text-[var(--accent-green)]" viewBox="0 0 200 200" fill="none">
          <path
            d="M100 20L40 55v90l60 35 60-35V55L100 20z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-green)] md:h-16 md:w-16">
            <svg className="h-8 w-8 text-[var(--bg-dark-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 6v10l8 6 8-6V6l-8-4z" />
              <path d="M9 12l2 2 4-4" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white md:text-xl">Picsellio</span>
          <span className="rounded-full bg-[var(--accent-green)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--bg-dark-blue)]">
            AI Verified
          </span>
        </div>
      </div>
    </motion.div>
  );
}
