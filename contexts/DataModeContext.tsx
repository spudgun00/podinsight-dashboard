"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface DataModeContextType {
  isLiveData: boolean
  setIsLiveData: (value: boolean) => void
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined)

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const [isLiveData, setIsLiveData] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dataMode')
    if (stored === 'live') {
      setIsLiveData(true)
    }
  }, [])

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dataMode', isLiveData ? 'live' : 'demo')
  }, [isLiveData])

  return (
    <DataModeContext.Provider value={{ isLiveData, setIsLiveData }}>
      {children}
    </DataModeContext.Provider>
  )
}

export function useDataMode() {
  const context = useContext(DataModeContext)
  if (!context) {
    throw new Error('useDataMode must be used within a DataModeProvider')
  }
  return context
}