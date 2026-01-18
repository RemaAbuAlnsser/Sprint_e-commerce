'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import Image from 'next/image';
import MobileSidebar from './MobileSidebar';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/settings');
        if (response.ok) {
          const data = await response.json();
          setSiteLogo(data.site_logo);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.9,
        duration: 1,
        ease: 'power4.out',
      });

      gsap.from(navRef.current?.children || [], {
        opacity: 0,
        y: -25,
        duration: 0.8,
        stagger: {
          amount: 0.3,
          ease: 'power2.out',
        },
        ease: 'power3.out',
        delay: 0.3,
      });

      gsap.from(iconsRef.current?.children || [], {
        opacity: 0,
        scale: 0,
        rotation: -180,
        duration: 0.7,
        stagger: {
          amount: 0.25,
          ease: 'power2.out',
        },
        ease: 'back.out(2)',
        delay: 0.6,
      });
    }, headerRef);

    return () => ctx.revert();
  }, [loading]);

  const handleHover = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: -3,
      scale: 1.05,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  const handleHoverOut = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  return (
    <>
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div
            ref={logoRef}
            className="flex items-center gap-3 cursor-pointer order-3 lg:order-1"
          >
            <div className="w-12 h-12 bg-[#2c2c2c] rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
              {!loading && siteLogo ? (
                <Image
                  src={`http://localhost:3000${siteLogo}`}
                  alt="Site Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">S</span>
              )}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl font-bold text-[#2c2c2c] leading-tight">متجر Sprint</span>
              <span className="text-xs text-[#666]">متجرك الموثوق</span>
            </div>
          </div>

          <nav ref={navRef} className="hidden lg:flex items-center gap-8 order-2">
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              الرئيسية
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              المنتجات
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              العروض
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              من نحن
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              تواصل معنا
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div ref={iconsRef} className="flex items-center gap-4 order-1 lg:order-3">
            <button
              className="text-[#2c2c2c] hover:text-[#666] transition-colors p-2 hover:bg-gray-100 rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              className="relative text-[#2c2c2c] hover:text-[#666] transition-colors p-2 hover:bg-gray-100 rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              onClick={() => router.push('/cart')}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 bg-[#2c2c2c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              className="lg:hidden text-[#2c2c2c] p-2 hover:bg-gray-100 rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
    <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
