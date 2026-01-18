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
  buttonRef: React.RefObject<HTMLButtonElement>;
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
      className="fixed left-0 right-0 bg-white shadow-lg border-b-2 border-gray-200 z-40"
      style={{ top: '73px' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Search Input */}
        <div className="py-4">
          <div className="relative max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="w-full px-6 py-4 pr-14 text-base border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#2c2c2c] transition-colors"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <button
              onClick={onClose}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-h-96 overflow-y-auto pb-4">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#2c2c2c]"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="py-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.name)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={`http://localhost:3000${product.image_url}`}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                    {product.name}
                  </h4>
                  <p className="text-base text-[#d4af37] font-bold">
                    ₪{Number(product.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">ابدأ الكتابة للبحث...</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
