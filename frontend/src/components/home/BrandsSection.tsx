'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { API_URL } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

interface Brand {
  id: number
  name: string
  logo: string
  logo_url: string | null
  slug: string
}

export default function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const brandCardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (loading || brands.length === 0) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.fromTo(titleRef.current,
        { y: 60, opacity: 0, rotateX: -15 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          ease: 'power4.out',
        }
      )
      .fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      )

      brandCardsRef.current.forEach((card) => {
        if (!card) return

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out',
          })
        })

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          })
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [loading, brands])

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_URL}/store/brands`)
      const data = await response.json()
      
      const seenIds = new Set<number>()
      const uniqueBrands = (data.brands || []).filter((brand: Brand) => {
        if (seenIds.has(brand.id)) return false
        seenIds.add(brand.id)
        return true
      })
      
      setBrands(uniqueBrands)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToBrandCardsRef = (el: HTMLDivElement | null, index: number) => {
    if (el) brandCardsRef.current[index] = el
  }

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const container = sliderRef.current
      const containerWidth = container.offsetWidth
      const scrollAmount = containerWidth
      const newScrollLeft = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }, [])

  if (!loading && brands.length === 0) return null

  return (
    <section 
      ref={sectionRef} 
      className="relative py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]" />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
            style={{ 
              fontFamily: 'var(--font-logo), system-ui',
              perspective: '1000px'
            }}
          >
            <span className="text-white">شركاؤنا من </span>
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">العلامات العالمية</span>
          </h2>
          <p 
            ref={subtitleRef}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            نفخر بالتعاون مع أفضل العلامات التجارية للإكسسوارات العصرية
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 mb-8">
          <button
            onClick={() => scroll('right')}
            className="p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 hover:bg-primary transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="السابق"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 hover:bg-primary transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="التالي"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="relative">

          {loading ? (
            <div className="flex gap-6 overflow-hidden px-12 md:px-16">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 md:w-72 aspect-[4/3] bg-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div 
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide px-12 md:px-16 py-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {brands.map((brand, index) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.slug}`}
                  className="flex-shrink-0 w-64 md:w-72"
                >
                  <div
                    ref={(el) => addToBrandCardsRef(el, index)}
                    className="group relative aspect-[4/3] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent" />
                  </div>

                  <div className="relative h-full flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0 transition-all duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          const fallback = document.createElement('div')
                          fallback.className = 'text-white/60 text-xl font-bold text-center'
                          fallback.textContent = brand.name
                          parent.appendChild(fallback)
                        }
                      }}
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <p className="text-white font-bold text-sm">{brand.name}</p>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  )
}
