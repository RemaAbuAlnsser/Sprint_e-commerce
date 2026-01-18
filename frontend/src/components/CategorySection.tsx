'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Heart } from 'lucide-react';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  hover_image_url?: string;
  category_name: string;
}

interface CategorySectionProps {
  category: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
  };
  index: number;
}

export default function CategorySection({ category, index }: CategorySectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log(`Fetching products for category ${category.id}: ${category.name}`);
        const response = await fetch(`http://localhost:3000/products/category/${category.id}`);
        console.log(`Response status for category ${category.id}:`, response.status);
        if (response.ok) {
          const data = await response.json();
          console.log(`Products fetched for category ${category.id}:`, data.length, 'products');
          setProducts(data);
        } else {
          console.error(`Failed to fetch products for category ${category.id}:`, response.status, response.statusText);
        }
      } catch (error) {
        console.error(`Error fetching products for category ${category.id}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category.id, category.name]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        });

        if (scrollContainerRef.current) {
          gsap.from(scrollContainerRef.current.children, {
            opacity: 0,
            y: 50,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: scrollContainerRef.current,
              start: 'top 85%',
            },
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [loading, products]);

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

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const backgroundColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

  return (
    <section ref={sectionRef} className={`py-12 md:py-16 ${backgroundColor}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
              <h2
                ref={titleRef}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c]"
              >
                {category.name}
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
            </div>
            <div className="flex items-center gap-2 mr-4">
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
          </div>
          {category.description && (
            <p className="text-gray-600 text-sm md:text-base text-center">{category.description}</p>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[calc(50%-8px)] md:auto-cols-[calc(33.333%-10.667px)] lg:auto-cols-[calc(25%-12px)] xl:auto-cols-[calc(20%-12.8px)] gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-6 pt-3 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-full group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <>
                      <Image
                        src={`http://localhost:3000${product.image_url}`}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.hover_image_url && (
                        <Image
                          src={`http://localhost:3000${product.hover_image_url}`}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-20">📦</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#2c2c2c] hover:text-white transition-all duration-300">
                      <Heart className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#2c2c2c] hover:text-white transition-all duration-300">
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 md:p-4 text-right">
                  <h3 className="text-sm md:text-lg font-bold text-[#2c2c2c] mb-1 md:mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <button className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2">
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">أضف للسلة</span>
                    </button>
                    <span className="text-base md:text-xl font-bold text-[#2c2c2c] whitespace-nowrap">
                      {Number(product.price).toFixed(2)} ₪
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
