'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { getStockNotificationObserver, ProductInterest } from '@/services/StockNotificationObserver'

export default function StockAvailableNotification() {
  const [availableProducts, setAvailableProducts] = useState<ProductInterest[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const observer = getStockNotificationObserver()
    
    // Check for available products on mount
    checkStockAvailability()
    
    // Start periodic checking (every 30 seconds)
    observer.startStockChecking(30000)
    
    // Subscribe to observer updates
    const unsubscribe = observer.subscribe((products) => {
      // This will be called whenever the interested products list changes
      console.log('Observer notified - interested products updated:', products.length)
    })
    
    // Cleanup on unmount
    return () => {
      unsubscribe()
      observer.stopStockChecking()
    }
  }, [])

  const checkStockAvailability = async () => {
    const observer = getStockNotificationObserver()
    const available = await observer.checkStockAvailability()
    
    if (available.length > 0) {
      setAvailableProducts(available)
      setIsVisible(true)
    }
  }

  const handleAddToCart = () => {
    const product = availableProducts[currentIndex]
    
    if (product) {
      addItem({
        id: product.productId,
        variantId: product.variantId,
        title: product.productTitle,
        price: product.variantPrice || 0,
        quantity: 1,
        thumbnail: product.productImage,
      })
      
      // Show next notification or close
      handleNext()
    }
  }

  const handleNext = () => {
    if (currentIndex < availableProducts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    
    // If there are more notifications, show them after a delay
    if (currentIndex < availableProducts.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsVisible(true)
      }, 500)
    }
  }

  const currentProduct = availableProducts[currentIndex]

  return (
    <AnimatePresence>
      {isVisible && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
          />

          {/* Notification Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto"
            dir="rtl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Celebration Effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>

            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                >
                  <Package className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-center text-gray-900 mb-2"
              >
                🎉 المنتج متوفر الآن!
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-600 mb-6"
              >
                المنتج الذي كنت مهتماً به أصبح متوفراً الآن!
              </motion.p>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    {currentProduct.productImage ? (
                      <img
                        src={currentProduct.productImage}
                        alt={currentProduct.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
                      {currentProduct.productTitle}
                    </h3>
                    <p className="text-lg font-bold text-green-600">
                      ₪{((currentProduct.variantPrice || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 transform hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>أضف للسلة</span>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  {currentIndex < availableProducts.length - 1 ? 'التالي' : 'إغلاق'}
                </button>
              </motion.div>

              {/* Counter */}
              {availableProducts.length > 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-sm text-gray-500 mt-4"
                >
                  {currentIndex + 1} من {availableProducts.length}
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
