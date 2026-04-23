'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { API_URL } from '@/lib/api';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/store/orders/${orderId}`);
      const data = await res.json();
      setOrder(data.order);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="text-gray-600">جاري التحميل...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />
      <main className="flex-1">

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">تم استلام طلبك بنجاح!</h1>
            <p className="text-gray-600">شكراً لك على الطلب من متجرنا</p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">تفاصيل الطلب</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب</span>
                <span className="font-semibold text-gray-900">#{order?.display_id || orderId?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">البريد الإلكتروني</span>
                <span className="font-semibold text-gray-900">{order?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع</span>
                <span className="font-semibold text-primary">{((order?.total || 0) / 100).toFixed(2)} ₪</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الدفع</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">في انتظار الدفع</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">الخطوات التالية</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">تجهيز الطلب</h3>
                  <p className="text-sm text-gray-600">غضون ساعات </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">الشحن والتوصيل</h3>
                  <p className="text-sm text-gray-600">خلال 1-2 يوم</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90"
            >
              العودة للرئيسية
            </button>
            <button
              onClick={() => router.push('/products')}
              className="flex-1 bg-white border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 text-gray-900"
            >
              تصفح المنتجات
            </button>
          </div>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="text-gray-600">جاري التحميل...</div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
