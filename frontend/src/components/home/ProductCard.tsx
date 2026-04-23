'use client'

import { useState, useRef, memo, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    originalPrice?: number
    image: string
    hoverImage?: string
    slug: string
    variantId?: string
    inventory?: number
    isExclusive?: boolean
    brandName?: string
  }
}

const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const mainImageRef = useRef<HTMLImageElement>(null)
  const hoverImageRef = useRef<HTMLImageElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const isOutOfStock = useMemo(() => (product.inventory ?? 1) <= 0, [product.inventory])

  const discount = useMemo(() => 
    product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  , [product.originalPrice, product.price])

  // GSAP Animation for hover effect
  useEffect(() => {
    if (!cardRef.current) return

    if (isHovered) {
      gsap.to(cardRef.current, {
        scale: 1.02,
        y: -8,
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
        duration: 0.4,
        ease: 'power2.out'
      })

      if (product.hoverImage && mainImageRef.current && hoverImageRef.current) {
        gsap.to(mainImageRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 0.4,
          ease: 'power2.out'
        })
        gsap.to(hoverImageRef.current, {
          opacity: 1,
          scale: 1.05,
          duration: 0.4,
          ease: 'power2.out'
        })
      }
    } else {
      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        duration: 0.4,
        ease: 'power2.out'
      })

      if (product.hoverImage && mainImageRef.current && hoverImageRef.current) {
        gsap.to(mainImageRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        })
        gsap.to(hoverImageRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        })
      }
    }
  }, [isHovered, product.hoverImage])

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div
        ref={cardRef}
        className={`group rounded-lg overflow-hidden w-full max-w-[280px] sm:max-w-none transform-gpu bg-white ${
          isOutOfStock ? 'opacity-75' : ''
        }`}
        style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.image && product.image.startsWith('http') ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
              )}
              <img 
                ref={mainImageRef}
                src={product.image} 
                alt={product.title} 
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover ${!imageLoaded ? 'opacity-0' : ''} ${
                  isOutOfStock ? 'grayscale' : ''
                }`}
                style={{ willChange: 'transform, opacity' }}
              />
              {product.hoverImage && (
                <img 
                  ref={hoverImageRef}
                  src={product.hoverImage} 
                  alt={`${product.title} - hover`} 
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover opacity-0 ${
                    isOutOfStock ? 'grayscale' : ''
                  }`}
                  style={{ willChange: 'transform, opacity' }}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-5xl">📦</span>
            </div>
          )}

          {/* Out of stock badge */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                نفذت الكمية
              </span>
            </div>
          )}

          {/* Exclusive badge */}
          {product.isExclusive && !isOutOfStock && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                حصري
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 pt-3 pb-3" dir="rtl">
          {/* Brand Name */}
          {product.brandName && (
            <p className="text-xs text-gray-500 font-medium mb-0.5 truncate">{product.brandName}</p>
          )}

          {/* Product Name */}
          <h3 className={`font-semibold text-sm line-clamp-2 leading-snug mb-2 ${
            isOutOfStock ? 'text-gray-500' : 'text-gray-800 group-hover:text-primary'
          }`}>
            {product.title}
          </h3>

          {/* Price Section */}
          {product.originalPrice && discount > 0 ? (
            <div className="space-y-0.5">
              {/* Original price with strikethrough */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 line-through">
                  ₪{(product.originalPrice / 100).toFixed(0)}
                </span>
              </div>
              {/* Current price + discount badge */}
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold ${isOutOfStock ? 'text-gray-500' : 'text-primary'}`}>
                  ₪{(product.price / 100).toFixed(0)}
                </span>
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {discount}%-
                </span>
              </div>
            </div>
          ) : (
            <div>
              <span className={`text-base font-bold ${isOutOfStock ? 'text-gray-500' : 'text-primary'}`}>
                ₪{(product.price / 100).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})

export default ProductCard
