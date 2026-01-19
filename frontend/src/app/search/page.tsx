'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';
import { Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFlyingAnimation } from '@/hooks/useFlyingAnimation';
import NewLabel from '@/components/NewLabel';
import { isProductNew } from '@/utils/dateUtils';

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
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAnimating, createFlyingAnimation } = useFlyingAnimation();

  useEffect(() => {
    fetchAllProducts();
  }, []);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterProducts(searchQuery);
  };

  const handleAddToCart = async (product: Product, buttonElement: HTMLElement) => {
    // Start flying animation
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#2c2c2c] transition-colors"
            />
            <button
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2c2c]">
            {searchQuery ? (
              <>
                نتائج البحث عن: <span className="text-[#d4af37]">"{searchQuery}"</span>
              </>
            ) : (
              'ابحث عن المنتجات'
            )}
          </h1>
          {searchQuery && (
            <p className="text-gray-600 mt-2">
              {filteredProducts.length} منتج
            </p>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#2c2c2c]"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-4">
                  {product.image_url ? (
                    <>
                      <Image
                        src={`http://localhost:3000${product.image_url}`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.hover_image_url && (
                        <Image
                          src={`http://localhost:3000${product.hover_image_url}`}
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
                  <h3 className="text-xl font-bold text-[#2c2c2c] mb-3 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-lg font-bold text-[#d4af37]">
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
  );
}
