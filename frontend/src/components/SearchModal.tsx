'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import gsap from 'gsap';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  hover_image_url?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllProducts();
      document.body.style.overflow = 'hidden';
      
      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(
          modalRef.current,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      filterProducts(searchQuery);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

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
    setFilteredProducts(filtered);
  };

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          onClose();
          setSearchQuery('');
          setFilteredProducts([]);
        },
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    const result = await addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    
    if (!result.success) {
      alert(result.message || 'فشل إضافة المنتج');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المنتجات..."
                autoFocus
                className="w-full px-6 py-3 pr-12 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#2c2c2c] transition-colors"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {searchQuery && (
            <p className="text-gray-600 mt-3 text-sm">
              {filteredProducts.length} منتج
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#2c2c2c]"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#2c2c2c] hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div 
                    onClick={() => {
                      router.push(`/product/${encodeURIComponent(product.name)}`);
                      handleClose();
                    }}
                    className="relative h-48 overflow-hidden bg-gray-100"
                  >
                    {product.image_url ? (
                      <Image
                        src={`http://localhost:3000${product.image_url}`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-20">📦</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-center">
                    <h3 
                      onClick={() => {
                        router.push(`/product/${encodeURIComponent(product.name)}`);
                        handleClose();
                      }}
                      className="text-lg font-bold text-[#2c2c2c] mb-3 line-clamp-2 cursor-pointer hover:text-[#d4af37] transition-colors"
                    >
                      {product.name}
                    </h3>
                    <div className="mb-3">
                      <span className="text-lg font-bold text-[#d4af37]">
                        ₪{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors text-sm font-medium"
                    >
                      <ShoppingCart size={16} />
                      <span>أضف للسلة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-600">
                لم نجد أي منتجات تطابق بحثك. جرب كلمات مختلفة.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                ابدأ البحث
              </h3>
              <p className="text-gray-600">
                اكتب في مربع البحث أعلاه للعثور على المنتجات
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
