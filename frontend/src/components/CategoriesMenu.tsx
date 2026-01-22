'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export default function CategoriesMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories');
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
    if (loading || categories.length === 0 || !containerRef.current || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;
    
    const ctx = gsap.context(() => {
      const items = containerRef.current?.children;
      if (!items || items.length === 0) return;

      gsap.set(items, { opacity: 0, y: 30, scale: 0.9 });
      
      gsap.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, categories]);

  const getItemsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 4;
    if (window.innerWidth < 768) return 4;
    if (window.innerWidth < 1024) return 5;
    return 7;
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

  const handleCategoryClick = (categoryId: number) => {
    router.push('/category/' + categoryId);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      scroll('left');
    } else if (isRightSwipe) {
      scroll('right');
    }
  };

  if (loading) {
    return (
      <div className="py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gray-200 w-9 h-9 animate-pulse"></div>
              <div className="p-2 rounded-full bg-gray-200 w-9 h-9 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 lg:gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className="w-full aspect-square rounded-2xl bg-gray-200 mb-2 md:mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className="py-4 md:py-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={containerRef}
            className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 lg:gap-6 transition-all duration-500 ease-in-out"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {visibleCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 mb-2 md:mb-3 bg-white">
                  {category.image_url ? (
                    <Image
                      src={'http://localhost:3000' + category.image_url}
                      alt={category.name}
                      width={120}
                      height={120}
                      unoptimized
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center">
                      <span className="text-white text-xl md:text-2xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[#2c2c2c] text-center line-clamp-2 group-hover:text-[#d4af37] transition-colors">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}