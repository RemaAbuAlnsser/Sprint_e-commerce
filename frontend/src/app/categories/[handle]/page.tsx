'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/home/ProductCard'
import { API_URL } from '@/lib/api'

interface ParentCategory {
  id: string
  name: string
  handle: string
  description: string
  image_url: string
}

interface Subcategory {
  id: string
  name: string
  handle: string
  description: string
  image_url: string
  display_order: number
}

interface Product {
  id: string
  title: string
  handle: string
  thumbnail: string
  hover_image?: string
  variants?: { id: string; price: number; compare_at_price?: number; inventory_quantity?: number }[]
  is_exclusive?: boolean
  category_name?: string
  brand_name?: string
}

export default function CategoryPage() {
  const params = useParams()
  const handle = params.handle as string

  const [parentCategory, setParentCategory] = useState<ParentCategory | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch category data + all products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/store/parent-categories/handle/${handle}`),
          fetch(`${API_URL}/store/parent-categories/handle/${handle}/products`),
        ])
        const catData = await catRes.json()
        const prodData = await prodRes.json()

        setParentCategory(catData.parent_category)
        setSubcategories(catData.subcategories || [])
        setProducts(prodData.products || [])
      } catch (error) {
        console.error('Error fetching category:', error)
      } finally {
        setLoading(false)
      }
    }

    if (handle) {
      fetchData()
    }
  }, [handle])

  // Filter by subcategory
  const handleSubcategoryClick = async (subHandle: string | null) => {
    setActiveSubcategory(subHandle)
    setProductsLoading(true)
    try {
      const url = subHandle
        ? `${API_URL}/store/parent-categories/handle/${handle}/products?subcategory=${subHandle}`
        : `${API_URL}/store/parent-categories/handle/${handle}/products`
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error filtering products:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  // Scroll subcategory slider
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === 'right' ? 250 : -250,
      behavior: 'smooth',
    })
  }, [])

  // Transform product for ProductCard
  const transformProduct = (p: Product) => ({
    id: p.id,
    title: p.title,
    price: p.variants?.[0]?.price || 0,
    originalPrice: p.variants?.[0]?.compare_at_price || undefined,
    image: p.thumbnail || '',
    hoverImage: p.hover_image || undefined,
    slug: p.handle,
    variantId: p.variants?.[0]?.id || '',
    inventory: p.variants?.[0]?.inventory_quantity || 0,
    isExclusive: p.is_exclusive || false,
    brandName: p.brand_name || undefined,
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!parentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">الفئة غير موجودة</h1>
            <Link href="/" className="text-primary hover:underline">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Navbar />

      {/* Hero Section - Compact */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-gray-50 py-10 overflow-hidden">
        <div className="absolute top-5 right-5 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-5 left-5 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{parentCategory.name}</span>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-black mb-2 bg-gradient-to-r from-primary via-red-600 to-rose-500 bg-clip-text text-transparent">
              {parentCategory.name}
            </h1>
            {parentCategory.description && (
              <p className="text-gray-600 max-w-2xl mx-auto">{parentCategory.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories Slider */}
      {subcategories.length > 0 && (
        <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              {/* Scroll Right Button */}
              <button
                onClick={() => scroll('right')}
                className="flex p-2 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
                aria-label="التالي"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Scrollable Container */}
              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* "All" Button */}
                <button
                  onClick={() => handleSubcategoryClick(null)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                    activeSubcategory === null
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  الكل
                </button>

                {/* Subcategory Buttons */}
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryClick(sub.handle)}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
                      activeSubcategory === sub.handle
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {sub.image_url && (
                      <img
                        src={sub.image_url}
                        alt={sub.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    )}
                    <span>{sub.name}</span>
                  </button>
                ))}
              </div>

              {/* Scroll Left Button */}
              <button
                onClick={() => scroll('left')}
                className="flex p-2 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
                aria-label="السابق"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {productsLoading ? 'جاري البحث...' : `${products.length} منتج`}
            {activeSubcategory && (
              <span className="text-primary font-medium">
                {' '}في {subcategories.find(s => s.handle === activeSubcategory)?.name}
              </span>
            )}
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[3.7/4] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">لا توجد منتجات</h2>
            <p className="text-gray-500 mb-6">
              {activeSubcategory
                ? 'لا توجد منتجات في هذه الفئة الثانوية'
                : 'لم يتم إضافة منتجات لهذه الفئة بعد'}
            </p>
            {activeSubcategory && (
              <button
                onClick={() => handleSubcategoryClick(null)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                عرض جميع المنتجات
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center">
            {products.map((product) => (
              <ProductCard key={product.id} product={transformProduct(product)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
