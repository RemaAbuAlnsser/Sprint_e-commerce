'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('admin_user');
    if (user) router.push('/admin/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
      if (data.user.role !== 'admin') throw new Error('غير مصرح. للمديرين فقط.');

      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Spirit - متجر الإكسسوارات" className="h-20 w-auto object-contain mx-auto mb-4 brightness-0 invert" />
          <p className="text-gray-400 mt-2">لوحة تحكم المتجر</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-2 font-medium">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                placeholder="admin@example.com"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  جاري الدخول...
                </span>
              ) : (
                'دخول'
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
       

        {/* Back to Store */}
        <div className="mt-8 text-center">
          <a href="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            ← العودة للمتجر
          </a>
        </div>
      </div>
    </div>
  );
}
