'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import NewLabel from '@/components/NewLabel';
import { useCart } from '@/contexts/CartContext';
import { useFlyingAnimation } from '@/hooks/useFlyingAnimation';
import { isProductNew } from '@/utils/dateUtils';
import ProductSkeleton from '@/components/ProductSkeleton';

interface Product {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  old_price?: number;
  image_url?: string;
  hover_image_url?: string;
  category_name: string;
  stock: number;
  company_id?: number;
  created_at: string;
}

export default function NewProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { addToCart } = useCart();
  const { isAnimating, createFlyingAnimation } = useFlyingAnimation();

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const allProductsData = await response.json();
          // Filter products added within the last week
          const newProducts = allProductsData.filter((product: Product) => 
            isProductNew(product.created_at)
          );
          setProducts(newProducts);
          setAllProducts(newProducts);
          
          // Extract unique companies from new products
          const uniqueCompanies = newProducts
            .filter((product: Product) => product.company_id)
            .reduce((acc: any[], product: Product) => {
              const existingCompany = acc.find(c => c.id === product.company_id);
              if (!existingCompany && product.company_id) {
                // Fetch company details
                fetchCompanyDetails(product.company_id).then(company => {
                  if (company) {
                    setCompanies(prev => {
                      const exists = prev.find(c => c.id === company.id);
                      if (!exists) {
                        return [...prev, company];
                      }
                      return prev;
                    });
                  }
                });
              }
              return acc;
            }, []);
        }
      } catch (error) {
        console.error('Error fetching new products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  const fetchCompanyDetails = async (companyId: number) => {
    try {
      const response = await fetch(`${API_URL}/companies/${companyId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
    return null;
  };

  // Filter products when company selection changes
  useEffect(() => {
    if (selectedCompany) {
      const filtered = allProducts.filter(product => product.company_id === selectedCompany);
      setProducts(filtered);
    } else {
      setProducts(allProducts);
    }
  }, [selectedCompany, allProducts]);

  const handleCompanyFilter = (companyId: number | null) => {
    setSelectedCompany(companyId);
  };

  const handleAddToCart = useCallback(async (product: Product, buttonRef: HTMLButtonElement) => {
    createFlyingAnimation(buttonRef, product, async () => {
      const result = await addToCart({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
      
      if (!result.success) {
        setToastMessage(result.message || 'فشل إضافة المنتج');
        setShowToast(true);
        return;
      }
      
      setToastMessage('تم إضافة المنتج إلى السلة بنجاح!');
      setShowToast(true);
    });
  }, [addToCart, createFlyingAnimation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center text-[#2c2c2c]">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#d4af37] mb-4"></div>
            <p className="text-lg">جاري تحميل المنتجات الجديدة...</p>
          </div>
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
                <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent flex-1 max-w-xs"></div>
                <h1
                  ref={titleRef}
                  className="section-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c] flex items-center gap-3"
                >
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-lg animate-pulse">
                    جديد
                  </span>
                  المنتجات الجديدة
                </h1>
                <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent flex-1 max-w-xs"></div>
              </div>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                اكتشف أحدث المنتجات المضافة خلال الأسبوع الماضي
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {products.length} {products.length === 1 ? 'منتج جديد' : 'منتجات جديدة'}
              </p>
            </div>

            {/* Company Filter */}
            {companies.length > 0 && (
              <div className="mb-8 md:mb-12">
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                  <button
                    onClick={() => handleCompanyFilter(null)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      selectedCompany === null
                        ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/25'
                        : 'bg-white text-[#2c2c2c] border-2 border-gray-200 hover:border-[#d4af37] hover:text-[#d4af37]'
                    }`}
                  >
                    جميع الشركات
                  </button>
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanyFilter(company.id)}
                      className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                        selectedCompany === company.id
                          ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/25'
                          : 'bg-white text-[#2c2c2c] border-2 border-gray-200 hover:border-[#d4af37] hover:text-[#d4af37]'
                      }`}
                    >
                      {company.logo_url && (
                        <img
                          src={`${API_URL}${company.logo_url}`}
                          alt={company.name}
                          className="w-6 h-6 object-contain rounded"
                        />
                      )}
                      <span>{company.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-20">🆕</div>
                <p className="text-gray-500 text-lg">لا توجد منتجات جديدة حالياً</p>
                <p className="text-gray-400 text-sm mt-2">تحقق مرة أخرى قريباً للمنتجات الجديدة</p>
              </div>
            ) : (
              <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-full group"
                  >
                    <div className="product-card h-full flex flex-col">
                      <div 
                        onClick={() => {
                          router.push(`/product/${product.sku}`);
                        }}
                        className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 flex-shrink-0 mb-3 cursor-pointer"
                      >
                        {product.image_url ? (
                          <>
                            <Image
                              src={`${API_URL}${product.image_url}`}
                              alt={product.name}
                              fill
                              unoptimized
                              className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                            />
                            {product.hover_image_url && (
                              <Image
                                src={`${API_URL}${product.hover_image_url}`}
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
                        
                        {/* Sale Badge */}
                        {product.old_price && Number(product.old_price) > Number(product.price) && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg font-bold text-xs md:text-sm shadow-lg">
                            SALE
                          </div>
                        )}
                        
                        {/* New Label - positioned below SALE if it exists */}
                        <NewLabel 
                          className={product.old_price && Number(product.old_price) > Number(product.price) ? "top-12" : ""}
                        />
                      </div>

                      <div className="text-center flex flex-col flex-1">
                        <h3 
                          onClick={() => {
                            router.push(`/product/${product.sku}`);
                          }}
                          className="product-name text-lg md:text-xl font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-[#d4af37] transition-colors"
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
                              <span className="product-price text-lg md:text-xl font-bold text-[#d4af37]">
                                ₪{Number(product.price).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="product-price text-lg md:text-xl font-bold text-[#2c2c2c]">
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
                            ref={(el) => {
                              if (el) (el as any).product = product;
                            }}
                            onClick={(e) => {
                              const button = e.currentTarget as HTMLButtonElement;
                              handleAddToCart(product, button);
                            }}
                            disabled={isAnimating}
                            className="w-full px-3 py-3 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium text-sm flex items-center justify-center gap-2 mt-auto disabled:opacity-50"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>{isAnimating ? 'جاري الإضافة...' : 'أضف للسلة'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
