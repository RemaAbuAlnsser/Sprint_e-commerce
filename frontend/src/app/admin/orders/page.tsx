'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import { Package, Clock, CheckCircle, XCircle, Search, Phone, MapPin, Mail, Calendar } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Order {
  id: string;
  display_id: number;
  email: string;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  shipping_address: any;
  created_at: string;
  items?: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'completed' | 'all'>('new');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/store/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data.order);
      setShowModal(true);
    } catch (error) {
      // Error handled silently
    }
  };

  const updateOrderStatus = async (orderId: string, updates: any) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder) setSelectedOrder({ ...selectedOrder, ...updates });
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setUpdating(false);
    }
  };

  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<{ show: boolean; id: string }>({ show: false, id: '' });

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchOrders();
        if (showModal) setShowModal(false);
      }
    } catch (error) {
      // handled silently
    } finally {
      setConfirmDeleteOrder({ show: false, id: '' });
    }
  };

  const formatPrice = (p: number) => (p / 100).toFixed(2) + ' ₪';
  const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatShortDate = (d: string) => new Date(d).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'قيد الانتظار', processing: 'قيد المعالجة', completed: 'مكتمل', cancelled: 'ملغي',
      awaiting: 'في انتظار الدفع', paid: 'مدفوع', refunded: 'مسترد',
      not_fulfilled: 'غير مشحون', partially_fulfilled: 'شحن جزئي', fulfilled: 'تم التجهيز', shipped: 'تم الشحن', delivered: 'تم التوصيل',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30', 
      paid: 'bg-green-500/20 text-green-400 border-green-500/30', 
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
      awaiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30', 
      refunded: 'bg-red-500/20 text-red-400 border-red-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30', 
      fulfilled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      not_fulfilled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (activeTab === 'new') {
      filtered = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    } else if (activeTab === 'completed') {
      filtered = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');
    }

    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.display_id.toString().includes(searchQuery) ||
        o.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.shipping_address?.first_name + ' ' + o.shipping_address?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [orders, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const newOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return { newOrders, completedOrders, totalRevenue, pendingOrders };
  }, [orders]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">إدارة الطلبات</h1>
        <p className="text-gray-400">متابعة وإدارة طلبات العملاء</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-5 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                  <div className="w-12 h-8 bg-gray-700 rounded" />
                </div>
                <div className="w-20 h-4 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
          
          {/* Tabs Skeleton */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-10 bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Orders Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="w-32 h-8 bg-gray-700 rounded" />
                        <div className="w-40 h-4 bg-gray-700 rounded" />
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="w-24 h-8 bg-gray-700 rounded" />
                        <div className="w-20 h-4 bg-gray-700 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                        <div className="w-24 h-5 bg-gray-700 rounded" />
                        <div className="w-full h-4 bg-gray-700 rounded" />
                        <div className="w-3/4 h-4 bg-gray-700 rounded" />
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                        <div className="w-24 h-5 bg-gray-700 rounded" />
                        <div className="w-full h-4 bg-gray-700 rounded" />
                        <div className="w-3/4 h-4 bg-gray-700 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="w-20 h-7 bg-gray-700 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2 lg:w-32">
                    <div className="flex-1 h-12 bg-gray-700 rounded-lg" />
                    <div className="flex-1 h-12 bg-gray-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-yellow-400">{stats.newOrders}</span>
              </div>
              <p className="text-gray-400 text-sm">طلبات جديدة</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-blue-400">{stats.pendingOrders}</span>
              </div>
              <p className="text-gray-400 text-sm">قيد الانتظار</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-green-400">{stats.completedOrders}</span>
              </div>
              <p className="text-gray-400 text-sm">مكتملة</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💰</span>
                <span className="text-2xl font-bold text-purple-400">{formatPrice(stats.totalRevenue)}</span>
              </div>
              <p className="text-gray-400 text-sm">إجمالي المبيعات</p>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 min-w-[100px] px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    activeTab === 'new'
                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  جديدة ({stats.newOrders})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 min-w-[100px] px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    activeTab === 'completed'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  مكتملة ({stats.completedOrders})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 min-w-[100px] px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    activeTab === 'all'
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  الكل ({orders.length})
                </button>
              </div>

              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، البريد، أو الاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 text-white pr-10 pl-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-400">لا توجد طلبات</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'ستظهر الطلبات هنا عندما يقوم العملاء بالشراء'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" dir="rtl">
              {filteredOrders.map((order) => {
                const address = order.shipping_address;
                const isNew = order.status !== 'completed' && order.status !== 'cancelled';
                
                return (
                  <div
                    key={order.id}
                    className={`bg-gray-800 rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                      isNew ? 'border-yellow-500/30 hover:border-yellow-500/50' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Order Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-white">طلب #{order.display_id}</h3>
                              {isNew && (
                                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                  جديد
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-3xl font-bold text-green-400">{formatPrice(order.total)}</p>
                            <p className="text-gray-500 text-sm">المبلغ الإجمالي</p>
                          </div>
                        </div>

                        {/* Customer & Shipping Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                            <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              معلومات العميل
                            </h4>
                            <div className="space-y-1">
                              <p className="text-white font-medium">
                                {address?.first_name} {address?.last_name}
                              </p>
                              <p className="text-gray-400 text-sm">{order.email}</p>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Phone className="w-4 h-4" />
                                <span className="font-mono">{address?.phone || 'غير متوفر'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                            <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              عنوان التوصيل
                            </h4>
                            <div className="space-y-1">
                              <p className="text-white">{address?.city}</p>
                              <p className="text-gray-400 text-sm leading-relaxed">{address?.address_1}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.payment_status)}`}>
                            💳 {getStatusLabel(order.payment_status)}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.fulfillment_status)}`}>
                            📦 {getStatusLabel(order.fulfillment_status)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:w-32">
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="flex-1 lg:flex-none bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                          عرض التفاصيل
                        </button>
                        {isNew && (
                          <button
                            onClick={() => updateOrderStatus(order.id, { status: 'completed', fulfillment_status: 'delivered' })}
                            className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                          >
                            تم التوصيل ✓
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDeleteOrder({ show: true, id: order.id })}
                          className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl w-full max-w-3xl my-4 sm:my-8" dir="rtl">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">طلب #{selectedOrder.display_id}</h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-3xl leading-none flex-shrink-0 mr-2">×</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-5">
                  <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    معلومات العميل
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">الاسم</p>
                      <p className="text-white font-medium">
                        {selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">البريد الإلكتروني</p>
                      <p className="text-white">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">رقم الهاتف</p>
                      <p className="text-white font-mono">{selectedOrder.shipping_address?.phone || 'غير متوفر'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-5">
                  <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    عنوان التوصيل
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">المدينة</p>
                      <p className="text-white font-medium">{selectedOrder.shipping_address?.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">العنوان الكامل</p>
                      <p className="text-white leading-relaxed">{selectedOrder.shipping_address?.address_1}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-700/50 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4">تحديث حالة الطلب</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">حالة الطلب</label>
                    <select 
                      value={selectedOrder.status} 
                      onChange={(e) => updateOrderStatus(selectedOrder.id, { status: e.target.value })} 
                      disabled={updating} 
                      className="w-full bg-gray-700 text-white px-3 py-2.5 rounded-lg text-sm border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">حالة الدفع</label>
                    <select 
                      value={selectedOrder.payment_status} 
                      onChange={(e) => updateOrderStatus(selectedOrder.id, { payment_status: e.target.value })} 
                      disabled={updating} 
                      className="w-full bg-gray-700 text-white px-3 py-2.5 rounded-lg text-sm border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="awaiting">في انتظار الدفع</option>
                      <option value="paid">مدفوع</option>
                      <option value="refunded">مسترد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">حالة الشحن</label>
                    <select 
                      value={selectedOrder.fulfillment_status} 
                      onChange={(e) => updateOrderStatus(selectedOrder.id, { fulfillment_status: e.target.value })} 
                      disabled={updating} 
                      className="w-full bg-gray-700 text-white px-3 py-2.5 rounded-lg text-sm border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="not_fulfilled">غير مشحون</option>
                      <option value="fulfilled">تم التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    المنتجات ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="bg-gray-700/50 rounded-lg p-4 flex gap-4 items-center">
                        {/* Product Image */}
                        {item.thumbnail && (
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
                            <img
                              src={item.thumbnail.startsWith('http') ? item.thumbnail : `${API_URL}${item.thumbnail}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium mb-1 truncate">{item.title}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-gray-400">الكمية: <span className="text-white font-semibold">{item.quantity}</span></span>
                            <span className="text-gray-400">السعر: <span className="text-white">{formatPrice(item.unit_price)}</span></span>
                            {item.color && (
                              <span className="text-gray-400">اللون: <span className="text-purple-400 font-semibold">{item.color}</span></span>
                            )}
                          </div>
                        </div>
                        
                        {/* Total Price */}
                        <p className="text-green-400 font-bold text-lg flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4">ملخص الطلب</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-white font-bold text-2xl">
                    <span>الإجمالي</span>
                    <span className="text-green-400">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-700 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                إغلاق
              </button>
              <button 
                onClick={() => setConfirmDeleteOrder({ show: true, id: selectedOrder.id })}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                حذف الطلب
              </button>
              {selectedOrder.status !== 'completed' && (
                <button 
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, { status: 'completed', fulfillment_status: 'delivered' });
                    setShowModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  تم التوصيل ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDeleteOrder.show}
        title="حذف الطلب"
        message="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => deleteOrder(confirmDeleteOrder.id)}
        onCancel={() => setConfirmDeleteOrder({ show: false, id: '' })}
      />
    </AdminLayout>
  );
}
