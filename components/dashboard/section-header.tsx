"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeader({ icon, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div className="flex items-center gap-4">
        <motion.div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-intel-gray">{subtitle}</p>}
        </div>
      </div>
      {action && action}
    </div>
  )
}