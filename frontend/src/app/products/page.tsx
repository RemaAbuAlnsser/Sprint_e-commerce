'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/home/ProductCard'
import { SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCardSkeleton, FilterSidebarSkeleton } from '@/components/ui/Skeleton'
import PriceRangeSlider from '@/components/ui/PriceRangeSlider'
import { API_URL } from '@/lib/api'

interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  slug: string
  variantId?: string
  inventory?: number
  category_name?: string
  brand_name?: string
}

interface Category {
  id: string
  name: string
  handle?: string
  parent_category_id?: string | null
  children?: Category[]
}

interface Brand {
  id: string
  name: string
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [maxPrice, setMaxPrice] = useState<number>(1000)

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const brandParam = searchParams.get('brand')
    if (brandParam && brands.length > 0) {
      const brand = brands.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === brandParam)
      if (brand) {
        setSelectedBrand(brand.id)
      }
    }

    const categoryParam = searchParams.get('category')
    if (categoryParam && categories.length > 0) {
      const cat = categories.find(c => c.handle === categoryParam || c.name.toLowerCase().replace(/\s+/g, '-') === categoryParam)
      if (cat) {
        setSelectedCategory(cat.id)
      }
    }
  }, [searchParams, brands, categories])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, parentCatsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch(`${API_URL}/store/products`),
        fetch(`${API_URL}/store/parent-categories`),
        fetch(`${API_URL}/store/categories`),
        fetch(`${API_URL}/store/brands`)
      ])
      
      const productsData = await productsRes.json()
      const parentCatsData = await parentCatsRes.json()
      const categoriesData = await categoriesRes.json()
      const brandsData = await brandsRes.json()
      
      // Transform products to match ProductCard interface
      const transformedProducts = (productsData.products || []).map((p: any) => ({
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
        category_name: p.category_name,
        brand_name: p.brand_name,
      }))
      
      setProducts(transformedProducts)
      
      // Get all subcategories
      const allSubcategories = categoriesData.categories || []
      setCategories(allSubcategories)
      
      // Build parent categories with their subcategories
      const parents = (parentCatsData.parent_categories || []).map((parent: any) => ({
        id: parent.id,
        name: parent.name,
        handle: parent.handle,
        children: allSubcategories.filter((sub: any) => sub.parent_category_id === parent.id)
      }))
      
      setParentCategories(parents)
      setBrands(brandsData.brands || [])
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  // Calculate max price from products
  useEffect(() => {
    if (products.length > 0) {
      const max = Math.max(...products.map(p => p.price / 100))
      setMaxPrice(Math.ceil(max))
      setPriceRange([0, Math.ceil(max)])
    }
  }, [products])

  // Apply filters
  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category_name !== categories.find(c => c.id === selectedCategory)?.name) {
      return false
    }
    if (selectedBrand && product.brand_name !== brands.find(b => b.id === selectedBrand)?.name) {
      return false
    }
    const priceInShekels = product.price / 100
    if (priceInShekels < priceRange[0] || priceInShekels > priceRange[1]) {
      return false
    }
    return true
  })

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setPriceRange([0, maxPrice])
  }

  const activeFiltersCount = [
    selectedCategory,
    selectedBrand,
    priceRange[0] > 0 || priceRange[1] < maxPrice
  ].filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />
      <main className="flex-1">

      {/* Page Header */}
      <section className="bg-gradient-to-bl from-primary/10 via-white to-purple-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900">جميع المنتجات</h1>
          <p className="text-gray-600">تصفح مجموعتنا الكاملة من مستحضرات التجميل والعناية</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters - Hidden on small screens */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    الفلاتر
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-500 hover:underline flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      مسح ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-gray-800">التصنيفات</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-right px-3 py-2 rounded-lg transition-colors text-sm ${
                        !selectedCategory ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      الكل
                    </button>
                    {parentCategories.map((parent) => (
                      <div key={parent.id}>
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedCategories)
                            if (newExpanded.has(parent.id)) {
                              newExpanded.delete(parent.id)
                            } else {
                              newExpanded.add(parent.id)
                            }
                            setExpandedCategories(newExpanded)
                          }}
                          className="w-full text-right px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-sm font-semibold text-gray-900"
                        >
                          <span>{parent.name}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              expandedCategories.has(parent.id) ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedCategories.has(parent.id) && parent.children && parent.children.length > 0 && (
                          <div className="mr-4 mt-1 space-y-1">
                            {parent.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => setSelectedCategory(child.id)}
                                className={`w-full text-right px-3 py-2 rounded-lg transition-colors text-sm ${
                                  selectedCategory === child.id
                                    ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                                    : 'hover:bg-gray-50 text-gray-900'
                                }`}
                              >
                                {child.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6 border-t pt-6">
                  <h3 className="font-semibold mb-3 text-gray-900">الشركة المصنعة</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedBrand('')}
                      className={`w-full text-right px-3 py-2 rounded-lg transition-colors text-sm ${
                        !selectedBrand ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      الكل
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`w-full text-right px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedBrand === brand.id ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">نطاق السعر</h3>
                  <PriceRangeSlider
                    min={0}
                    max={maxPrice}
                    value={priceRange}
                    onChange={setPriceRange}
                  />
                </div>
              </div>
            </div>

            {/* Products Area */}
            <div className="lg:col-span-3">
              {/* Top Bar with Price Slider */}
              <div className="bg-white rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">فلتر السعر</h3>
                  <span className="text-gray-500 text-sm">
                    {loading ? 'جاري التحميل...' : `${filteredProducts.length} منتج`}
                  </span>
                </div>
                
                <PriceRangeSlider
                  min={0}
                  max={maxPrice}
                  value={priceRange}
                  onChange={setPriceRange}
                />
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <p className="text-xl text-gray-500 mb-4">لا توجد منتجات تطابق الفلاتر المحددة</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="text-gray-600">جاري التحميل...</div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
