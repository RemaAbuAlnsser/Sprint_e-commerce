'use client';
import { API_URL } from '@/lib/api';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { ArrowRight, ShoppingCart, Eye, Filter, X, ChevronRight, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useFlyingAnimation } from '@/hooks/useFlyingAnimation';
import NewLabel from '@/components/NewLabel';
import { isProductNew } from '@/utils/dateUtils';
import Toast from '@/components/Toast';

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

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

interface Company {
  id: number;
  name: string;
  logo_url?: string;
}

interface Subcategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  category_id: number;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSubcategoryIndex, setCurrentSubcategoryIndex] = useState(0);
  const subcategoriesContainerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasSubcategoriesAnimated = useRef(false);
  const hasProductsAnimated = useRef(false);
  const { addToCart } = useCart();
  const { isAnimating, createFlyingAnimation } = useFlyingAnimation();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const categoryId = params.id;
        console.log('Fetching category:', categoryId);

        const [categoryRes, productsRes, subcategoriesRes] = await Promise.all([
          fetch(`http://104.234.26.192:3000/categories/${categoryId}`),
          fetch(`http://104.234.26.192:3000/products/category/${categoryId}`),
          fetch(`http://104.234.26.192:3000/subcategories/category/${categoryId}`)
        ]);

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          console.log('Category data:', categoryData);
          setCategory(categoryData);
        }

        let productsData: Product[] = [];
        if (productsRes.ok) {
          productsData = await productsRes.json();
          console.log('Products data:', productsData.length, 'products');
          setProducts(productsData);
          setAllProducts(productsData);
        }

        if (subcategoriesRes.ok) {
          const subcategoriesData = await subcategoriesRes.json();
          console.log('Subcategories data:', subcategoriesData);
          setSubcategories(subcategoriesData);
          
          // تفعيل فلتر القسم الفرعي من URL
          const subcategoryParam = searchParams.get('subcategory');
          if (subcategoryParam) {
            const subcategoryId = parseInt(subcategoryParam);
            if (subcategoriesData.some((s: Subcategory) => s.id === subcategoryId)) {
              setSelectedSubcategory(subcategoryId);
            }
          }
        }

        // Fetch companies for products in this category
        const uniqueCompanyIds = [...new Set(productsData.map((p: Product) => p.company_id).filter(Boolean))];
        
        if (uniqueCompanyIds.length > 0) {
          const companiesData = await Promise.all(
            uniqueCompanyIds.map(async (companyId) => {
              try {
                const res = await fetch(`http://104.234.26.192:3000/companies/${companyId}`);
                if (res.ok) return await res.json();
              } catch (error) {
                console.error('Error fetching company:', error);
              }
              return null;
            })
          );
          setCompanies(companiesData.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [params.id]);

  // Filter products when subcategory or company selection changes
  useEffect(() => {
    const filterProducts = async () => {
      let filtered = allProducts;

      // Filter by subcategory
      if (selectedSubcategory) {
        try {
          const response = await fetch(`http://104.234.26.192:3000/products/subcategory/${selectedSubcategory}`);
          if (response.ok) {
            filtered = await response.json();
          }
        } catch (error) {
          console.error('Error fetching filtered products:', error);
        }
      }

      // Filter by company
      if (selectedCompany) {
        filtered = filtered.filter(product => product.company_id === selectedCompany);
      }

      setProducts(filtered);
    };
    filterProducts();
  }, [selectedSubcategory, selectedCompany, allProducts]);

  const handleSubcategoryFilter = (subcategoryId: number | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleCompanyFilter = (companyId: number | null) => {
    setSelectedCompany(companyId);
  };

  const clearAllFilters = () => {
    setSelectedSubcategory(null);
    setSelectedCompany(null);
  };

  const getSubcategoriesPerView = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 3;
    if (window.innerWidth < 768) return 4;
    if (window.innerWidth < 1024) return 5;
    return 7;
  }, []);

  const [subcategoriesPerView, setSubcategoriesPerView] = useState(4);

  useEffect(() => {
    const updateSubcategoriesPerView = () => {
      setSubcategoriesPerView(getSubcategoriesPerView());
    };
    updateSubcategoriesPerView();
    window.addEventListener('resize', updateSubcategoriesPerView);
    return () => window.removeEventListener('resize', updateSubcategoriesPerView);
  }, [getSubcategoriesPerView]);

  const maxSubcategoryIndex = Math.max(0, subcategories.length - subcategoriesPerView);

  const scrollSubcategories = (direction: 'left' | 'right') => {
    setCurrentSubcategoryIndex(prev => {
      if (direction === 'left') {
        return Math.min(prev + 1, maxSubcategoryIndex);
      } else {
        return Math.max(prev - 1, 0);
      }
    });
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
      scrollSubcategories('left');
    } else if (isRightSwipe) {
      scrollSubcategories('right');
    }
  };

  useEffect(() => {
    if (loading || subcategories.length === 0 || !subcategoriesContainerRef.current || hasSubcategoriesAnimated.current) {
      return;
    }

    hasSubcategoriesAnimated.current = true;
    
    const ctx = gsap.context(() => {
      const items = subcategoriesContainerRef.current?.children;
      if (!items || items.length === 0) return;

      gsap.set(items, { opacity: 0, y: 20, scale: 0.9 });
      
      gsap.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.1,
      });
    }, subcategoriesContainerRef);

    return () => ctx.revert();
  }, [loading, subcategories]);

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

  useEffect(() => {
    if (loading || !category || products.length === 0 || !gridRef.current || hasProductsAnimated.current) {
      return;
    }

    hasProductsAnimated.current = true;
    
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
  }, [loading, category, products.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Skeleton */}
        <div className="relative h-48 md:h-64 lg:h-80 bg-gray-300 animate-pulse">
          <div className="relative h-full container mx-auto px-4 md:px-6 flex flex-col justify-end pb-6 md:pb-8">
            <div className="h-4 bg-gray-400 rounded w-24 mb-4"></div>
            <div className="h-8 md:h-12 bg-gray-400 rounded w-48 md:w-64 mb-2"></div>
            <div className="h-4 bg-gray-400 rounded w-64 md:w-96"></div>
          </div>
        </div>

        <main className="py-6 md:py-8">
          <div className="container mx-auto px-4 md:px-6">
            {/* Filters Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8 animate-pulse">
              <div className="space-y-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded-lg w-20"></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded-lg w-24"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200 mb-3"></div>
                  <div className="text-center">
                    <div className="h-6 bg-gray-200 rounded mb-3 mx-auto w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded mb-4 mx-auto w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
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
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section with Category Image */}
        <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] overflow-hidden">
          {category.image_url ? (
            <>
              <Image
                src={`http://104.234.26.192:3000${category.image_url}`}
                alt={category.name}
                fill
                className="object-cover opacity-30"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent" />
          )}
          
          <div className="relative h-full container mx-auto px-4 md:px-6 flex flex-col justify-end pb-6 md:pb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-white hover:text-[#d4af37] transition-colors mb-4 group w-fit"
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-semibold">العودة للرئيسية</span>
            </button>
            
            <h1
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
            >
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-200 text-sm md:text-base max-w-2xl">
                {category.description}
              </p>
            )}
          </div>
        </div>

      <main className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
            {/* Filters Content */}
            <div className="space-y-6">
              {/* Active Filters & Clear */}
              {(selectedSubcategory || selectedCompany) && (
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">الفلاتر النشطة:</span>
                    {selectedSubcategory && (
                      <span className="inline-flex items-center gap-1 bg-[#d4af37]/10 text-[#d4af37] px-3 py-1 rounded-full text-sm">
                        {subcategories.find(s => s.id === selectedSubcategory)?.name}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubcategory(null)} />
                      </span>
                    )}
                    {selectedCompany && (
                      <span className="inline-flex items-center gap-1 bg-[#d4af37]/10 text-[#d4af37] px-3 py-1 rounded-full text-sm">
                        {companies.find(c => c.id === selectedCompany)?.name}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCompany(null)} />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    مسح الكل
                  </button>
                </div>
              )}

              {/* Subcategories Carousel */}
              {subcategories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-bold text-[#2c2c2c] flex items-center gap-2">
                      الأقسام الفرعية
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollSubcategories('right')}
                        disabled={currentSubcategoryIndex === 0}
                        className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollSubcategories('left')}
                        disabled={currentSubcategoryIndex >= maxSubcategoryIndex}
                        className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={subcategoriesContainerRef}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {subcategories.slice(currentSubcategoryIndex, currentSubcategoryIndex + subcategoriesPerView).map((subcategory) => (
                      <div
                        key={subcategory.id}
                        onClick={() => handleSubcategoryFilter(subcategory.id === selectedSubcategory ? null : subcategory.id)}
                        className={`flex flex-col items-center cursor-pointer group transition-all duration-300 ${
                          selectedSubcategory === subcategory.id ? 'scale-105' : ''
                        }`}
                      >
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 mb-2 ${
                          selectedSubcategory === subcategory.id
                            ? 'ring-4 ring-[#d4af37] ring-offset-2'
                            : 'bg-white'
                        }`}>
                          {subcategory.image_url ? (
                            <Image
                              src={`http://104.234.26.192:3000${subcategory.image_url}`}
                              alt={subcategory.name}
                              width={96}
                              height={96}
                              unoptimized
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center">
                              <span className="text-white text-xl md:text-2xl font-bold">
                                {subcategory.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs md:text-sm font-medium text-center line-clamp-2 transition-colors ${
                          selectedSubcategory === subcategory.id
                            ? 'text-[#d4af37] font-bold'
                            : 'text-[#2c2c2c] group-hover:text-[#d4af37]'
                        }`}>
                          {subcategory.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies/Brands Filter */}
              {companies.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#2c2c2c] mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#d4af37] rounded-full"></span>
                    الماركات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCompanyFilter(null)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                        selectedCompany === null
                          ? 'bg-[#d4af37] text-white shadow-md'
                          : 'bg-gray-50 text-[#2c2c2c] hover:bg-gray-100'
                      }`}
                    >
                      الكل
                    </button>
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleCompanyFilter(company.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                          selectedCompany === company.id
                            ? 'bg-[#d4af37] text-white shadow-md'
                            : 'bg-gray-50 text-[#2c2c2c] hover:bg-gray-100'
                        }`}
                      >
                        {company.logo_url && (
                          <Image
                            src={`http://104.234.26.192:3000${company.logo_url}`}
                            alt={company.name}
                            width={20}
                            height={20}
                            unoptimized
                            className="w-5 h-5 object-contain rounded"
                          />
                        )}
                        <span>{company.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  عرض <span className="font-bold text-[#2c2c2c]">{products.length}</span> {products.length === 1 ? 'منتج' : 'منتجات'}
                </p>
              </div>
            </div>
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
                    onClick={() => {
                      router.push(`/product/${product.sku}`);
                    }}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-3 cursor-pointer"
                  >
                    {product.image_url ? (
                      <>
                        <Image
                          src={`http://104.234.26.192:3000${product.image_url}`}
                          alt={product.name}
                          fill
                          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                        />
                        {product.hover_image_url && (
                          <Image
                            src={`http://104.234.26.192:3000${product.hover_image_url}`}
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

                    {/* Sale Badge */}
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

                  <div className="text-center">
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
