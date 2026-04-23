'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

import { API_URL } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, categories: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch(API_URL + '/store/products'),
        fetch(API_URL + '/admin/orders'),
        fetch(API_URL + '/store/parent-categories'),
      ]);
      const productsData = await productsRes.json();
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      const categoriesData = await categoriesRes.json();
      const orders = ordersData.orders || [];
      setStats({
        products: (productsData.products || []).length,
        orders: orders.length,
        categories: (categoriesData.parent_categories || []).length,
        revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatPrice = (p) => (p / 100).toFixed(2) + ' SAR';

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
        <p className="text-gray-400 mt-1">مرحبا بك في لوحة التحكم</p>
      </div>
      {loading ? (
        <div className="text-white text-center py-12">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/admin/products" className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750">
            <p className="text-gray-400 text-sm">المنتجات</p>
            <p className="text-3xl font-bold text-white">{stats.products}</p>
          </Link>
          <Link href="/admin/orders" className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750">
            <p className="text-gray-400 text-sm">الطلبات</p>
            <p className="text-3xl font-bold text-white">{stats.orders}</p>
          </Link>
          <Link href="/admin/categories" className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750">
            <p className="text-gray-400 text-sm">الفئات الرئيسية</p>
            <p className="text-3xl font-bold text-white">{stats.categories}</p>
          </Link>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">الإيرادات</p>
            <p className="text-3xl font-bold text-green-500">{formatPrice(stats.revenue)}</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

