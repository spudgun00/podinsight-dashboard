"use client"

import { motion } from "framer-motion"
import { DataModeToggle } from "./DataModeToggle"

export function DashboardHeader() {
  return (
    <header className="py-2 px-4 md:px-8 border-b intel-border-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight intel-text-primary">PodInsightHQ</h1>
            <p className="text-sm intel-text-secondary">1,000 hours of podcast intelligence, visualized</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DataModeToggle />
          </motion.div>
        </div>
      </div>
    </header>
  )
}
