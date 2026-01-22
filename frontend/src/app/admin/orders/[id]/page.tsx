'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Package, User, Phone, MapPin, Calendar, CreditCard, Truck } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

interface OrderDetails {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://104.234.26.192:3000/orders/${orderId}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const getShippingMethodText = (method: string) => {
    switch (method) {
      case 'express': return 'الضفة';
      case 'standard': return 'القدس';
      case 'internal': return 'الداخل';
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-[#8b7355] animate-pulse" />
          <p className="text-lg text-[#8b7355]">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg text-red-500">لم يتم العثور على الطلب</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="mt-4 px-6 py-2 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a]"
          >
            العودة للطلبات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight size={24} className="text-[#2c2c2c]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#2c2c2c]">تفاصيل الطلب #{order.id}</h1>
            <p className="text-[#8b7355] mt-1">
              {new Date(order.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className={`px-6 py-3 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* معلومات العميل والشحن */}
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات العميل */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] p-6">
            <h2 className="text-xl font-bold text-[#2c2c2c] mb-4 flex items-center gap-2">
              <User size={24} />
              معلومات العميل
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User size={20} className="text-[#8b7355] mt-1" />
                <div>
                  <p className="text-sm text-[#8b7355]">الاسم</p>
                  <p className="font-bold text-[#2c2c2c]">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#8b7355] mt-1" />
                <div>
                  <p className="text-sm text-[#8b7355]">رقم الجوال</p>
                  <p className="font-bold text-[#2c2c2c]">{order.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#8b7355] mt-1" />
                <div>
                  <p className="text-sm text-[#8b7355]">المدينة</p>
                  <p className="font-bold text-[#2c2c2c]">{order.customer_city}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin size={20} className="text-[#8b7355] mt-1" />
                <div>
                  <p className="text-sm text-[#8b7355]">العنوان الكامل</p>
                  <p className="font-bold text-[#2c2c2c]">{order.customer_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الشحن والدفع */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] p-6">
            <h2 className="text-xl font-bold text-[#2c2c2c] mb-4 flex items-center gap-2">
              <Truck size={24} />
              معلومات الشحن والدفع
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-[#8b7355] mt-1" />
                <div>
                  <p className="text-sm text-[#8b7355]">طريقة الشحن</p>
                  <p className="font-bold text-[#2c2c2c]">{getShippingMethodText(order.shipping_method)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-[#8b7355] mt-1" />
                <div>
                  <p className="text-sm text-[#8b7355]">طريقة الدفع</p>
                  <p className="font-bold text-[#2c2c2c]">
                    {order.payment_method === 'cash' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* المنتجات */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] p-6">
            <h2 className="text-xl font-bold text-[#2c2c2c] mb-4 flex items-center gap-2">
              <Package size={24} />
              المنتجات ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border-2 border-[#e8e8c8] rounded-xl hover:border-[#8b7355] transition-colors">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image
                        src={`http://104.234.26.192:3000${item.image_url}`}
                        alt={item.product_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#2c2c2c] mb-1">{item.product_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-[#8b7355]">
                      <span>السعر: ₪{Number(item.product_price).toFixed(2)}</span>
                      <span>الكمية: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-[#2c2c2c]">₪{Number(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] p-6 sticky top-8">
            <h2 className="text-xl font-bold text-[#2c2c2c] mb-6">ملخص الطلب</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-[#8b7355]">
                <span>المجموع الفرعي</span>
                <span className="font-bold">₪{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8b7355]">
                <span>تكلفة الشحن</span>
                <span className="font-bold">₪{Number(order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-[#e8e8c8] pt-4 flex justify-between text-xl font-bold text-[#2c2c2c]">
                <span>المجموع الكلي</span>
                <span className="text-[#d4af37]">₪{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
