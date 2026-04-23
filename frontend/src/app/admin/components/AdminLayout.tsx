'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'لوحة التحكم', icon: '📊' },
  { href: '/admin/categories', label: 'الفئات الرئيسية', icon: '📁' },
  { href: '/admin/brands', label: 'الشركات', icon: '🏢' },
  { href: '/admin/products', label: 'المنتجات', icon: '📦' },
  { href: '/admin/orders', label: 'الطلبات', icon: '🛒' },
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    
    if (!userData) {
      router.push('/admin');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    router.push('/admin');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-l border-gray-700 fixed h-full transition-all duration-300 z-40`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <img src="/logo.png" alt="Spirit - متجر الإكسسوارات" className="h-10 w-auto object-contain brightness-0 invert" />
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700">
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>
        
        <nav className="p-3 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                pathname === item.href || pathname?.startsWith(item.href + '/')
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg mb-3 transition-colors">
            <span>🏪</span>
            {sidebarOpen && <span className="text-sm">عرض المتجر</span>}
          </Link>
          
          <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-3">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.first_name?.[0] || 'A'}
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-white text-sm font-medium">{user?.first_name}</p>
                  <p className="text-gray-500 text-xs">مدير</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10" title="تسجيل الخروج">
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'mr-64' : 'mr-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-white font-bold text-lg">
                {navItems.find(item => item.href === pathname)?.label || 'لوحة التحكم'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
