'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductSlider from './ProductSlider'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { API_URL } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

interface Variant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity: number;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
  hover_image?: string;
  is_exclusive?: boolean;
  status: string;
  category_id: string;
  category_name: string;
  brand_name?: string;
  variants: Variant[];
}

interface ParentCategory {
  id: string;
  name: string;
  handle: string;
  banner_image?: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  handle: string;
  parent_category_id: string;
}

export default function ProductsSection() {
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([])
  const [productsByParentCategory, setProductsByParentCategory] = useState<{ [key: string]: Product[] }>({})
  const [loading, setLoading] = useState(true)
  const sectionsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (loading) return

    sectionsRef.current.forEach((section) => {
      if (!section) return
      
      const title = section.querySelector('.section-title')
      const slider = section.querySelector('.product-slider')

      gsap.fromTo(title,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      gsap.fromTo(slider,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
  }, [loading, parentCategories, productsByParentCategory])

  const addToSectionsRef = (el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el
  }

  // Shuffle array utility
  const shuffleArray = (arr: Product[]) => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const fetchData = async () => {
    try {
      // Fetch parent categories, subcategories, and products
      const [parentCatsRes, subcatsRes, allProductsRes, latestRes] = await Promise.all([
        fetch(`${API_URL}/store/parent-categories`),
        fetch(`${API_URL}/store/categories`),
        fetch(`${API_URL}/store/products`),
        fetch(`${API_URL}/store/products?latest=true&limit=8`),
      ])

      const parentCatsData = await parentCatsRes.json()
      const subcatsData = await subcatsRes.json()
      const allProductsData = await allProductsRes.json()
      const latestData = await latestRes.json()

      const parents: ParentCategory[] = parentCatsData.parent_categories || []
      const subcats: Subcategory[] = subcatsData.categories || []
      const allProducts: Product[] = allProductsData.products || []
      const latestProducts: Product[] = latestData.products || []

      setParentCategories(parents)

      // Group products by parent category
      const productsMap: { [key: string]: Product[] } = {}

      for (const parent of parents) {
        // Find all subcategory IDs belonging to this parent
        const subIds = subcats
          .filter((sub) => sub.parent_category_id === parent.id)
          .map((sub) => sub.id)

        // Collect products from all subcategories of this parent
        const parentProducts = allProducts.filter((p) => subIds.includes(p.category_id))

        // Shuffle to get a random mix from different subcategories
        productsMap[parent.id] = shuffleArray(parentProducts)
      }

      // Featured section - latest products
      productsMap['featured'] = latestProducts

      setProductsByParentCategory(productsMap)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const formatProduct = useCallback((product: Product) => ({
    id: product.id,
    title: product.title,
    price: product.variants?.[0]?.price || 0,
    originalPrice: product.variants?.[0]?.compare_at_price || undefined,
    image: product.thumbnail || '',
    hoverImage: product.hover_image || undefined,
    slug: product.handle,
    variantId: product.variants?.[0]?.id || '',
    inventory: product.variants?.[0]?.inventory_quantity || 0,
    isExclusive: product.is_exclusive || false,
    brandName: product.brand_name || undefined,
  }), [])

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {/* Title Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-40 mb-6 mr-auto animate-pulse" />
            
            {/* Products Grid Skeleton */}
            <div className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[calc(33.333%-10.667px)] lg:auto-cols-[calc(20%-12.8px)] gap-4 overflow-x-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const featuredProducts = productsByParentCategory['featured'] || []

  return (
    <>
      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section 
          ref={(el) => addToSectionsRef(el, 0)}
          className="py-14 sm:py-16 bg-gradient-to-b from-gray-50/80 to-white relative overflow-hidden"
        >
          <div className="container mx-auto px-4 relative">
            <div className="section-title mb-8">
              <p className="text-xs sm:text-sm font-semibold text-primary/70 tracking-wider mb-1 uppercase">وصل حديثاً</p>
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900"
                style={{ fontFamily: 'var(--font-logo), system-ui' }}
              >
                أحدث المنتجات
              </h2>
            </div>
            <div className="product-slider">
              <ProductSlider 
                products={featuredProducts.map(formatProduct)} 
                title=""
              />
            </div>
          </div>
        </section>
      )}

      {/* Products by Parent Category */}
      {parentCategories.map((parentCat, index) => {
        const products = productsByParentCategory[parentCat.id] || []
        if (products.length === 0) return null

        return (
          <section 
            key={parentCat.id} 
            ref={(el) => addToSectionsRef(el, index + 1)}
            className={`py-14 sm:py-16 relative overflow-hidden ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
            }`}
          >
            <div className="container mx-auto px-4 relative">
              {/* Banner Image */}
              {parentCat.banner_image && (
                <Link href={`/categories/${parentCat.handle}`} className="block mb-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={parentCat.banner_image}
                      alt={parentCat.name}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>
              )}

              <div className="section-title mb-8">
                <Link href={`/categories/${parentCat.handle}`} className="group inline-block">
                  <h2 
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 group-hover:text-primary transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-logo), system-ui' }}
                  >
                    {parentCat.name}
                  </h2>
                </Link>
              </div>
              <div className="product-slider">
                <ProductSlider 
                  products={products.map(formatProduct)} 
                  title=""
                />
              </div>
            </div>
          </section>
        )
      })}

      {/* No products message */}
      {parentCategories.length === 0 && featuredProducts.length === 0 && (
        <section className="py-16 bg-white text-center">
          <div className="container mx-auto px-4">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد منتجات</h2>
            <p className="text-gray-500">قم بإضافة منتجات من لوحة التحكم</p>
          </div>
        </section>
      )}
    </>
  )
}
