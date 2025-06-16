"use client"

import { motion } from "framer-motion"

export function DashboardHeader() {
  return (
    <header className="py-4 pb-2 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">PodInsightHQ</h1>
          <p className="mt-1 text-sm md:text-base text-white/60">1,000 hours of podcast intelligence, visualized</p>
        </motion.div>
      </div>
    </header>
  )
}
