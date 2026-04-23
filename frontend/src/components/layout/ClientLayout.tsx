'use client'

import { useEffect, useState } from 'react'
import StockAvailableNotification from '@/components/ui/StockAvailableNotification'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {children}
      {mounted && <StockAvailableNotification />}
    </>
  )
}
