'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { API_URL } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

interface HeroImage {
  id: string
  image_url: string
  position: number
  is_active: boolean
}

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const SLIDE_DURATION = 5000

  // Fetch hero images from API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const res = await fetch(`${API_URL}/store/hero-images`)
        const data = await res.json()

        if (data?.images && data.images.length > 0) {
          const imagesWithFullUrl = data.images.map((img: HeroImage) => ({
            ...img,
            image_url: img.image_url.startsWith('http')
              ? img.image_url
              : `${API_URL}${img.image_url}`
          }))
          setHeroImages(imagesWithFullUrl)
        } else {
          setHeroImages([{
            id: 'default',
            image_url: `${API_URL}/uploads/background/Background.webp`,
            position: 0,
            is_active: true
          }])
        }
      } catch (error) {
        console.error('Error fetching hero images:', error)
        setHeroImages([{
          id: 'default',
          image_url: `${API_URL}/uploads/background/Background.webp`,
          position: 0,
          is_active: true
        }])
      }
    }

    fetchHeroImages()
  }, [])

  // Animate slide transition with GSAP
  const animateSlide = useCallback((from: number, to: number) => {
    const fromImg = imagesRef.current[from]
    const toImg = imagesRef.current[to]
    if (!fromImg || !toImg) return

    const tl = gsap.timeline()
    
    // Ken Burns zoom on outgoing
    tl.to(fromImg, {
      scale: 1.15,
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
    }, 0)

    // New slide fades in with slight zoom
    tl.fromTo(toImg,
      { scale: 1.08, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'power2.inOut' },
      0.15
    )

    // Animate progress bar
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: SLIDE_DURATION / 1000, ease: 'none' }
      )
    }
  }, [])

  // Auto-advance slides
  useEffect(() => {
    if (heroImages.length <= 1) return

    // Initial progress bar
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: SLIDE_DURATION / 1000, ease: 'none' }
      )
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % heroImages.length
        animateSlide(prev, next)
        return next
      })
    }, SLIDE_DURATION)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [heroImages.length, animateSlide])

  // Initial entrance + parallax
  useEffect(() => {
    if (!heroRef.current || heroImages.length === 0) return

    const ctx = gsap.context(() => {
      // Entrance
      gsap.fromTo('.hero-image-active',
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }
      )

      // Parallax on scroll
      gsap.to('.hero-images-wrapper', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [heroImages])

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return
    if (timerRef.current) clearInterval(timerRef.current)
    
    animateSlide(currentIndex, index)
    setCurrentIndex(index)

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % heroImages.length
        animateSlide(prev, next)
        return next
      })
    }, SLIDE_DURATION)
  }, [currentIndex, heroImages.length, animateSlide])

  if (heroImages.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-black h-[22vh] sm:h-[28vh] md:h-[38vh] lg:h-[60vh] xl:h-[75vh]">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>جاري التحميل...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden bg-black h-[22vh] sm:h-[28vh] md:h-[38vh] lg:h-[60vh] xl:h-[75vh]"
    >
      {/* Images wrapper for parallax */}
      <div className="hero-images-wrapper absolute inset-0 w-full h-[120%] -top-[0%]">
        {heroImages.map((image, index) => (
          <img
            key={image.id}
            ref={el => { imagesRef.current[index] = el }}
            src={image.image_url}
            alt={`Hero Banner ${index + 1}`}
            className={`
              absolute inset-0 w-full h-full object-cover select-none pointer-events-none
              ${index === currentIndex ? 'hero-image-active' : ''}
            `}
            draggable={false}
            style={{
              zIndex: index === currentIndex ? 2 : 1,
              opacity: index === currentIndex ? 1 : 0,
            }}
          />
        ))}

        {/* Vignette overlay */}
        <div className="absolute inset-0 z-[3]" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)'
        }} />
      </div>

      {/* Bottom bar with indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Progress bar */}
          <div className="h-[3px] bg-white/10 w-full">
            <div
              ref={progressRef}
              className="h-full bg-white/80 origin-left"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  rounded-full transition-all duration-500 backdrop-blur-sm
                  ${index === currentIndex
                    ? 'w-7 h-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
