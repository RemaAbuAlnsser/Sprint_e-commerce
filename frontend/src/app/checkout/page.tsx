'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cart-store';
import { ShoppingCart, Truck, MapPin } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shippingCost, setShippingCost] = useState(2000); // Default: West Bank 20.00
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        email: formData.email,
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          postal_code: '00000',
          phone: formData.phone,
        },
        items: items.map(item => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
          color: item.color,
        })),
        payment_method: 'cash_on_delivery',
        notes: formData.notes,
      };

      const res = await fetch(`${API_URL}/store/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء الطلب');
      }

      clearCart();
      router.push(`/order-success?orderId=${data.order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">السلة فارغة</h1>
          <p className="text-gray-600 mb-4">أضف منتجات للمتابعة</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            تصفح المنتجات
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />
      <main className="flex-1">

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-gray-900">الفوترة والشحن</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right text-gray-900 placeholder:text-gray-400"
                      placeholder="الاسم الكامل"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right text-gray-900 placeholder:text-gray-400"
                      placeholder="المدينة"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right text-gray-900 placeholder:text-gray-400"
                      placeholder="العنوان (الشارع والمبنى)"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right text-gray-900 placeholder:text-gray-400"
                      placeholder="رقم الجوال *"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-gray-900">مناطق التوصيل</h2>
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingCost === 2000 ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={shippingCost === 2000}
                        onChange={() => setShippingCost(2000)}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className="font-medium text-gray-800">الضفة الغربية: 20.00 ₪</span>
                    </div>
                    <MapPin className={`w-5 h-5 ${shippingCost === 2000 ? 'text-primary' : 'text-gray-400'}`} />
                  </label>
                  <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingCost === 3000 ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={shippingCost === 3000}
                        onChange={() => setShippingCost(3000)}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className="font-medium text-gray-800">القدس: 30.00 ₪</span>
                    </div>
                    <MapPin className={`w-5 h-5 ${shippingCost === 3000 ? 'text-primary' : 'text-gray-400'}`} />
                  </label>
                  <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingCost === 7000 ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={shippingCost === 7000}
                        onChange={() => setShippingCost(7000)}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className="font-medium text-gray-800">الداخل: 70.00 ₪</span>
                    </div>
                    <MapPin className={`w-5 h-5 ${shippingCost === 7000 ? 'text-primary' : 'text-gray-400'}`} />
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-gray-900">معلومات الدفع</h2>
                <label className="flex items-start gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                  <input type="radio" checked readOnly className="w-5 h-5 accent-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">الدفع عند الاستلام</p>
                    <p className="text-sm text-gray-600 mt-1">عند تأكيد الطلب فأنت توافق على سياسة التبديل والإرجاع ، وعلى سياسة الخصوصية.</p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-6 pb-4 border-b text-gray-900">ملخص الطلب</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 text-gray-900">{item.title}</p>
                      <p className="text-gray-500 text-sm mt-1">الكمية: {item.quantity}</p>
                      <p className="font-bold text-sm mt-1 text-gray-900">{((item.price * item.quantity) / 100).toFixed(2)} ₪</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الإجمالي الفرعي</span>
                  <span className="font-medium text-gray-900">{(getTotal() / 100).toFixed(2)} ₪</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-medium text-gray-900">{(shippingCost / 100).toFixed(2)} ₪</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span className="text-gray-900">الإجمالي</span>
                  <span className="text-primary">{((getTotal() + shippingCost) / 100).toFixed(2)} ₪</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
