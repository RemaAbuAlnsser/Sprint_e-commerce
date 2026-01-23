'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export default function CategoriesMenu() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 80, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, categories]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    router.push('/category/' + categoryId);
  };

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el;
  };

  if (loading) {
    return (
      <section className="py-4 md:py-6 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-end mb-6 gap-3">
            <div className="p-3 rounded-full bg-gray-200 w-11 h-11 animate-pulse"></div>
            <div className="p-3 rounded-full bg-gray-200 w-11 h-11 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 lg:gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className="w-full aspect-square rounded-3xl bg-gray-200 mb-3 md:mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          لا توجد فئات
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-4 md:py-6 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-end mb-6 gap-3">
          <button
            onClick={() => scroll('left')}
            className="p-3 rounded-full bg-white shadow-lg hover:bg-[#d4af37] hover:text-white transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-3 rounded-full bg-white shadow-lg hover:bg-[#d4af37] hover:text-white transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => addToRefs(el, index)}
              className="flex-shrink-0 w-[calc(25%-12px)] sm:w-[calc(25%-12px)] md:w-[calc(20%-16px)] lg:w-[calc(14.28%-20px)]"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="group cursor-pointer">
                <div className="relative aspect-square rounded-3xl bg-white mb-3 md:mb-4 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#d4af37]/0 group-hover:bg-[#d4af37]/10 transition-colors duration-500 z-10" />

                  {category.image_url ? (
                    <Image
                      src={`${API_URL}${category.image_url}`}
                      alt={category.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#d4af37] to-[#b8962e]">
                      <span className="text-4xl md:text-5xl lg:text-6xl group-hover:scale-125 transition-transform duration-500 text-white font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-center text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 group-hover:text-[#d4af37] transition-colors duration-300 line-clamp-2">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}