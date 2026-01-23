'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';
import { Search, ShoppingCart, X, SlidersHorizontal, Sparkles, Clock, TrendingUp, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFlyingAnimation } from '@/hooks/useFlyingAnimation';
import NewLabel from '@/components/NewLabel';
import { isProductNew } from '@/utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  image_url: string;
  hover_image_url?: string;
  category_id: number;
  created_at: string;
  category_name?: string;
  sku: string;
}

interface Suggestion {
  type: 'product' | 'category';
  text: string;
}

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [popularCategories, setPopularCategories] = useState<{ name: string; handle: string }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'relevance'
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addToCart } = useCart();
  const { isAnimating, createFlyingAnimation } = useFlyingAnimation();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch categories and popular data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, popularRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products/search/popular`)
        ]);

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(Array.isArray(data) ? data : []);
        }
        if (popularRes.ok) {
          const data = await popularRes.json();
          setPopularCategories(data.popular_categories || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, searchFilters: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (searchFilters.category) params.set('category', searchFilters.category);
      if (searchFilters.minPrice) params.set('min_price', searchFilters.minPrice);
      if (searchFilters.maxPrice) params.set('max_price', searchFilters.maxPrice);
      if (searchFilters.sort) params.set('sort', searchFilters.sort);

      const res = await fetch(`${API_URL}/products/search?${params.toString()}`);
      const data = await res.json();
      
      setProducts(data.products || []);
      setTotal(data.total || 0);

      // Save to recent searches
      if (searchQuery && searchQuery.length > 1) {
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  // Initial search on page load
  useEffect(() => {
    if (initialQuery || filters.category) {
      performSearch(initialQuery, filters);
    }
  }, []);

  // Fetch suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    performSearch(query, filters);
    
    // Update URL
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key === 'minPrice' ? 'min_price' : key === 'maxPrice' ? 'max_price' : key, value);
    });
    router.push(`/search?${params.toString()}`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    performSearch(suggestion.text, filters);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    performSearch(query, filters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters: FilterState = {
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'relevance'
    };
    setFilters(clearedFilters);
    performSearch(query, clearedFilters);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = async (product: Product, buttonElement: HTMLElement) => {
    createFlyingAnimation(buttonElement, product, async () => {
      const result = await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
      
      if (!result.success) {
        alert(result.message || 'فشل إضافة المنتج');
      }
    });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="section-heading text-3xl md:text-4xl font-bold text-[#2c2c2c] mb-2">
              البحث الذكي
            </h1>
            <p className="text-gray-600">ابحث عن أي منتج بسهولة وسرعة</p>
          </motion.div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="ابحث عن منتجات..."
                className="w-full px-6 py-4 pr-14 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/20 outline-none transition-all shadow-lg"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setSuggestions([]); }}
                  className="absolute left-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#2c2c2c] text-white rounded-xl hover:bg-[#1a1a1a] transition-colors"
              >
                بحث
              </button>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0 || popularCategories.length > 0) && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Sparkles className="w-4 h-4" />
                        <span>اقتراحات</span>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-right transition-colors"
                        >
                          {suggestion.type === 'product' && <Search className="w-4 h-4 text-gray-400" />}
                          {suggestion.type === 'category' && <Tag className="w-4 h-4 text-green-500" />}
                          <span className="text-gray-700">{suggestion.text}</span>
                          <span className="text-xs text-gray-400 mr-auto">
                            {suggestion.type === 'product' && 'منتج'}
                            {suggestion.type === 'category' && 'تصنيف'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && !query && (
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>عمليات بحث سابقة</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => { setQuery(search); performSearch(search, filters); setShowSuggestions(false); }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  {!query && popularCategories.length > 0 && (
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <TrendingUp className="w-4 h-4" />
                        <span>الأكثر شعبية</span>
                      </div>
                      <div className="space-y-1">
                        {popularCategories.slice(0, 5).map((cat, index) => (
                          <button
                            key={index}
                            onClick={() => { handleFilterChange('category', cat.handle); performSearch(query, { ...filters, category: cat.handle }); setShowSuggestions(false); }}
                            className="block w-full text-right px-2 py-1 text-sm text-gray-700 hover:text-[#d4af37] hover:bg-gray-50 rounded"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                hasActiveFilters ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#2c2c2c]' : 'border-gray-200 hover:border-[#d4af37]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>الفلاتر</span>
              {hasActiveFilters && <span className="w-2 h-2 bg-[#d4af37] rounded-full" />}
            </button>

            <select
              value={filters.sort}
              onChange={(e) => { handleFilterChange('sort', e.target.value); performSearch(query, { ...filters, sort: e.target.value }); }}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] outline-none bg-white"
            >
              <option value="relevance">الأكثر صلة</option>
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                <span>مسح الفلاتر</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto mb-8 overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#d4af37] outline-none"
                    >
                      <option value="">جميع التصنيفات</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">نطاق السعر</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        placeholder="من"
                        className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 focus:border-[#d4af37] outline-none"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        placeholder="إلى"
                        className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    إعادة تعيين
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-[#2c2c2c] text-white rounded-xl hover:bg-[#1a1a1a] transition-colors"
                  >
                    تطبيق الفلاتر
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Results Header */}
              {(query || hasActiveFilters) && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    {total > 0 ? (
                      <>تم العثور على <span className="font-bold text-[#d4af37]">{total}</span> منتج</>
                    ) : (
                      'لم يتم العثور على نتائج'
                    )}
                  </p>
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                    >
                <div 
                  onClick={() => router.push(`/product/${product.sku}`)}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-4 cursor-pointer"
                >
                  {product.image_url ? (
                    <>
                      <Image
                        src={`${API_URL}${product.image_url}`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.hover_image_url && (
                        <Image
                          src={`${API_URL}${product.hover_image_url}`}
                          alt={product.name}
                          fill
                          className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-20">📦</span>
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

                <div className="p-4 text-center">
                  <h3 
                    onClick={() => router.push(`/product/${product.sku}`)}
                    className="product-name text-xl font-bold text-[#2c2c2c] mb-3 line-clamp-2 cursor-pointer hover:text-[#d4af37] transition-colors"
                  >
                    {product.name}
                  </h3>
                  <div className="mb-4">
                    <span className="product-price text-lg font-bold text-[#d4af37]">
                      ₪{Number(product.price).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(product, e.currentTarget)}
                    disabled={isAnimating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                    <span>{isAnimating ? 'جاري الإضافة...' : 'أضف للسلة'}</span>
                  </button>
                  {product.description && (
                    <p className="text-xs text-gray-600 mt-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (query || hasActiveFilters) ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">لم يتم العثور على نتائج</h3>
                  <p className="text-gray-500 mb-4">جرب البحث بكلمات مختلفة أو تغيير الفلاتر</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-[#2c2c2c] text-white rounded-xl hover:bg-[#1a1a1a] transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">ابدأ البحث</h3>
                  <p className="text-gray-500">اكتب في مربع البحث للعثور على منتجاتك المفضلة</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="text-gray-600">جاري التحميل...</div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
