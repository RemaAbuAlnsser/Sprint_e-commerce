'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Subcategory {
  id: number;
  name: string;
  image_url?: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  subcategories: Subcategory[];
}

export default function CategoriesMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories/with-subcategories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading && categories.length > 0 && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: {
            amount: 0.4,
            ease: 'power2.out',
          },
          ease: 'power3.out',
        }
      );
    }
  }, [loading, categories, currentIndex]);

  const getItemsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  }, []);

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [getItemsPerView]);

  const maxIndex = Math.max(0, categories.length - itemsPerView);

  const scroll = useCallback((direction: 'left' | 'right') => {
    setCurrentIndex(prev => {
      if (direction === 'left') {
        return Math.min(prev + 1, maxIndex);
      } else {
        return Math.max(prev - 1, 0);
      }
    });
  }, [maxIndex]);

  const handleSubcategoryClick = (subcategoryId: number) => {
    router.push('/subcategory/' + subcategoryId);
  };

  const handleViewAll = (categoryId: number) => {
    router.push('/category/' + categoryId);
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-[#2c2c2c] text-white hover:bg-[#1a1a1a] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full bg-[#2c2c2c] text-white hover:bg-[#1a1a1a] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#2c2c2c]">يجد ما تحتاجه</h2>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleViewAll(category.id)}
                    className="text-sm text-gray-500 hover:text-[#d4af37] transition-colors flex items-center gap-1"
                  >
                    عرض الكل
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-right">
                    <h3 className="font-bold text-[#2c2c2c] text-sm md:text-base line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {category.subcategories?.length || 0} منتجات
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4">
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {category.subcategories?.slice(0, 4).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex flex-col items-center cursor-pointer group"
                      onClick={() => handleSubcategoryClick(sub.id)}
                    >
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-100 border-2 border-gray-200 group-hover:border-[#d4af37] overflow-hidden flex items-center justify-center transition-all duration-300 mb-2">
                        {sub.image_url ? (
                          <Image
                            src={'http://localhost:3000' + sub.image_url}
                            alt={sub.name}
                            width={56}
                            height={56}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {sub.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs text-gray-600 text-center line-clamp-1 group-hover:text-[#d4af37] transition-colors">
                        {sub.name}
                      </span>
                    </div>
                  ))}
                </div>

                {(!category.subcategories || category.subcategories.length === 0) && (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    لا توجد أقسام فرعية
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}