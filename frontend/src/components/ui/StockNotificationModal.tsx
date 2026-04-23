'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StockNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  variantId: string
  productTitle: string
  onSubscribe: () => void
}

export default function StockNotificationModal({
  isOpen,
  onClose,
  productId,
  variantId,
  productTitle,
  onSubscribe
}: StockNotificationModalProps) {
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleConfirm = () => {
    onSubscribe()
    setSuccess(true)
    setTimeout(() => {
      onClose()
      setSuccess(false)
    }, 1500)
  }

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Full Screen Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-xl"
            onClick={onClose}
            style={{ backdropFilter: 'blur(20px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            dir="rtl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>

            {/* Content */}
            <div className="p-8 pt-10">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                أخبرني عند توفر المنتج
              </h2>

              {/* Description */}
              <p className="text-center text-gray-500 text-sm mb-6 leading-relaxed">
                سنقوم بإعلامك عندما يصبح هذا المنتج متوفراً في المرة القادمة التي تزور فيها الموقع
              </p>

              {/* Success Message */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                >
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-700 font-semibold">
                    تم التسجيل بنجاح!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    سنخبرك عندما يتوفر المنتج
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Product Name Display */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">المنتج:</p>
                    <p className="font-semibold text-gray-900">{productTitle}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      نعم، أخبرني
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
