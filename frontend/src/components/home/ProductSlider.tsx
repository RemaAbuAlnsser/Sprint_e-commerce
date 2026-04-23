'use client'

import { useRef, useCallback, memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

interface Product {
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

interface ProductSliderProps {
  products: Product[]
  title: string
}

const ProductSlider = memo(function ProductSlider({ products, title }: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const containerWidth = container.offsetWidth
      const scrollAmount = containerWidth
      const newScrollLeft = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }, [])

  if (!products || products.length === 0) return null

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white border border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-colors duration-200 shadow-sm active:scale-95"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white border border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-colors duration-200 shadow-sm active:scale-95"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Container */}
      <div className="relative">

        {/* Scrollable Products */}
        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[calc(33.333%-10.667px)] lg:auto-cols-[calc(20%-12.8px)] gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6 pt-3 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ProductSlider
