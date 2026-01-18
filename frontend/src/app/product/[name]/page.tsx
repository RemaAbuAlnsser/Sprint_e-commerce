'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';
import { ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  hover_image_url?: string;
  category_id: number;
  subcategory_id?: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productName = decodeURIComponent(params.name as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showHoverImage, setShowHoverImage] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productName]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/products');
      if (response.ok) {
        const data = await response.json();
        const foundProduct = data.find((p: Product) => p.name === productName);
        setProduct(foundProduct || null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#2c2c2c]"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              المنتج غير موجود
            </h3>
            <p className="text-gray-600 mb-6">
              عذراً، لم نتمكن من العثور على هذا المنتج
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2c2c2c] mb-6 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg"
              onMouseEnter={() => setShowHoverImage(true)}
              onMouseLeave={() => setShowHoverImage(false)}
            >
              {product.image_url ? (
                <>
                  <Image
                    src={`http://localhost:3000${product.image_url}`}
                    alt={product.name}
                    fill
                    className={`object-cover transition-opacity duration-300 ${showHoverImage && product.hover_image_url ? 'opacity-0' : 'opacity-100'}`}
                  />
                  {product.hover_image_url && (
                    <Image
                      src={`http://localhost:3000${product.hover_image_url}`}
                      alt={product.name}
                      fill
                      className={`object-cover transition-opacity duration-300 ${showHoverImage ? 'opacity-100' : 'opacity-0'}`}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl opacity-20">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2c2c2c] mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-[#d4af37]">
                  ₪{Number(product.price).toFixed(2)}
                </span>
                {product.stock > 0 ? (
                  <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    متوفر في المخزون
                  </span>
                ) : (
                  <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    غير متوفر
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#2c2c2c] mb-2">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2c2c2c] mb-2">
                  الكمية
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-4 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                <span>أضف إلى السلة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
