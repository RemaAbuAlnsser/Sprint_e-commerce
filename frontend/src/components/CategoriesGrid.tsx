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

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories for grid...');
        const response = await fetch('http://localhost:3000/categories');
        if (response.ok) {
          const data = await response.json();
          console.log('Categories for grid:', data.length);
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories for grid:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading && categories.length > 0 && scrollContainerRef.current) {
      gsap.fromTo(
        scrollContainerRef.current.children,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, [loading, categories]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const scrollAmount = containerWidth * 0.8;
      const newScrollLeft = container.scrollLeft + (direction === 'right' ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/category/${categoryId}`);
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

  return (
    <div className="relative py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white border border-gray-200 hover:border-[#2c2c2c] hover:bg-[#2c2c2c] hover:text-white transition-colors duration-200 shadow-sm active:scale-95"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white border border-gray-200 hover:border-[#2c2c2c] hover:bg-[#2c2c2c] hover:text-white transition-colors duration-200 shadow-sm active:scale-95"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[calc(33.333%-10.667px)] sm:auto-cols-[calc(25%-12px)] md:auto-cols-[calc(25%-12px)] lg:auto-cols-[calc(20%-12.8px)] xl:auto-cols-[calc(16.666%-13.333px)] gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-6 pt-3 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="w-full cursor-pointer group"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {category.image_url ? (
                    <Image
                      src={`http://localhost:3000${category.image_url}`}
                      alt={category.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl md:text-6xl lg:text-7xl opacity-20">📦</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="text-base md:text-lg lg:text-xl font-bold text-white drop-shadow-lg line-clamp-2 text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
