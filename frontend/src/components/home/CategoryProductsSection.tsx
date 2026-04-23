'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CategoryCardSkeleton } from '@/components/ui/Skeleton'
import { API_URL } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

interface Category {
  id: string
  name: string
  handle: string
  image_url: string
  description: string
  product_count: number
}

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/store/categories`)
        const data = await res.json()
        setCategories(data.categories || [])
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
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Cards animation
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.fromTo(
          card,
          { y: 80, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [loading, categories])

  // Ì†ΩÌ¥π Scroll handler (Swipe stays intact)
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const scrollAmount = 300
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="relative">
            <h2
              ref={titleRef}
              className="text-3xl lg:text-5xl font-black text-right"
              style={{ fontFamily: 'var(--font-logo), system-ui' }}
            >
              <span className="text-primary">ÿ£ŸÇÿ≥ÿßŸÖŸÜÿß</span>
            </h2>
            <div className="absolute -bottom-2 right-0 w-20 h-1 bg-primary rounded-full" />
          </div>

          {/* Arrows */}
          <div className="flex gap-3">
            {/* Ì†ΩÌ±â Scroll Right */}
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-white shadow-lg hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Ì†ΩÌ±à Scroll Left */}
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-white shadow-lg hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Categories */}
        {loading ? (
          <div className="grid grid-flow-col auto-cols-fr gap-6 pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 py-8">ŸÑÿß ÿ™Ÿàÿ¨ÿØ ŸÅÿ¶ÿßÿ™</div>
        ) : (
          <div
            ref={scrollRef}
            className="
              grid grid-flow-col auto-cols-fr gap-4 md:gap-6
              overflow-x-auto scrollbar-hide pb-4
            "
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              gridAutoColumns:
                categories.length <= 4 ? '1fr' : 'minmax(160px, 1fr)',
            }}
          >
            {categories.map((category, index) => (
              <div key={category.id} ref={(el) => addToRefs(el, index)}>
                <Link href={`/category/${category.handle}`} className="group block">
                  <div className="relative aspect-square rounded-3xl bg-white mb-4 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 z-10" />

                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-100">
                        <span className="text-7xl">Ì†ΩÌ≥¶</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-center text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
