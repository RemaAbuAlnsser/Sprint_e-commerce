'use client';

import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import SuccessModal from '@/components/SuccessModal';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    phone: '',
    address: '',
    shippingMethod: 'express',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (items.length === 0 && !showSuccessModal) {
      router.push('/cart');
    }
  }, [items.length, router, showSuccessModal]);

  const shippingCosts = {
    express: 20.0,
    standard: 30.0,
    internal: 70.0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من رقم الجوال
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('يرجى إدخال رقم جوال صحيح (10 أرقام تبدأ بـ 05)\nمثال: 0501234567');
      return;
    }
    
    try {
      const orderData = {
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_city: formData.city,
        customer_address: formData.address,
        shipping_method: formData.shippingMethod,
        shipping_cost: shippingCost,
        payment_method: formData.paymentMethod,
        subtotal: totalPrice,
        total: finalTotal,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        console.log('Order successful! Order ID:', result.orderId);
        setOrderId(result.orderId);
        console.log('Setting showSuccessModal to true');
        setShowSuccessModal(true);
        console.log('Clearing cart');
        clearCart();
      } else {
        console.error('Order failed:', result);
        
        // إذا كانت هناك منتجات غير متوفرة، عرض تفاصيلها
        if (result.unavailableProducts && result.unavailableProducts.length > 0) {
          let errorMessage = result.message + '\n\n';
          result.unavailableProducts.forEach((product: any) => {
            errorMessage += `• ${product.name}: ${product.reason}\n`;
          });
          errorMessage += '\nيرجى تحديث السلة والمحاولة مرة أخرى.';
          alert(errorMessage);
        } else {
          alert('حدث خطأ أثناء إرسال الطلب: ' + (result.message || 'خطأ غير معروف') + '\n' + (result.error || ''));
        }
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.\nالخطأ: ' + (error?.message || error));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const shippingCost = shippingCosts[formData.shippingMethod as keyof typeof shippingCosts];
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0 && !showSuccessModal) {
    return null;
  }

  console.log('Render - showSuccessModal:', showSuccessModal, 'orderId:', orderId);

  return (
    <>
      {showSuccessModal && orderId ? (
        <SuccessModal
          orderId={orderId}
          onClose={() => {
            console.log('Modal closing');
            setShowSuccessModal(false);
            router.push('/');
          }}
        />
      ) : null}
      <div className="min-h-screen bg-gray-50">
        <Header />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2c2c] mb-8 text-center">
          إتمام الطلب
        </h1>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* قسم ملخص الطلب */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#2c2c2c] mb-4">ملخص الطلب</h2>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color_name || 'default'}`} className="flex gap-3 pb-3 border-b">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {(item.color_image_url || item.image_url) ? (
                        <Image
                          src={`http://localhost:3000${item.color_image_url || item.image_url}`}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl opacity-20">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#2c2c2c] line-clamp-1">
                        {item.name}
                      </h3>
                      {item.color_name && (
                        <p className="text-xs text-gray-500">اللون: {item.color_name}</p>
                      )}
                      <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                      <p className="text-sm font-bold text-[#2c2c2c]">
                        {(Number(item.price) * item.quantity).toFixed(2)} ₪
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold">{totalPrice.toFixed(2)} ₪</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className="font-semibold">{shippingCost.toFixed(2)} ₪</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#2c2c2c] pt-2 border-t">
                  <span>الإجمالي</span>
                  <span className="text-[#d4af37]">{finalTotal.toFixed(2)} ₪</span>
                </div>
              </div>
            </div>
          </div>

          {/* قسم الفاتورة والشحن */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات الفاتورة والشحن */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-[#2c2c2c] mb-6">الفاتورة والشحن</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2c2c2c] mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent outline-none transition-all"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2c2c2c] mb-2">
                      المدينة *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent outline-none transition-all"
                      placeholder="المدينة"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#2c2c2c] mb-2">
                      العنوان الكامل (الشارع والبناية) *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent outline-none transition-all resize-none"
                      placeholder="أدخل عنوانك بالتفصيل"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#2c2c2c] mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="^05\d{8}$"
                      maxLength={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent outline-none transition-all"
                      placeholder="05xxxxxxxx"
                      title="يرجى إدخال رقم جوال صحيح (10 أرقام تبدأ بـ 05)"
                    />
                  </div>
                </div>
              </div>

              {/* مناطق التوصيل */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-[#2c2c2c] mb-6">مناطق التوصيل</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-[#d4af37] bg-purple-50 rounded-lg cursor-pointer transition-all hover:bg-purple-100">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#2c2c2c] focus:ring-[#2c2c2c]"
                    />
                    <MapPin className="w-5 h-5 text-[#2c2c2c]" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#2c2c2c]">الضفة</div>
                      <div className="text-sm text-gray-600">₪ 20.00</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-[#2c2c2c] hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#2c2c2c] focus:ring-[#2c2c2c]"
                    />
                    <MapPin className="w-5 h-5 text-[#2c2c2c]" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#2c2c2c]">القدس</div>
                      <div className="text-sm text-gray-600">₪ 30.00</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-[#2c2c2c] hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="internal"
                      checked={formData.shippingMethod === 'internal'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#2c2c2c] focus:ring-[#2c2c2c]"
                    />
                    <MapPin className="w-5 h-5 text-[#2c2c2c]" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#2c2c2c]">الداخل</div>
                      <div className="text-sm text-gray-600">₪ 70.00</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* معلومات الدفع */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-[#2c2c2c] mb-6">معلومات الدفع</h2>
                
                <label className="flex items-start gap-3 p-4 border-2 border-[#d4af37] bg-purple-50 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#2c2c2c] focus:ring-[#2c2c2c] mt-1"
                  />
                  <div>
                    <div className="font-semibold text-[#2c2c2c] mb-1">الدفع عند الاستلام</div>
                    <div className="text-sm text-gray-600">
                      عند استلام الطلب، يمكنك الدفع نقداً عن طريق بطاقة الائتمان، وفق سياسة الخصوصية.
                    </div>
                  </div>
                </label>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="flex-1 py-3 border-2 border-[#2c2c2c] text-[#2c2c2c] rounded-full hover:bg-gray-50 transition-colors font-semibold"
                >
                  العودة للسلة
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold text-lg"
                >
                  تأكيد الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
