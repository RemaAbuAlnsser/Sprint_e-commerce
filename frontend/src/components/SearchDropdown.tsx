'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function SearchDropdown({ isOpen, onClose, buttonRef }: SearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllProducts();
      inputRef.current?.focus();
    } else {
      setSearchQuery('');
      setFilteredProducts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      filterProducts(searchQuery);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

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

  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(filtered.slice(0, 8)); // عرض أول 8 نتائج
  };

  const handleProductClick = (productName: string) => {
    router.push(`/product/${encodeURIComponent(productName)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed left-0 right-0 bg-gradient-to-b from-white via-white to-gray-50/80 shadow-2xl backdrop-blur-xl border-b border-gray-200/50 z-40 animate-in slide-in-from-top duration-300"
      style={{ top: '73px' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Search Input */}
        <div className="py-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2c]/5 via-purple-500/5 to-[#2c2c2c]/5 rounded-full blur-xl opacity-50"></div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="relative w-full px-6 py-5 pr-14 text-base border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#2c2c2c] focus:shadow-lg focus:shadow-[#2c2c2c]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 hover:scale-110">
              <Search size={22} className="animate-pulse" />
            </div>
            <button
              onClick={onClose}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300 hover:scale-110"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Results - تظهر فقط عند البحث */}
      {searchQuery && (
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-h-96 overflow-y-auto pb-6 custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#2c2c2c] shadow-lg"></div>
              <p className="mt-3 text-gray-500 text-sm">جاري البحث...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="py-2 space-y-2">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.name)}
                  className="group flex items-center gap-4 px-5 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30 cursor-pointer transition-all duration-300 rounded-xl border border-transparent hover:border-gray-200/50 hover:shadow-md hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 ring-2 ring-gray-100 group-hover:ring-[#2c2c2c]/20">
                    {product.image_url ? (
                      <Image
                        src={`http://localhost:3000${product.image_url}`}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-[#2c2c2c] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-base text-[#d4af37] font-bold flex items-center gap-1">
                      <span className="text-xs">₪</span>
                      {Number(product.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-[#2c2c2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3 opacity-20">🔍</div>
              <p className="text-gray-500 font-medium text-sm">لا توجد نتائج</p>
              <p className="text-gray-400 text-xs mt-1">جرب كلمات بحث مختلفة</p>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
