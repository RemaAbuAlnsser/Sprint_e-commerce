'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RefreshCw } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/store/cart-store'
import AddToCartAnimation from '@/components/ui/AddToCartAnimation'
import Toast from '@/components/ui/Toast'
import { ProductDetailSkeleton } from '@/components/ui/Skeleton'
import StockNotificationModal from '@/components/ui/StockNotificationModal'
import StockAvailableNotification from '@/components/ui/StockAvailableNotification'
import { getStockNotificationObserver } from '@/services/StockNotificationObserver'
import { API_URL } from '@/lib/api';

interface Variant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity: number;
}

interface ProductColor {
  id: string;
  color_name: string;
  image_url: string;
  inventory_quantity?: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  handle: string;
  thumbnail: string;
  hover_image?: string;
  status: string;
  category_id: string;
  category_name: string;
  brand_id: string;
  brand_name: string;
  is_exclusive?: boolean;
  colors: ProductColor[];
  variants: Variant[];
  images?: ProductImage[];
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [currentImage, setCurrentImage] = useState<string>('')
  const [allImages, setAllImages] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [animationStart, setAnimationStart] = useState<{ x: number; y: number } | undefined>()
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/store/products/${slug}`)
      const data = await res.json()
      setProduct(data.product)
      if (data.product?.variants?.length > 0) {
        setSelectedVariant(data.product.variants[0])
      }
      // Build gallery images array
      const imgs: string[] = []
      if (data.product?.thumbnail) imgs.push(data.product.thumbnail)
      if (data.product?.images?.length > 0) {
        data.product.images.forEach((img: ProductImage) => {
          if (img.url && !imgs.includes(img.url)) imgs.push(img.url)
        })
      }
      if (data.product?.hover_image && !imgs.includes(data.product.hover_image)) {
        imgs.push(data.product.hover_image)
      }
      setAllImages(imgs)

      // Set initial image and color
      if (data.product?.colors?.length > 0) {
        setSelectedColor(data.product.colors[0])
        setCurrentImage(data.product.colors[0].image_url)
      } else {
        setCurrentImage(data.product?.thumbnail || '')
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color)
    setCurrentImage(color.image_url)
  }

  const handleAddToCart = () => {
    if (!product || !selectedVariant || !selectedVariant.id) return
    
    // Check if selected color is out of stock and find alternative
    let finalColor = selectedColor?.color_name
    let finalColorImage = selectedColor?.image_url
    
    if (product.colors && product.colors.length > 0) {
      // Check if selected color is out of stock
      const selectedColorData = product.colors.find(c => c.color_name === selectedColor?.color_name)
      
      if (!selectedColorData || (selectedColorData.inventory_quantity || 0) <= 0) {
        // Find first available color
        const availableColor = product.colors.find(c => (c.inventory_quantity || 0) > 0)
        
        if (availableColor) {
          finalColor = availableColor.color_name
          finalColorImage = availableColor.image_url
          // Update selected color in UI
          setSelectedColor(availableColor)
          setCurrentImage(availableColor.image_url)
        }
      }
    }
    
    // Get button position for animation
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setAnimationStart({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
      setShowAnimation(true)
    }
    
    addItem({
      id: product.id,
      variantId: selectedVariant.id,
      title: product.title + (selectedVariant.title !== 'افتراضي' ? ` - ${selectedVariant.title}` : ''),
      price: selectedVariant.price,
      quantity: quantity,
      thumbnail: product.thumbnail,
      color: finalColor,
      colorImage: finalColorImage,
      availableColors: product.colors,
    })
    
    // Show toast notification
    setShowToast(true)
    
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleSubscribe = () => {
    if (!product || !selectedVariant) return
    
    // Use Observer Pattern to add interest
    const observer = getStockNotificationObserver()
    
    observer.addInterest({
      productId: product.id,
      variantId: selectedVariant.id,
      productTitle: product.title,
      productImage: product.thumbnail,
      variantPrice: selectedVariant.price,
      timestamp: Date.now()
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">المنتج غير موجود</h1>
            <Link href="/" className="text-primary hover:underline">العودة للرئيسية</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden" dir="rtl">
      <Navbar />
      <main className="flex-1">

      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto">
          <Link href="/" className="text-gray-500 hover:text-primary">
            الرئيسية
          </Link>
          <ChevronLeft className="w-4 h-4 text-gray-400" />
          <Link href="/products" className="text-gray-500 hover:text-primary">
            المنتجات
          </Link>
          <ChevronLeft className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-4 sm:p-6"
          >
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] pb-2 sm:pb-0 sm:pr-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(img)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        currentImage === img
                          ? 'border-primary shadow-md shadow-primary/20 scale-105'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1 aspect-square bg-gradient-to-br from-secondary to-purple-50 rounded-2xl flex items-center justify-center overflow-hidden">
                {currentImage ? (
                  <motion.img
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={currentImage}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[120px]">📦</span>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute bottom-4 left-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words text-gray-900">{product.title}</h1>
              {product.subtitle && (
                <p className="text-base sm:text-lg text-gray-600 mb-4 break-words">{product.subtitle}</p>
              )}
              
              {/* Exclusive Badge */}
              {product.is_exclusive && (
                <div className="mb-4 inline-block">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-pulse">
                    <div>
                      <p className="font-black text-lg">منتج حصري</p>
                      <p className="text-xs opacity-90">متوفر لفترة محدودة</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Price */}
              <div className="mb-4">
                {selectedVariant?.compare_at_price ? (
                  <div className="space-y-2">
                    {/* السعر القديم مشطوب */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">السعر السابق:</span>
                      <span className="text-xl text-gray-500 line-through font-bold">
                        {(selectedVariant.compare_at_price / 100).toFixed(2)} ₪
                      </span>
                    </div>
                    {/* السعر الجديد */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">السعر الآن:</span>
                      <span className="text-4xl font-black text-primary">
                        {(selectedVariant.price / 100).toFixed(2)} ₪
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-primary">
                      {selectedVariant ? (selectedVariant.price / 100).toFixed(2) : '0.00'} ₪
                    </span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              {product.brand_name && (
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-3">تفاصيل المنتج</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">الشركة المصنعة:</span>
                      <span className="text-gray-800">{product.brand_name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Colors Section */}
              {product.colors && product.colors.length > 0 && (
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-3">اللون *</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const isOutOfStock = (color.inventory_quantity || 0) <= 0;
                      return (
                        <button
                          key={color.id}
                          onClick={() => !isOutOfStock && handleColorChange(color)}
                          disabled={isOutOfStock}
                          className={`relative group ${
                            isOutOfStock
                              ? 'ring-1 ring-gray-200 opacity-60 cursor-not-allowed'
                              : selectedColor?.id === color.id
                                ? 'ring-2 ring-primary ring-offset-2'
                                : 'ring-1 ring-gray-300 hover:ring-primary'
                          } rounded-xl overflow-hidden transition-all`}
                        >
                          <div className={`w-20 h-20 flex items-center justify-center bg-gray-50 ${isOutOfStock ? 'grayscale' : ''}`}>
                            {color.image_url ? (
                              <img 
                                src={color.image_url} 
                                alt={color.color_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">🎨</span>
                            )}
                          </div>
                          {/* شارة نفذت الكمية */}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                نفد
                              </span>
                            </div>
                          )}
                          {/* علامة الاختيار */}
                          {selectedColor?.id === color.id && !isOutOfStock && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-gray-600 mt-3">
                      اللون المختار: <span className="font-medium text-gray-800">{selectedColor.color_name}</span>
                      {(selectedColor.inventory_quantity || 0) > 0 && (selectedColor.inventory_quantity || 0) <= 5 && (
                        <span className="text-orange-500 font-medium mr-2">
                          (متبقي {selectedColor.inventory_quantity} فقط!)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-bold text-primary mb-3">الوصف</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-right break-words">
                  {product.description && product.description.length > (isMobile ? 300 : 740) ? (
                    <>
                      {showFullDescription ? product.description : product.description.substring(0, isMobile ? 300 : 740) + '...'}
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="block mt-3 text-primary font-semibold hover:underline"
                      >
                        {showFullDescription ? 'عرض أقل' : 'اقرأ المزيد'}
                      </button>
                    </>
                  ) : (
                    product.description || 'منتج عالي الجودة'
                  )}
                </div>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="bg-white rounded-2xl p-6">
                <label className="block text-sm font-medium mb-3 text-gray-700">الخيارات</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary text-gray-700'
                      }`}
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector - Desktop only */}
            <div className="hidden lg:block bg-white rounded-2xl p-6">
              <label className="block text-sm font-medium mb-3 text-gray-700">الكمية</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-primary/10 rounded-r-xl transition-colors text-gray-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant?.inventory_quantity || 99, quantity + 1))}
                    className="p-3 hover:bg-primary/10 rounded-l-xl transition-colors text-gray-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-gray-500 text-sm">
                  {selectedVariant && selectedVariant.inventory_quantity > 0 
                    ? `متوفر (${selectedVariant.inventory_quantity})`
                    : 'غير متوفر'}
                </span>
              </div>
            </div>

            {/* Add to Cart / Notify Button - Desktop only */}
            <div className="hidden lg:block">
            {selectedVariant && selectedVariant.inventory_quantity === 0 ? (
              <button
                onClick={() => setShowNotificationModal(true)}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base sm:text-lg rounded-2xl transition-all shadow-lg shadow-purple-500/30"
              >
                <span>نبهني عند التوفر</span>
              </button>
            ) : (
              <button
                ref={buttonRef}
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-primary text-white font-semibold text-base sm:text-lg rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>أضف للسلة</span>
                {selectedVariant && (
                  <span className="bg-white/20 px-3 py-1 rounded-lg">
                    {((selectedVariant.price * quantity) / 100).toFixed(2)} ₪
                  </span>
                )}
              </button>
            )}
            </div>

          </motion.div>
        </div>
      </div>
      
      {/* Add to Cart Animation */}
      <AddToCartAnimation 
        show={showAnimation}
        onComplete={() => setShowAnimation(false)}
        startPosition={animationStart}
        productImage={currentImage || product.thumbnail}
      />

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message="تمت إضافة المنتج للسلة بنجاح! 🎉"
        onClose={() => setShowToast(false)}
      />

      {/* Stock Notification Modal */}
      {product && selectedVariant && (
        <StockNotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          productId={product.id}
          variantId={selectedVariant.id}
          productTitle={product.title}
          onSubscribe={handleSubscribe}
        />
      )}

      {/* Stock Available Notification */}
      <StockAvailableNotification />

      {/* Mobile Fixed Bottom Bar - Quantity + Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-gray-100 rounded-xl flex-shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 hover:bg-primary/10 rounded-r-xl transition-colors text-gray-700"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant?.inventory_quantity || 99, quantity + 1))}
              className="p-2.5 hover:bg-primary/10 rounded-l-xl transition-colors text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart / Notify Button */}
          {selectedVariant && selectedVariant.inventory_quantity === 0 ? (
            <button
              onClick={() => setShowNotificationModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl transition-all"
            >
              <span>نبهني عند التوفر</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>أضف للسلة</span>
              {selectedVariant && (
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
                  {((selectedVariant.price * quantity) / 100).toFixed(2)} ₪
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      </main>

      <Footer />
    </div>
  )
}
