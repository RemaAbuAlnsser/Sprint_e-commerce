'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShoppingCart, Search, Menu, User, Heart } from 'lucide-react';

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from(navRef.current?.children || [], {
        opacity: 0,
        y: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2,
      });

      gsap.from(iconsRef.current?.children || [], {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.5,
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const handleHover = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: -2,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleHoverOut = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-[#f5f5dc]"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div
            ref={logoRef}
            className="flex items-center space-x-3 space-x-reverse cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-[#2c2c2c]">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#2c2c2c] leading-tight">Sprint Store</span>
              <span className="text-xs text-[#8b7355]">متجرك الموثوق</span>
            </div>
          </div>

          <nav ref={navRef} className="hidden lg:flex items-center space-x-8 space-x-reverse">
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              الرئيسية
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8b7355] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              المنتجات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8b7355] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              العروض
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8b7355] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              من نحن
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8b7355] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors font-medium text-sm relative group"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
            >
              تواصل معنا
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8b7355] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div ref={iconsRef} className="flex items-center space-x-4 space-x-reverse">
            <button
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors p-2 hover:bg-[#f5f5dc] rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors p-2 hover:bg-[#f5f5dc] rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </button>
            <button
              className="text-[#2c2c2c] hover:text-[#8b7355] transition-colors p-2 hover:bg-[#f5f5dc] rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              aria-label="Account"
            >
              <User size={20} />
            </button>
            <button
              className="relative text-[#2c2c2c] hover:text-[#8b7355] transition-colors p-2 hover:bg-[#f5f5dc] rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-[#2c2c2c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
            <button
              className="lg:hidden text-[#2c2c2c] p-2 hover:bg-[#f5f5dc] rounded-full"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverOut}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
