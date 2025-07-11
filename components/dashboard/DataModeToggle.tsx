'use client';

import { useDemoMode } from '@/contexts/DataModeContext';
import { motion } from 'framer-motion';

export function DataModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium transition-colors ${
        !isDemoMode ? 'text-white' : 'text-gray-400'
      }`}>
        Live Data
      </span>
      
      <button
        onClick={toggleDemoMode}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 focus:ring-offset-gray-900"
        style={{
          backgroundColor: isDemoMode ? '#8B5CF6' : '#374151'
        }}
        aria-label="Toggle demo mode"
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          animate={{
            x: isDemoMode ? 24 : 2
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </button>
      
      <span className={`text-sm font-medium transition-colors ${
        isDemoMode ? 'text-brand-purple' : 'text-gray-400'
      }`}>
        Demo Mode
      </span>

      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-2 px-2 py-0.5 bg-brand-purple/20 border border-brand-purple/30 rounded text-xs text-brand-purple font-medium"
        >
          DEMO
        </motion.div>
      )}
    </div>
  );
}