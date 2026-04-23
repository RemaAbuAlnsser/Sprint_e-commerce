'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, ShoppingCart } from 'lucide-react'

interface ToastProps {
  show: boolean
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ show, message, onClose, duration = 3000 }: ToastProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!mounted) return null

  const toastContent = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 right-4 z-[10000] pointer-events-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-primary p-4 flex items-center gap-3 min-w-[280px] max-w-[350px]">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-primary text-sm">تمت الإضافة!</p>
              <p className="text-gray-600 text-xs mt-0.5">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(toastContent, document.body)
}
