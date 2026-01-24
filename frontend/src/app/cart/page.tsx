'use client';
import { API_URL } from '@/lib/api';

import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🛒</div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2c2c2c] mb-4">
              سلة التسوق فارغة
            </h2>
            <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات بعد</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold"
            >
              تصفح المنتجات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#2c2c2c] hover:text-[#d4af37] transition-colors mb-6 md:mb-8 group"
        >
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-semibold">متابعة التسوق</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#2c2c2c]">
                  سلة التسوق ({items.length} {items.length === 1 ? 'منتج' : 'منتجات'})
                </h1>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
                >
                  إفراغ السلة
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color_name || 'default'}`}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {(item.color_image_url || item.image_url) ? (
                        <Image
                          src={`${API_URL}${item.color_image_url || item.image_url}`}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl opacity-20">📦</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-[#2c2c2c] text-lg mb-1">
                          {item.name}
                        </h3>
                        {item.color_name && (
                          <p className="text-gray-600 text-sm mb-1">
                            اللون: {item.color_name}
                          </p>
                        )}
                        <p className="text-[#d4af37] font-bold text-xl">
                          {Number(item.price).toFixed(2)} ₪
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.color_name)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-[#2c2c2c] hover:text-white transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.color_name)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-[#2c2c2c] hover:text-white transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.color_name)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end justify-between">
                      <p className="text-sm text-gray-500">المجموع</p>
                      <p className="text-xl font-bold text-[#2c2c2c]">
                        {(Number(item.price) * item.quantity).toFixed(2)} ₪
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#2c2c2c] mb-6">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold">{totalPrice.toFixed(2)} ₪</span>
                </div>
                {/* <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className="font-semibold">مجاني</span>
                </div> */}
                <div className="border-t pt-4 flex justify-between text-lg font-bold text-[#2c2c2c]">
                  <span>المجموع الكلي</span>
                  <span className="text-[#d4af37]">{totalPrice.toFixed(2)} ₪</span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full py-3 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold text-lg mb-3"
              >
                إتمام الطلب
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border-2 border-[#2c2c2c] text-[#2c2c2c] rounded-full hover:bg-gray-50 transition-colors font-semibold"
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
