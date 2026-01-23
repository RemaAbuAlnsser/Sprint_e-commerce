'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Package,
  ShoppingCart,
  Settings,
  ChevronRight,
  LogOut,
  Store,
} from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [siteName, setSiteName] = useState('Sprint Store');

  useEffect(() => {
    setMounted(true);
    
    // تحميل اسم الموقع من API
    const loadSiteName = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        if (data.site_name) setSiteName(data.site_name);
      } catch (error) {
      }
    };
    loadSiteName();
  }, []);

  const isLoginPage = pathname === '/admin';

  const handleLogout = () => {
    router.push('/admin');
  };

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'categories', label: 'الفئات', icon: FileText, path: '/admin/categories' },
    { id: 'companies', label: 'الشركات', icon: Building2, path: '/admin/companies' },
    { id: 'products', label: 'المنتجات', icon: Package, path: '/admin/products' },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCart, path: '/admin/orders' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/admin/settings' },
  ];

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id);
    if (item.path) {
      router.push(item.path);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-row-reverse min-h-screen bg-gradient-to-br from-[#f5f5dc] via-white to-[#e8e8c8]">
      {/* Sidebar */}
      <aside className={`bg-white shadow-xl flex flex-col border-r border-[#e8e8c8] fixed right-0 top-0 h-screen transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#e8e8c8]">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#5E4A45] hover:text-[#2c2c2c] transition-colors"
            >
              <ChevronRight size={24} />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-[#2c2c2c]">{siteName}</h1>
              <p className="text-sm text-[#5E4A45] mt-1">لوحة التحكم</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = mounted && pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] text-[#2c2c2c] shadow-md'
                    : 'text-[#5E4A45] hover:bg-[#f5f5dc]/50 hover:text-[#2c2c2c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={isActive ? 'text-[#2c2c2c]' : 'text-[#5E4A45]'}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-[#5E4A45] rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-[#e8e8c8]">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white bg-gradient-to-r from-[#2c2c2c] to-[#5E4A45] hover:from-[#5E4A45] hover:to-[#2c2c2c] transition-all duration-300 mb-3 shadow-md hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Store size={20} />
              <span className="font-medium">عرض المتجر</span>
            </div>
          </button>

          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] rounded-xl">
            <div className="w-10 h-10 bg-[#5E4A45] rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <p className="text-[#2c2c2c] font-medium text-sm">Admin</p>
              <p className="text-[#5E4A45] text-xs">مدير</p>
            </div>
            <div className="w-8 h-8 bg-[#5E4A45] rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle Button when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 right-4 z-50 p-3 bg-[#2c2c2c] text-white rounded-lg shadow-lg hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronRight size={24} className="rotate-180" />
        </button>
      )}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-0'}`}>
        {children}
      </main>
    </div>
  );
}
