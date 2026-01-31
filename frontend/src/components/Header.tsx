'use client';

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { ShoppingCart, Search, Menu, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import MegaMenu from './MegaMenu';
import SearchDropdown from './SearchDropdown';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { API_URL, getImageUrl } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

const Header = memo(function Header() {
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>('متجر Sprint');
  const [loading, setLoading] = useState(true);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSiteLogo(data.site_logo); // Store just the path, getImageUrl will handle the full URL
          if (data.site_name) setSiteName(data.site_name);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
      }
    };

    fetchSettings();
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    if (isCategoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoriesOpen]);


  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-3 cursor-pointer order-1 lg:order-1"
          >
            <div className="w-12 h-12 bg-[#2c2c2c] rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
              {!loading && siteLogo ? (
                <Image
                  src={getImageUrl(siteLogo)}
                  alt="Site Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl font-bold text-white">S</span>
              )}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl font-bold text-[#2c2c2c] leading-tight">{siteName}</span>
              <span className="text-xs text-[#666]">متجرك الموثوق</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 order-2">
            <a
              onClick={() => router.push('/')}
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group cursor-pointer"
            >
              الرئيسية
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>

            <a
              onClick={() => router.push('/new')}
              className="text-[#2c2c2c] hover:text-red-500 transition-colors font-medium text-sm relative group cursor-pointer flex items-center gap-1"
            >
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                جديد
              </span>
              المنتجات الجديدة
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            
            <div ref={categoriesRef} className="relative">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group flex items-center gap-1"
              >
                الأقسام
                <ChevronDown size={16} className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {isCategoriesOpen && categories.length > 0 && (
                <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg py-2 min-w-[200px] border border-gray-200 z-50">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        router.push(`/category/${category.id}`);
                        setIsCategoriesOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-[#2c2c2c] hover:bg-gray-50 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <a
              onClick={() => router.push('/deals')}
              className="text-[#2c2c2c] hover:text-[#666] transition-colors font-medium text-sm relative group cursor-pointer"
            >
              العروض
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2c2c2c] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center gap-4 order-3 lg:order-3 relative">
            <button
              ref={searchButtonRef}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#2c2c2c] hover:text-[#666] transition-colors p-2 hover:bg-gray-100 rounded-full"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <SearchDropdown 
              isOpen={isSearchOpen} 
              onClose={() => setIsSearchOpen(false)}
              buttonRef={searchButtonRef}
            />
            <button
              className="relative text-[#2c2c2c] hover:text-[#666] transition-colors p-2 hover:bg-gray-100 rounded-full"
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
              className="text-[#2c2c2c] p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMegaMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>

    <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
    </>
  );
});

export default Header;
