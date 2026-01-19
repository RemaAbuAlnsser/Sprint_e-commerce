'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';
import { ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Toast from '@/components/Toast';
import gsap from 'gsap';

interface ProductImage {
  id: number;
  image_url: string;
  display_order: number;
}

interface ProductColorImage {
  id: number;
  product_color_id: number;
  image_url: string;
  display_order: number;
}

interface ProductColor {
  id: number;
  product_id: number;
  color_name: string;
  stock: number;
  image_url?: string;
  images?: ProductColorImage[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  stock: number;
  image_url: string;
  hover_image_url?: string;
  category_id: number;
  subcategory_id?: number;
  images?: ProductImage[];
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productName = decodeURIComponent(params.name as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [colorImages, setColorImages] = useState<ProductColorImage[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productName]);

  useEffect(() => {
    if (product?.id) {
      fetchProductColors(product.id);
    }
  }, [product?.id]);

  const fetchProductColors = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/product-colors/product/${productId}`);
      if (response.ok) {
        const colors = await response.json();
        console.log('Product colors:', colors);
        setProductColors(colors);
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
          fetchColorImages(colors[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching product colors:', error);
    }
  };

  const fetchColorImages = async (colorId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/product-color-images/color/${colorId}`);
      if (response.ok) {
        const images = await response.json();
        console.log('Color images:', images);
        setColorImages(images);
        setSelectedImageIndex(0);
      }
    } catch (error) {
      console.error('Error fetching color images:', error);
      setColorImages([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching product:', productName);
      
      // Try to fetch by SKU first
      const skuResponse = await fetch(`http://localhost:3000/products/sku/${productName}`);
      
      if (skuResponse.ok) {
        const productData = await skuResponse.json();
        console.log('Product data from SKU:', productData);
        console.log('Product images:', productData?.images);
        
        if (productData && productData.id) {
          setProduct(productData);
          return;
        }
      }
      
      // Fallback: search by name
      console.log('Fallback: searching by name');
      const response = await fetch('http://localhost:3000/products');
      if (response.ok) {
        const data = await response.json();
        const foundProduct = data.find((p: Product) => p.name === decodeURIComponent(productName));
        
        if (foundProduct) {
          console.log('Found product by name:', foundProduct);
          const detailsResponse = await fetch(`http://localhost:3000/products/${foundProduct.id}`);
          if (detailsResponse.ok) {
            const productWithImages = await detailsResponse.json();
            console.log('Product with images:', productWithImages);
            console.log('Images array:', productWithImages?.images);
            setProduct(productWithImages);
          } else {
            setProduct(foundProduct);
          }
        } else {
          setProduct(null);
        }
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createFlyingAnimation = () => {
    if (!product || isAnimating) return;
    
    setIsAnimating(true);
    
    // Get the current product image
    const currentImageUrl = selectedColor?.image_url || product.image_url;
    if (!currentImageUrl) return;
    
    // Create flying product element
    const flyingProduct = document.createElement('div');
    flyingProduct.className = 'fixed pointer-events-none z-[9999]';
    flyingProduct.style.width = '60px';
    flyingProduct.style.height = '60px';
    
    const flyingImage = document.createElement('img');
    flyingImage.src = `http://localhost:3000${currentImageUrl}`;
    flyingImage.className = 'w-full h-full object-cover rounded-lg shadow-lg';
    flyingProduct.appendChild(flyingImage);
    
    document.body.appendChild(flyingProduct);
    
    // Get button position
    const buttonRect = addToCartButtonRef.current?.getBoundingClientRect();
    if (!buttonRect) return;
    
    // Get cart icon position (approximate)
    const cartIcon = document.querySelector('[aria-label="Cart"]');
    const cartRect = cartIcon?.getBoundingClientRect();
    
    if (!cartRect) return;
    
    // Set initial position
    gsap.set(flyingProduct, {
      left: buttonRect.left + buttonRect.width / 2 - 30,
      top: buttonRect.top + buttonRect.height / 2 - 30,
      scale: 1,
      opacity: 1,
    });
    
    // Animate to cart
    gsap.to(flyingProduct, {
      left: cartRect.left + cartRect.width / 2 - 30,
      top: cartRect.top + cartRect.height / 2 - 30,
      scale: 0.3,
      opacity: 0.8,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        // Remove element and reset animation state
        document.body.removeChild(flyingProduct);
        setIsAnimating(false);
        
        // Add cart bounce effect
        if (cartIcon) {
          gsap.to(cartIcon, {
            scale: 1.2,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          });
        }
      }
    });
  };

  const handleAddToCart = async () => {
    if (product && !isAnimating) {
      // Start animation first
      createFlyingAnimation();
      
      // Add slight delay before actually adding to cart
      setTimeout(async () => {
        for (let i = 0; i < quantity; i++) {
          const result = await addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: selectedColor?.image_url || product.image_url,
            color_name: selectedColor?.color_name,
            color_image_url: selectedColor?.image_url,
          });
          
          if (!result.success) {
            setToastMessage(result.message || 'فشل إضافة المنتج');
            setShowToast(true);
            return;
          }
        }
        
        const colorText = selectedColor ? ` (${selectedColor.color_name})` : '';
        setToastMessage(`تمت إضافة "${product.name}${colorText}" إلى السلة`);
        setShowToast(true);
      }, 300);
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
      
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2c2c2c] mb-6 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-3 max-w-xl">
            {/* Thumbnail Gallery - Vertical */}
            {(() => {
              const allImages: string[] = [];
              
              // If color is selected, start with color images
              if (selectedColor) {
                // First add the color's main image if it exists
                if (selectedColor.image_url) {
                  allImages.push(selectedColor.image_url);
                }
                // Then add any additional color gallery images
                if (colorImages.length > 0) {
                  colorImages.forEach(img => allImages.push(img.image_url));
                }
              }
              
              // Always add original product images from product_images table
              if (product.image_url) allImages.push(product.image_url);
              if (product.hover_image_url) allImages.push(product.hover_image_url);
              if (product.images && product.images.length > 0) {
                product.images.forEach(img => allImages.push(img.image_url));
              }
              
              return allImages.length > 1 ? (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:h-full">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-[#d4af37] ring-offset-2 scale-105 shadow-lg'
                          : 'opacity-60 hover:opacity-100 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                      }`}
                    >
                      <Image
                        src={`http://localhost:3000${img}`}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity ${
                        selectedImageIndex === index ? 'opacity-0' : 'opacity-100'
                      }`} />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
            
            {/* Main Image Display */}
            <div className="flex-1">
              <div className="sticky top-24">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-xl group">
                  {(() => {
                    const allImages: string[] = [];
                    
                    // If color is selected, start with color images
                    if (selectedColor) {
                      // First add the color's main image if it exists
                      if (selectedColor.image_url) {
                        allImages.push(selectedColor.image_url);
                      }
                      // Then add any additional color gallery images
                      if (colorImages.length > 0) {
                        colorImages.forEach(img => allImages.push(img.image_url));
                      }
                    }
                    
                    // Always add original product images from product_images table
                    if (product.image_url) allImages.push(product.image_url);
                    if (product.hover_image_url) allImages.push(product.hover_image_url);
                    if (product.images && product.images.length > 0) {
                      product.images.forEach(img => allImages.push(img.image_url));
                    }
                    
                    const currentImage = allImages[selectedImageIndex];
                    
                    return currentImage ? (
                      <>
                        <Image
                          src={`http://localhost:3000${currentImage}`}
                          alt={product.name}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-105"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-6xl opacity-20 block mb-2">📦</span>
                          <p className="text-gray-400 text-sm">لا توجد صورة</p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Sale Badge */}
                  {product.old_price && Number(product.old_price) > Number(product.price) && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                      SALE
                    </div>
                  )}

                  {/* Image Counter Badge */}
                  {(() => {
                    const allImages: string[] = [];
                    
                    // If color is selected, start with color images
                    if (selectedColor) {
                      // First add the color's main image if it exists
                      if (selectedColor.image_url) {
                        allImages.push(selectedColor.image_url);
                      }
                      // Then add any additional color gallery images
                      if (colorImages.length > 0) {
                        colorImages.forEach(img => allImages.push(img.image_url));
                      }
                    }
                    
                    // Always add original product images from product_images table
                    if (product.image_url) allImages.push(product.image_url);
                    if (product.hover_image_url) allImages.push(product.hover_image_url);
                    if (product.images && product.images.length > 0) {
                      product.images.forEach(img => allImages.push(img.image_url));
                    }
                    
                    return allImages.length > 1 ? (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        {selectedImageIndex + 1} / {allImages.length}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
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

            {/* Product Colors */}
            {productColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-3">الألوان المتوفرة</h3>
                <div className="flex flex-wrap gap-3">
                  {productColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColor(color);
                        fetchColorImages(color.id);
                        setSelectedImageIndex(0);
                      }}
                      className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                        selectedColor?.id === color.id
                          ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-[#d4af37]/50 hover:shadow-md'
                      }`}
                    >
                      {/* Color Image */}
                      {color.image_url ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={`http://localhost:3000${color.image_url}`}
                            alt={color.color_name}
                            fill
                            className="object-cover"
                          />
                          {selectedColor?.id === color.id && (
                            <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">🎨</span>
                        </div>
                      )}
                      
                      {/* Color Name */}
                      <div className="text-center">
                        <p className={`text-sm font-medium transition-colors ${
                          selectedColor?.id === color.id ? 'text-[#d4af37]' : 'text-gray-700'
                        }`}>
                          {color.color_name}
                        </p>
                        {color.stock > 0 ? (
                          <p className="text-xs text-green-600 mt-0.5">
                            متوفر ({color.stock})
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 mt-0.5">
                            غير متوفر
                          </p>
                        )}
                      </div>

                      {/* Selected Indicator */}
                      {selectedColor?.id === color.id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4af37] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAnimating}
                className="w-full py-4 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                <span>{isAnimating ? 'جاري الإضافة...' : 'أضف إلى السلة'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
