'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  FolderTree,
  Banknote,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface Stats {
  productsCount: number;
  ordersCount: number;
  categoriesCount: number;
  subcategoriesCount: number;
  totalRevenue: number;
}

interface Category {
  id: number;
  name: string;
  subcategories?: any[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    ordersCount: 0,
    categoriesCount: 0,
    subcategoriesCount: 0,
    totalRevenue: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch products count
      const productsRes = await fetch('http://localhost:3000/products');
      const products = await productsRes.json();
      const productsCount = Array.isArray(products) ? products.length : 0;

      // Fetch orders count and calculate revenue
      const ordersRes = await fetch('http://localhost:3000/orders');
      const orders = await ordersRes.json();
      const ordersArray = Array.isArray(orders) ? orders : [];
      const ordersCount = ordersArray.length;
      const totalRevenue = ordersArray
        .filter((order: any) => order.status === 'completed')
        .reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);

      // Fetch categories
      const categoriesRes = await fetch('http://localhost:3000/categories');
      const categoriesData = await categoriesRes.json();
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      
      // Fetch subcategories for each category
      let totalSubcategories = 0;
      const categoriesWithSubs = await Promise.all(
        categoriesArray.map(async (category: Category) => {
          try {
            const subsRes = await fetch(`http://localhost:3000/subcategories/category/${category.id}`);
            const subs = await subsRes.json();
            const subsArray = Array.isArray(subs) ? subs : [];
            totalSubcategories += subsArray.length;
            return { ...category, subcategories: subsArray };
          } catch (error) {
            return { ...category, subcategories: [] };
          }
        })
      );

      setCategories(categoriesWithSubs);
      setStats({
        productsCount,
        ordersCount,
        categoriesCount: categoriesArray.length,
        subcategoriesCount: totalSubcategories,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c2c2c]">لوحة التحكم</h1>
        <p className="text-[#8b7355] mt-2">نظرة عامة على إحصائيات المتجر</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Products Card */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-300/50 p-3 rounded-xl">
              <Package size={28} className="text-blue-700" />
            </div>
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-blue-600 text-sm mb-1 font-medium">المنتجات</p>
            <p className="text-4xl font-bold text-blue-700 mb-1">
              {isLoading ? '...' : stats.productsCount}
            </p>
            <p className="text-xs text-blue-600">إجمالي المنتجات المتاحة</p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-300/50 p-3 rounded-xl">
              <ShoppingCart size={28} className="text-purple-700" />
            </div>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-purple-600 text-sm mb-1 font-medium">الطلبات</p>
            <p className="text-4xl font-bold text-purple-700 mb-1">
              {isLoading ? '...' : stats.ordersCount}
            </p>
            <p className="text-xs text-purple-600">إجمالي الطلبات الحالية</p>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 shadow-lg border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-300/50 p-3 rounded-xl">
              <FolderTree size={28} className="text-green-700" />
            </div>
            <Layers size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-green-600 text-sm mb-1 font-medium">الفئات</p>
            <p className="text-4xl font-bold text-green-700 mb-1">
              {isLoading ? '...' : stats.categoriesCount}
            </p>
            <p className="text-xs text-green-600">
              {stats.subcategoriesCount} فئة فرعية
            </p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-2xl p-6 shadow-lg border-2 border-[#e8e8c8]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[#8b7355]/20 p-3 rounded-xl">
              <Banknote size={28} className="text-[#8b7355]" />
            </div>
            <TrendingUp size={20} className="text-[#8b7355]" />
          </div>
          <div>
            <p className="text-[#8b7355] text-sm mb-1 font-medium">الإيرادات</p>
            <p className="text-4xl font-bold text-[#2c2c2c] mb-1">
              {isLoading ? '...' : `₪${stats.totalRevenue.toFixed(2)}`}
            </p>
            <p className="text-xs text-[#8b7355]">إجمالي المبيعات المكتملة</p>
          </div>
        </div>
      </div>

      {/* Categories Details */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] overflow-hidden">
        <div className="bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] p-6 border-b-2 border-[#8b7355]/20">
          <h2 className="text-2xl font-bold text-[#2c2c2c]">تفاصيل الفئات</h2>
          <p className="text-[#8b7355] text-sm mt-1">
            عدد الفئات الفرعية لكل فئة رئيسية
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-[#8b7355]">
              <p>جاري التحميل...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-[#8b7355]">
              <FolderTree size={48} className="mx-auto mb-4 opacity-30" />
              <p>لا توجد فئات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gradient-to-br from-[#f5f5dc]/30 to-[#e8e8c8]/30 rounded-xl p-4 border-2 border-[#e8e8c8] hover:border-[#8b7355] transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2c2c2c] mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-[#8b7355]">
                        {category.subcategories?.length || 0} فئة فرعية
                      </p>
                    </div>
                    <div className="bg-[#8b7355]/20 p-2 rounded-lg">
                      <span className="text-2xl font-bold text-[#8b7355]">
                        {category.subcategories?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
