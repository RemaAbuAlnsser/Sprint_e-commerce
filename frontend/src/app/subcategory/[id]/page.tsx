'use client';
import { API_URL } from '@/lib/api';

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
  sku: string;
}

interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
}

export default function SubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchSubcategoryAndProducts = async () => {
      try {
        const subcategoryId = params.id;

        const [subcategoryRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/subcategories/${subcategoryId}`),
          fetch(`${API_URL}/products/subcategory/${subcategoryId}`)
        ]);

        if (subcategoryRes.ok) {
          const subcategoryData = await subcategoryRes.json();
          setSubcategory(subcategoryData);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        } else {
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategoryAndProducts();
  }, [params.id]);

  const handleAddToCart = useCallback(async (product: Product, buttonRef: HTMLButtonElement) => {
    const result = await addToCart({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
    
    if (!result.success) {
      setToastMessage(result.message || 'فشل إضافة المنتج');
      setShowToast(true);
      return;
    }
    
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
    if (loading || !subcategory || products.length === 0 || !gridRef.current || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;
    
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 0, y: 30 });
        gsap.to(titleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      }

      const items = gridRef.current?.children;
      if (items && items.length > 0) {
        gsap.set(items, { opacity: 0, y: 40 });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.2,
        });
      }
    }, gridRef);

    return () => ctx.revert();
  }, [loading, subcategory, products.length]);

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

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center text-[#2c2c2c]">القسم الفرعي غير موجود</div>
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
                className="section-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c]"
              >
                {subcategory.name}
              </h1>
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1 max-w-xs"></div>
            </div>
            {subcategory.description && (
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                {subcategory.description}
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
                  <div 
                    onClick={() => router.push(`/product/${product.sku}`)}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-3 cursor-pointer"
                  >
                    {product.image_url ? (
                      <>
                        <Image
                          src={`${API_URL}${product.image_url}`}
                          alt={product.name}
                          fill
                          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                        />
                        {product.hover_image_url && (
                          <Image
                            src={`${API_URL}${product.hover_image_url}`}
                            alt={product.name}
                            fill
                            className={`object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${product.stock === 0 ? 'grayscale' : ''}`}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl md:text-6xl opacity-20">📦</span>
                      </div>
                    )}

                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                          غير متوفر
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 
                      onClick={() => router.push(`/product/${product.sku}`)}
                      className="product-name text-lg md:text-xl font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-[#d4af37] transition-colors"
                    >
                      {product.name}
                    </h3>
                    <div className="mb-4">
                      <span className="product-price text-lg md:text-xl font-bold text-[#2c2c2c]">
                        ₪{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    {product.stock === 0 ? (
                      <div className="w-full px-3 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                        <ShoppingCart className="w-4 h-4" />
                        <span>غير متوفر</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleAddToCart(product, e.currentTarget)}
                        className="w-full px-3 py-3 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>أضف للسلة</span>
                      </button>
                    )}
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
