'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteName, setSiteName] = useState('Sprint Store');

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    const ctx = gsap.context(() => {
      gsap.from(decorRef.current, {
        scale: 0,
        rotation: 180,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
      });

      gsap.from(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      });

      gsap.from(formRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        delay: 0.6,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email === 'admin@sprint.com' && password === 'admin123') {
        gsap.to(formRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            router.push('/admin/dashboard');
          },
        });
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setIsLoading(false);
        
        gsap.fromTo(
          formRef.current,
          { x: 0 },
          {
            keyframes: {
              x: [-10, 10, -10, 10, 0],
            },
            duration: 0.5,
            ease: 'power2.out',
          }
        );
      }
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#f5f5dc] via-[#e8e8c8] to-[#d4d4c0] flex items-center justify-center p-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b7355]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div ref={decorRef} className="absolute top-10 right-10 w-20 h-20 border-4 border-white/30 rounded-lg rotate-45"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/20 rounded-full"></div>
      <div className="absolute top-1/4 left-1/4 w-12 h-12 border-4 border-[#8b7355]/20 rounded-full"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            ref={titleRef}
            className="text-5xl font-bold text-[#2c2c2c] mb-2 drop-shadow-sm"
          >
            {siteName}
          </h1>
          <p className="text-[#8b7355] text-lg">لوحة التحكم</p>
        </div>

        <div
          ref={formRef}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50"
        >
          <div className="mb-6 text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-[#2c2c2c]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2c2c2c] mb-2">
              تسجيل الدخول
            </h2>
            <p className="text-[#8b7355] text-sm">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#2c2c2c] mb-2"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#8b7355]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pr-10 pl-4 py-3 border-2 border-[#e8e8c8] rounded-xl text-[#2c2c2c] placeholder-[#8b7355]/50 focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20 transition-all bg-white/50"
                  placeholder="admin@sprint.com"
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#2c2c2c] mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#8b7355]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pr-10 pl-12 py-3 border-2 border-[#e8e8c8] rounded-xl text-[#2c2c2c] placeholder-[#8b7355]/50 focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20 transition-all bg-white/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b7355] hover:text-[#2c2c2c] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2c2c2c] to-[#8b7355] text-white py-3 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* <div className="mt-6 p-4 bg-[#f5f5dc]/50 rounded-xl border border-[#e8e8c8]">
            <p className="text-xs text-[#8b7355] text-center mb-2 font-semibold">
              بيانات تجريبية:
            </p>
            <p className="text-xs text-[#2c2c2c] text-center">
              <strong>Email:</strong> admin@sprint.com
            </p>
            <p className="text-xs text-[#2c2c2c] text-center">
              <strong>Password:</strong> admin123
            </p>
          </div> */}
        </div>

        <div className="text-center mt-6">
          <p className="text-[#8b7355] text-sm">
            © 2026 {siteName}. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
