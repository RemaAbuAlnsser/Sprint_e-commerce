'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ArrowRight, ShoppingCart, Eye, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Image from 'next/image';

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
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

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

  useEffect(() => {
    if (!loading && category) {
      const ctx = gsap.context(() => {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
        });

        gsap.from(gridRef.current?.children || [], {
          opacity: 0,
          y: 50,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.3,
        });
      });

      return () => ctx.revert();
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
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <>
                        <Image
                          src={`http://localhost:3000${product.image_url}`}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
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

                    <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#2c2c2c] hover:text-white transition-all duration-300">
                        <Heart className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#2c2c2c] hover:text-white transition-all duration-300">
                        <Eye className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                          نفذت الكمية
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 md:p-4 text-right">
                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-[#2c2c2c] mb-1 md:mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
