'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sku: string;
}

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const SearchDropdown = memo(function SearchDropdown({ isOpen, onClose, buttonRef }: SearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [popularCategories, setPopularCategories] = useState<{ name: string; handle: string }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { addToCart } = useCart();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
          fetch('http://104.234.26.192:3000/categories'),
          fetch('http://104.234.26.192:3000/products/search/popular')
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

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setProducts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Fetch products
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      const productsRes = await fetch(`http://104.234.26.192:3000/products/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (productsRes.ok) {
        const text = await productsRes.text();
        try {
          const data = JSON.parse(text);
          setProducts((data.products || []).slice(0, 6));
        } catch (jsonError) {
          console.error('Invalid JSON response:', text);
          setProducts([]);
        }
      } else {
        console.error('API request failed:', productsRes.status, productsRes.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleProductClick = (productSku: string) => {
    // Save to recent searches
    if (query.length > 1) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    
    router.push(`/product/${productSku}`);
    onClose();
  };

  const handleViewAllResults = () => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed left-0 right-0 bg-gradient-to-b from-white via-white to-gray-50/80 shadow-2xl backdrop-blur-xl border-b border-gray-200/50 z-40"
          style={{ top: '73px' }}
        >
          <div className="container mx-auto px-4 md:px-6">
            {/* Search Input */}
            <div className="py-6">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/5 via-purple-500/5 to-[#d4af37]/5 rounded-2xl blur-xl opacity-50"></div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="ابحث عن منتجات، تصنيفات..."
                  className="relative w-full px-6 py-5 pr-14 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={22} />
                </div>
                {query && (
                  <button
                    onClick={() => { setQuery(''); setProducts([]); }}
                    className="absolute left-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-h-[500px] overflow-y-auto pb-6">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#d4af37]"></div>
                  <p className="mt-3 text-gray-500 text-sm">جاري البحث...</p>
                </div>
              ) : query.length >= 2 ? (
                <div className="space-y-4">
                  {/* Products */}
                  {products.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Search className="w-4 h-4" />
                          <span className="font-medium">المنتجات ({products.length})</span>
                        </div>
                        {products.length >= 6 && (
                          <button
                            onClick={handleViewAllResults}
                            className="text-sm text-[#d4af37] hover:text-[#2c2c2c] font-medium transition-colors"
                          >
                            عرض الكل ←
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {products.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleProductClick(product.sku)}
                            className="group flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#d4af37]/5 cursor-pointer transition-all duration-300 rounded-xl border border-transparent hover:border-gray-200/50 hover:shadow-md"
                          >
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-all group-hover:scale-105">
                              {product.image_url ? (
                                <Image
                                  src={`http://104.234.26.192:3000${product.image_url}`}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="product-name text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-[#2c2c2c]">
                                {product.name}
                              </h4>
                              <p className="product-price text-base text-[#d4af37] font-bold">₪{Number(product.price).toFixed(2)}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5 text-[#2c2c2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {products.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="text-5xl mb-3 opacity-20">🔍</div>
                      <p className="text-gray-500 font-medium text-sm">لا توجد نتائج</p>
                      <p className="text-gray-400 text-xs mt-1">جرب كلمات بحث مختلفة</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 px-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">عمليات بحث سابقة</span>
                      </div>
                      <div className="flex flex-wrap gap-2 px-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => { setQuery(search); fetchSuggestions(search); }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  {popularCategories.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 px-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">الأكثر شعبية</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-2">
                        {popularCategories.slice(0, 6).map((cat, index) => (
                          <button
                            key={index}
                            onClick={() => { router.push(`/category/${cat.handle}`); onClose(); }}
                            className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#d4af37]/10 hover:to-[#d4af37]/5 rounded-xl text-sm text-gray-700 hover:text-[#2c2c2c] font-medium transition-all border border-gray-200 hover:border-[#d4af37]/30"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SearchDropdown;
