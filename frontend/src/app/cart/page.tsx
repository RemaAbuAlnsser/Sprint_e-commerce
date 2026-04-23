'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/store/cart-store'

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateColor, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900">سلة التسوق فارغة</h1>
              <p className="text-gray-500 mb-8">
                لم تقم بإضافة أي منتجات إلى السلة بعد
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                تصفح المنتجات
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">سلة التسوق</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl p-4"
                >
                  <div className="flex gap-4">
                    {/* Product Image - shows color image if selected */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {(item.colorImage || item.thumbnail) ? (
                        <img 
                          src={item.colorImage || item.thumbnail} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-gray-900">{item.title}</h3>
                      <p className="text-primary font-bold mb-1">{(item.price / 100).toFixed(2)} ₪</p>
                      {item.color && (
                        <p className="text-sm text-gray-500">اللون: {item.color}</p>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  {item.availableColors && item.availableColors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-700 mb-2 font-medium">اللون *</p>
                      <div className="flex flex-wrap gap-2">
                        {item.availableColors.map((color) => {
                          const isOutOfStock = (color.inventory_quantity || 0) <= 0;
                          const isSelected = item.color === color.color_name;
                          return (
                            <button
                              key={color.id}
                              onClick={() => !isOutOfStock && updateColor(item.variantId, color.color_name, color.image_url)}
                              disabled={isOutOfStock}
                              className={`relative group ${
                                isOutOfStock
                                  ? 'opacity-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'ring-[3px] ring-primary ring-offset-2'
                                    : 'ring-1 ring-gray-200 hover:ring-primary'
                              } rounded-xl overflow-hidden transition-all`}
                            >
                              <div className={`w-20 h-20 ${isOutOfStock ? 'grayscale' : ''}`}>
                                {color.image_url ? (
                                  <img 
                                    src={color.image_url} 
                                    alt={color.color_name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                    <span className="text-lg">🎨</span>
                                  </div>
                                )}
                              </div>
                              {/* شارة نفذت الكمية */}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    نفد
                                  </span>
                                </div>
                              )}
                              {/* علامة الاختيار */}
                              {isSelected && !isOutOfStock && (
                                <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                              {/* اسم اللون */}
                              <p className={`text-[10px] text-center py-1 truncate px-1 ${
                                isSelected ? 'bg-primary text-white font-bold' : 'bg-gray-50 text-gray-700'
                              }`}>{color.color_name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-red-500 hover:underline text-sm"
            >
              إفراغ السلة
            </button>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-900">ملخص الطلب</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">الإجمالي</span>
                  <span className="text-primary">{(total / 100).toFixed(2)} ₪</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-center"
              >
                إتمام الشراء
              </Link>
              
              {/* Continue Shopping */}
              <Link
                href="/"
                className="block text-center mt-4 text-primary hover:underline"
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
