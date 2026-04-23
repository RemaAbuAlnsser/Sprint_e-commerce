'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturesBar() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger cards from bottom with slight rotation
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.fromTo(card,
          { y: 40, opacity: 0, rotateY: -8 },
          {
            y: 0,
            opacity: 1,
            rotateY: 0,
            duration: 0.6,
            delay: index * 0.12,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // Animated divider line
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            delay: 0.4,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el
  }

  const features = [
    {
      icon: <img src="/icons/warranty.png" alt="كفالة" className="w-10 h-10 object-contain" />,
      title: 'كفالة سنة',
      description: 'كفالة سنة لجميع المنتجات'
    },
    {
      icon: <img src="/icons/cash-payment.png" alt="دفع نقدي" className="w-10 h-10 object-contain" />,
      title: 'الدفع نقدا عند التسليم',
      description: 'يمكنك الدفع نقدا عند التسليم'
    },
    {
      icon: <img src="/icons/fast-delivery.png" alt="توصيل سريع" className="w-10 h-10 object-contain" />,
      title: 'توصيل سريع',
      description: 'توصيل من يوم إلى ثلاثة أيام لجميع مناطق الضفة والقدس'
    }
  ]

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-r from-gray-50 via-white to-gray-50 py-6 sm:py-8" style={{ perspective: '600px' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0" dir="rtl">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => addToRefs(el, index)}
              className={`
                flex items-center gap-4 px-6 py-5 group cursor-default
                ${index < features.length - 1 ? 'md:border-l md:border-gray-200' : ''}
              `}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 shadow-sm">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom accent line */}
      <div
        ref={lineRef}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-center"
        style={{ transform: 'scaleX(0)' }}
      />
    </section>
  )
}
