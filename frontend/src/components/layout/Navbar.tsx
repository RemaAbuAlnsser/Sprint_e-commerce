'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ShoppingCart, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import AnimatedLogo from '@/components/ui/AnimatedLogo'
import { API_URL } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
  brand_name?: string;
  category_name?: string;
  variants?: { price: number }[];
}

interface ParentCategory {
  id: string;
  name: string;
  handle: string;
  image_url: string | null;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  handle: string;
  image_url: string | null;
}

export default function Navbar() {
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Mega menu state
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([])
  const [activeParent, setActiveParent] = useState<string | null>(null)
  const [activeSubcategories, setActiveSubcategories] = useState<Subcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [mobileView, setMobileView] = useState<'parents' | 'subcategories'>('parents')
  const megaMenuRef = useRef<HTMLDivElement>(null)

  // Fetch parent categories
  const fetchParentCategories = useCallback(async () => {
    if (parentCategories.length > 0) return
    setLoadingCategories(true)
    try {
      const res = await fetch(`${API_URL}/store/parent-categories`)
      const data = await res.json()
      const cats = data.parent_categories || []
      setParentCategories(cats)
      if (cats.length > 0) {
        setActiveParent(cats[0].id)
        fetchSubcategories(cats[0].id)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }, [parentCategories.length])

  // Fetch subcategories for a parent
  const fetchSubcategories = async (parentId: string) => {
    try {
      const res = await fetch(`${API_URL}/store/parent-categories/${parentId}`)
      const data = await res.json()
      setActiveSubcategories(data.subcategories || [])
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      setActiveSubcategories([])
    }
  }

  // Handle parent category hover (desktop)
  const handleParentHover = (parentId: string) => {
    if (activeParent === parentId) return
    setActiveParent(parentId)
    fetchSubcategories(parentId)
  }

  // Handle parent category click (mobile → go to subcategories view)
  const handleParentClick = (parentId: string) => {
    setActiveParent(parentId)
    fetchSubcategories(parentId)
    setMobileView('subcategories')
  }

  // Open mega menu
  const openMegaMenu = () => {
    setIsMegaMenuOpen(true)
    setIsSearchOpen(false)
    setMobileView('parents')
    fetchParentCategories()
    document.body.style.overflow = 'hidden'
  }

  // Close mega menu
  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false)
    document.body.style.overflow = ''
  }

  // Live search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/store/search?q=${encodeURIComponent(searchQuery)}&limit=6`)
        const data = await res.json()
        setSearchResults(data.products || [])
        setShowResults(true)
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [searchQuery])

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
      setShowResults(false)
    }
  }

  const handleProductClick = (handle: string) => {
    setShowResults(false)
    setSearchQuery('')
    setIsSearchOpen(false)
    router.push(`/product/${handle}`)
  }

  useEffect(() => {
    setMounted(true)
    
    // Scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mega menu on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMegaMenu()
    }
    if (isMegaMenuOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isMegaMenuOpen])

  return (
    <>
      <nav 
        className="sticky top-0 z-50 bg-white border-b border-gray-200 py-6"
      >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Right Side - Hamburger Menu Button */}
          <button
            onClick={openMegaMenu}
            className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6" />
            <span className="text-base font-medium hidden sm:inline">القائمة</span>
          </button>

          {/* Center - Logo */}
          <AnimatedLogo />

          {/* Left Side - Search & Cart */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => { setIsSearchOpen(!isSearchOpen); closeMegaMenu(); }}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative text-gray-700 hover:text-primary transition-colors"
              data-cart-icon
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4"
          >
            <div className="container mx-auto" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  placeholder="ابحث عن المنتجات..."
                  className="w-full pr-12 pl-20 py-3 bg-gray-100 rounded-xl text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {loading && (
                  <div className="absolute left-24 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                <button
                  type="submit"
                  className="absolute left-12 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                >
                  بحث
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSearchOpen(false); setShowResults(false); setSearchQuery(''); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-800" />
                </button>
              </form>

              {/* Live Search Results */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto"
                  >
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.handle)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-right"
                        >
                          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.thumbnail ? (
                              <img 
                                src={product.thumbnail} 
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">{product.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.brand_name && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {product.brand_name}
                                </span>
                              )}
                              {product.category_name && (
                                <span className="text-xs text-gray-500">
                                  {product.category_name}
                                </span>
                              )}
                            </div>
                          </div>
                          {product.variants && product.variants[0] && (
                            <div className="text-primary font-bold">
                              {(product.variants[0].price / 100).toFixed(2)} ₪
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-3 bg-gray-50">
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className="block text-center text-primary hover:text-primary/80 font-medium text-sm"
                        onClick={() => { setIsSearchOpen(false); setShowResults(false); }}
                      >
                        عرض جميع النتائج ({searchResults.length}+)
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Results */}
              <AnimatePresence>
                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 bg-white rounded-xl shadow-xl border border-gray-200 p-6 text-center"
                  >
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-gray-600 font-medium">لم يتم العثور على نتائج</p>
                    <p className="text-sm text-gray-400 mt-1">جرب كلمات بحث مختلفة</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>

    {/* Mega Menu Overlay */}
    <AnimatePresence>
      {isMegaMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={closeMegaMenu}
          />

          {/* Mega Menu Panel */}
          <motion.div
            ref={megaMenuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[70] bg-white shadow-2xl max-h-[100vh] md:max-h-[85vh] h-full md:h-auto overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {/* Mobile Back Button */}
                {mobileView === 'subcategories' && (
                  <button
                    onClick={() => setMobileView('parents')}
                    className="md:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <h2 className="text-base md:text-lg font-bold text-gray-900">
                  {mobileView === 'subcategories' && activeParent
                    ? parentCategories.find(p => p.id === activeParent)?.name || 'جميع الأقسام'
                    : 'جميع الأقسام'}
                </h2>
              </div>
              <button
                onClick={closeMegaMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content - Desktop: side by side | Mobile: stacked views */}
            <div className="flex h-[calc(100vh-53px)] md:h-[calc(85vh-65px)]">

              {/* Parent Categories List */}
              <div className={`${
                mobileView === 'parents' ? 'flex' : 'hidden'
              } md:flex flex-col w-full md:w-72 border-l-0 md:border-l border-gray-100 overflow-y-auto bg-gray-50/50 flex-shrink-0`}>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-12 flex-1">
                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="py-1 md:py-2">
                    {parentCategories.map((parent) => (
                      <button
                        key={parent.id}
                        onMouseEnter={() => handleParentHover(parent.id)}
                        onClick={() => handleParentClick(parent.id)}
                        className={`w-full flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 text-right transition-all duration-150 ${
                          activeParent === parent.id
                            ? 'bg-white text-primary border-r-[3px] border-primary shadow-sm'
                            : 'text-gray-700 hover:bg-white/80 border-r-[3px] border-transparent'
                        }`}
                      >
                        {parent.image_url ? (
                          <img
                            src={parent.image_url}
                            alt={parent.name}
                            className="w-9 h-9 md:w-8 md:h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 md:w-8 md:h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-lg">
                            📦
                          </div>
                        )}
                        <span className="font-medium text-sm flex-1">{parent.name}</span>
                        <ChevronLeft className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          activeParent === parent.id ? 'text-primary' : 'text-gray-400'
                        }`} />
                      </button>
                    ))}

                    {/* View All Products link */}
                    <Link
                      href="/products"
                      onClick={closeMegaMenu}
                      className="w-full flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 text-right text-primary hover:bg-primary/5 transition-colors mt-1 md:mt-2 border-t border-gray-100"
                    >
                      <span className="font-bold text-sm">عرض جميع المنتجات</span>
                      <ChevronLeft className="w-4 h-4 mr-auto" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Subcategories Grid */}
              <div className={`${
                mobileView === 'subcategories' ? 'flex' : 'hidden'
              } md:flex flex-col flex-1 overflow-y-auto p-4 md:p-6`}>
                {activeParent && (
                  <motion.div
                    key={activeParent}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Parent category header */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">
                        {parentCategories.find(p => p.id === activeParent)?.name}
                      </h3>
                      <Link
                        href={`/categories/${parentCategories.find(p => p.id === activeParent)?.handle}`}
                        onClick={closeMegaMenu}
                        className="text-xs md:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        عرض الكل
                        <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </Link>
                    </div>

                    {/* Subcategories grid */}
                    {activeSubcategories.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                        {activeSubcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${sub.handle}`}
                            onClick={closeMegaMenu}
                            className="group flex flex-col items-center text-center p-2 md:p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 mb-2 md:mb-3 group-hover:shadow-md transition-shadow">
                              {sub.image_url ? (
                                <img
                                  src={sub.image_url}
                                  alt={sub.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl text-gray-300">
                                  📦
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] md:text-xs font-medium text-gray-700 group-hover:text-primary transition-colors leading-tight">
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 md:py-16 text-gray-400">
                        <div className="text-4xl md:text-5xl mb-3">📂</div>
                        <p className="text-sm">لا توجد فئات ثانوية حالياً</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}
