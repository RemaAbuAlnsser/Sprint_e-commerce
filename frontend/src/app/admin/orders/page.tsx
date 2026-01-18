'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle,
  Clock,
  Banknote,
  Eye,
  Trash2,
  Search,
  Filter,
  Phone,
  MapPin,
} from 'lucide-react';

interface Order {
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
  items_count: number;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery) ||
        order.id.toString().includes(searchQuery)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('تم حذف الطلب بنجاح!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('حدث خطأ أثناء حذف الطلب');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert('تم تحديث حالة الطلب بنجاح!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
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
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغية';
      default:
        return status;
    }
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + Number(o.total), 0),
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c2c2c]">إدارة الطلبات</h1>
        <p className="text-[#8b7355] mt-2">متابعة وإدارة طلبات العملاء</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm mb-1 font-medium">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-purple-700">{stats.total}</p>
            </div>
            <div className="bg-purple-300/50 p-3 rounded-xl">
              <Package size={28} className="text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm mb-1 font-medium">قيد الانتظار</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-yellow-300/50 p-3 rounded-xl">
              <Clock size={28} className="text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 shadow-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm mb-1 font-medium">مكتملة</p>
              <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="bg-green-300/50 p-3 rounded-xl">
              <CheckCircle size={28} className="text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-2xl p-6 shadow-lg border-2 border-[#e8e8c8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8b7355] text-sm mb-1 font-medium">إجمالي المبيعات</p>
              <p className="text-3xl font-bold text-[#2c2c2c]">₪{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-[#8b7355]/20 p-3 rounded-xl">
              <Banknote size={28} className="text-[#8b7355]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8b7355]" size={20} />
              <input
                type="text"
                placeholder="بحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#8b7355] transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-64">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#8b7355] transition-colors"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التوصيل</option>
              <option value="cancelled">ملغية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8]">
                <th className="px-6 py-5 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#8b7355]/20 w-[10%]">
                  رقم الطلب
                </th>
                <th className="px-6 py-5 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#8b7355]/20 w-[20%]">
                  معلومات العميل
                </th>
                <th className="px-6 py-5 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#8b7355]/20 w-[15%]">
                  المبلغ الإجمالي
                </th>
                <th className="px-6 py-5 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#8b7355]/20 w-[15%]">
                  الحالة
                </th>
                <th className="px-6 py-5 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#8b7355]/20 w-[15%]">
                  التاريخ
                </th>
                <th className="px-6 py-5 text-center text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#8b7355]/20 w-[25%]">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8b7355]">
                    <Package size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">لا توجد طلبات</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gradient-to-r hover:from-[#f5f5dc]/20 hover:to-transparent transition-all duration-200 border-b border-[#e8e8c8] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#f5f5dc]/10'
                    }`}
                  >
                    {/* Order ID */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] text-[#2c2c2c] font-bold text-sm">
                          #
                        </span>
                        <span className="font-bold text-[#2c2c2c]">{order.id}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="font-bold text-[#2c2c2c]">{order.customer_name}</p>
                        <div className="flex items-center gap-2 text-sm text-[#8b7355]">
                          <Phone size={14} />
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-[#8b7355]">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{order.customer_address}</span>
                        </div>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-[#2c2c2c]">
                          ₪{Number(order.total).toFixed(2)}
                        </span>
                        <span className="text-xs text-[#8b7355] mt-1">
                          {order.items_count} منتج
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 focus:outline-none focus:ring-2 focus:ring-[#8b7355] transition-all ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="processing">قيد المعالجة</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="cancelled">ملغية</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#2c2c2c]">
                          {new Date(order.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-[#8b7355] mt-1">
                          {new Date(order.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => window.location.href = `/admin/orders/${order.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8b7355] to-[#2c2c2c] text-white rounded-lg hover:from-[#2c2c2c] hover:to-[#8b7355] shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                        >
                          <Eye size={16} />
                          <span className="text-sm">عرض التفاصيل</span>
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm">حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
