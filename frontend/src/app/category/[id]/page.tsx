'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ArrowRight, ShoppingCart, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import Toast from '@/components/Toast';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  hover_image_url?: string;
  category_name: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const categoryId = params.id;
        console.log('Fetching category:', categoryId);

        const [categoryRes, productsRes] = await Promise.all([
          fetch(`http://localhost:3000/categories/${categoryId}`),
          fetch(`http://localhost:3000/products/category/${categoryId}`)
        ]);

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          console.log('Category data:', categoryData);
          setCategory(categoryData);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          console.log('Products data:', productsData.length, 'products');
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [params.id]);

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
        gsap.to(clone, {
          left: `${cartRect.left + cartRect.width / 2 - 10}px`,
          top: `${cartRect.top + cartRect.height / 2 - 10}px`,
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

  useEffect(() => {
    if (!loading && category && products.length > 0 && gridRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    }
  }, [loading, category, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center text-[#2c2c2c]">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center text-[#2c2c2c]">القسم غير موجود</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <div className="min-h-screen bg-white">
        <Header />

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#2c2c2c] hover:text-[#d4af37] transition-colors mb-6 md:mb-8 group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-semibold">العودة للرئيسية</span>
          </button>

          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
              <h1
                ref={titleRef}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c]"
              >
                {category.name}
              </h1>
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
            </div>
            {category.description && (
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-20">📦</div>
              <p className="text-gray-500 text-lg">لا توجد منتجات في هذا القسم حالياً</p>
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="product-card group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-3">
                    {product.image_url ? (
                      <>
                        <Image
                          src={`http://localhost:3000${product.image_url}`}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.hover_image_url && (
                          <Image
                            src={`http://localhost:3000${product.hover_image_url}`}
                            alt={product.name}
                            fill
                            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl md:text-6xl opacity-20">📦</span>
                      </div>
                    )}

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                          نفذت الكمية
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleAddToCart(product, e.currentTarget)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={product.stock <= 0}
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
