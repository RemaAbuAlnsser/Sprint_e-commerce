'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useFlyingAnimation } from '@/hooks/useFlyingAnimation';
import NewLabel from '@/components/NewLabel';
import { isProductNew } from '@/utils/dateUtils';
import Toast from './Toast';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Product {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  old_price?: number;
  stock: number;
  image_url?: string;
  hover_image_url?: string;
  category_name: string;
  created_at: string;
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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { addToCart } = useCart();
  const { isAnimating, createFlyingAnimation } = useFlyingAnimation();

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
    if (!loading && products.length > 0 && scrollContainerRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        scrollContainerRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, [loading, products]);

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setShowScrollButtons(hasOverflow);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [checkScrollButtons, products]);

  const handleAddToCart = useCallback(async (product: Product, buttonRef: HTMLButtonElement) => {
    createFlyingAnimation(buttonRef, product, async () => {
      const result = await addToCart({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
      
      if (!result.success) {
        setToastMessage(result.message || 'فشل إضافة المنتج');
        setShowToast(true);
        return;
      }
      
      setToastMessage(`تمت إضافة "${product.name}" إلى السلة`);
      setShowToast(true);
    });
  }, [addToCart, createFlyingAnimation]);

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
    <>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <section ref={sectionRef} className={`py-12 md:py-16 ${backgroundColor}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-4 mb-4 relative">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
            <h2
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c] text-center"
            >
              {category.name}
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
            {showScrollButtons && (
              <div className="absolute left-0 flex items-center gap-2">
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
            )}
          </div>
          {category.description && (
            <p className="text-gray-600 text-sm md:text-base text-center mb-4">{category.description}</p>
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
              <div className="product-card h-full flex flex-col">
                <div 
                  onClick={() => {
                    const slug = product.sku || encodeURIComponent(product.name);
                    router.push(`/product/${slug}`);
                  }}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 flex-shrink-0 mb-3 cursor-pointer"
                >
                  {product.image_url ? (
                    <>
                      <Image
                        src={`http://localhost:3000${product.image_url}`}
                        alt={product.name}
                        fill
                        unoptimized
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                      />
                      {product.hover_image_url && (
                        <Image
                          src={`http://localhost:3000${product.hover_image_url}`}
                          alt={product.name}
                          fill
                          unoptimized
                          className={`object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${product.stock === 0 ? 'grayscale' : ''}`}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-20">📦</span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                        غير متوفر
                      </span>
                    </div>
                  )}
                  {product.old_price && Number(product.old_price) > Number(product.price) && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg font-bold text-xs md:text-sm shadow-lg">
                      SALE
                    </div>
                  )}

                  {/* New Label - positioned below SALE if it exists */}
                  {isProductNew(product.created_at) && (
                    <NewLabel 
                      className={product.old_price && Number(product.old_price) > Number(product.price) ? "top-12" : ""}
                    />
                  )}
                </div>

                <div className="text-center flex flex-col flex-1">
                  <h3 
                    onClick={() => {
                      const slug = product.sku || encodeURIComponent(product.name);
                      router.push(`/product/${slug}`);
                    }}
                    className="text-lg md:text-xl font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-[#d4af37] transition-colors"
                  >
                    {product.name}
                  </h3>
                  <div className="mb-4">
                    {product.old_price && product.old_price > product.price ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 line-through">
                            ₪{Number(product.old_price).toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-md font-bold">
                            -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                          </span>
                        </div>
                        <span className="text-lg md:text-xl font-bold text-[#d4af37]">
                          ₪{Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg md:text-xl font-bold text-[#2c2c2c]">
                        ₪{Number(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.stock === 0 ? (
                    <div className="w-full px-3 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed mt-auto">
                      <ShoppingCart className="w-4 h-4" />
                      <span>غير متوفر</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleAddToCart(product, e.currentTarget)}
                      className="w-full px-3 py-3 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium text-sm flex items-center justify-center gap-2 mt-auto"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>أضف للسلة</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
