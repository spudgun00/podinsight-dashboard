"use client"

import { motion } from "framer-motion"

export function DashboardHeader() {
  return (
    <header className="py-2 px-4 md:px-8 border-b intel-border-subtle">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight intel-text-primary">PodInsightHQ</h1>
          <p className="text-sm intel-text-secondary">1,000 hours of podcast intelligence, visualized</p>
        </motion.div>
      </div>
    </header>
  )
}
