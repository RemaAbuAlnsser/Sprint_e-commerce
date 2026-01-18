'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import Toast from './Toast';

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
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { addToCart } = useCart();

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

  const handleAddToCart = useCallback((product: Product, buttonRef: HTMLButtonElement) => {
    const productCard = buttonRef.closest('.product-card');
    const productImage = productCard?.querySelector('img');
    
    if (productImage) {
      const clone = productImage.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.zIndex = '1000';
      clone.style.width = '80px';
      clone.style.height = '80px';
      clone.style.borderRadius = '8px';
      clone.style.pointerEvents = 'none';
      
      const rect = productImage.getBoundingClientRect();
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;
      
      document.body.appendChild(clone);
      
      const cartIcon = document.querySelector('[aria-label="Cart"]');
      const cartRect = cartIcon?.getBoundingClientRect();
      
      if (cartRect) {
        const targetLeft = cartRect.left + cartRect.width / 2;
        const targetTop = cartRect.top + cartRect.height / 2;
        
        console.log('Flying from', rect.left, 'to', targetLeft);
        
        gsap.to(clone, {
          left: `${targetLeft - 10}px`,
          top: `${targetTop - 10}px`,
          width: 20,
          height: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power1.inOut',
          onComplete: () => {
            clone.remove();
            
            if (cartIcon) {
              gsap.fromTo(
                cartIcon,
                { scale: 1 },
                {
                  scale: 1.3,
                  duration: 0.2,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power2.inOut',
                }
              );
            }
          },
        });
      }
    }
    
    addToCart({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
    
    gsap.to(buttonRef, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });

    const icon = buttonRef.querySelector('svg');
    if (icon) {
      gsap.fromTo(
        icon,
        { rotation: 0, scale: 1 },
        {
          rotation: 360,
          scale: 1.3,
          duration: 0.6,
          ease: 'back.out(1.7)',
        }
      );
    }

    setToastMessage(`تمت إضافة "${product.name}" إلى السلة`);
    setShowToast(true);
  }, [addToCart]);

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
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 flex-shrink-0 mb-3">
                  {product.image_url ? (
                    <>
                      <Image
                        src={`http://localhost:3000${product.image_url}`}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                </div>

                <div className="text-right flex flex-col flex-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <button 
                      onClick={(e) => handleAddToCart(product, e.currentTarget)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs flex items-center justify-center gap-1.5"
                    >
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
    </>
  );
}
