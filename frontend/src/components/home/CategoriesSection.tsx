'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CategoryCardSkeleton } from '@/components/ui/Skeleton'
import { API_URL } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

interface ParentCategory {
  id: string
  name: string
  handle: string
  image_url: string
  description: string
  subcategories_count?: number
  products_count?: number
}

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  const [categories, setCategories] = useState<ParentCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/store/parent-categories`)
        const data = await res.json()
        setCategories(data.parent_categories || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (loading || categories.length === 0) return

    const ctx = gsap.context(() => {
      // Header clip-path reveal
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Cards stagger with scale + rotation
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.fromTo(card,
          { y: 60, opacity: 0, scale: 0.85 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: index * 0.08,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [loading, categories])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 bg-white overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-primary/70 tracking-wider mb-1 uppercase">تصفح حسب القسم</p>
            <h2
              className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900"
              style={{ fontFamily: 'var(--font-logo), system-ui' }}
            >
              أقسامنا
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('right')}
              className="p-2.5 sm:p-3 rounded-xl bg-gray-100 hover:bg-primary hover:text-white text-gray-600 transition-all duration-300 hover:-translate-x-0.5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="p-2.5 sm:p-3 rounded-xl bg-gray-100 hover:bg-primary hover:text-white text-gray-600 transition-all duration-300 hover:translate-x-0.5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-flow-col auto-cols-fr gap-6 pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا توجد فئات
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="grid grid-flow-col auto-cols-fr gap-4 md:gap-5 overflow-x-auto pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              gridAutoColumns: categories.length <= 4 ? '1fr' : 'minmax(155px, 1fr)',
            }}
          >
            {categories.map((category, index) => (
              <div
                key={category.id}
                ref={(el) => addToRefs(el, index)}
                className="min-w-0"
              >
                <Link
                  href={`/categories/${category.handle}`}
                  className="group block h-full"
                >
                  <div className="relative aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-500">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-100">
                        <span className="text-6xl">📦</span>
                      </div>
                    )}

                    {/* Gradient overlay with name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                        {category.name}
                      </h3>
                      {category.products_count !== undefined && category.products_count > 0 && (
                        <p className="text-white/60 text-xs mt-0.5">{category.products_count} منتج</p>
                      )}
                    </div>

                    {/* Hover accent border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/50 transition-colors duration-500" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
