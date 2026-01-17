'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'شركة الشكري تسعين',
      subtitle: 'تسوق بثقة وسهولة وسيادة المصنع',
      cta: 'ابدأ التسوق لأن الحاجات',
    },
    {
      title: 'أحدث المجموعات',
      subtitle: 'اكتشف تشكيلتنا الجديدة من المنتجات المميزة',
      cta: 'تسوق الآن',
    },
    {
      title: 'عروض خاصة',
      subtitle: 'خصومات تصل إلى 50% على منتجات مختارة',
      cta: 'استكشف العروض',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      });

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.6,
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: 0.9,
      });
    }, heroRef);

    return () => ctx.revert();
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <section
          ref={heroRef}
          className="relative h-screen w-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5dc] via-[#e8e8c8] to-[#d4d4c0]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiMyYzJjMmMiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] opacity-30"></div>
          </div>

          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"
          ></div>

          <div className="relative h-full flex items-center justify-center">
            <div className="container mx-auto px-6 text-center z-10">
              <h1
                ref={titleRef}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
              >
                {slides[currentSlide].title}
              </h1>
              
              <p
                ref={subtitleRef}
                className="text-xl md:text-2xl lg:text-3xl text-white mb-12 max-w-3xl mx-auto drop-shadow-lg"
              >
                {slides[currentSlide].subtitle}
              </p>
              
              <button
                ref={ctaRef}
                className="px-10 py-4 bg-white text-[#2c2c2c] rounded-full text-lg font-semibold hover:bg-[#f5f5dc] transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-white"
              >
                {slides[currentSlide].cta}
              </button>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-[#2c2c2c]" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-[#2c2c2c]" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-[#2c2c2c] mb-16">
              المنتجات المميزة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="bg-white border-2 border-[#f5f5dc] rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="h-64 bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#2c2c2c] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <span className="text-6xl text-[#2c2c2c] opacity-20 group-hover:opacity-30 transition-opacity duration-300">📦</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">
                      منتج رقم {item}
                    </h3>
                    <p className="text-[#2c2c2c] opacity-75 mb-4 text-sm">
                      وصف مختصر للمنتج وميزاته الرائعة
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#2c2c2c]">
                        99.99 ₪
                      </span>
                      <button className="px-4 py-2 bg-[#f5f5dc] text-[#2c2c2c] rounded-full hover:bg-[#e8e8c8] transition-colors font-semibold text-sm">
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f5f5dc]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">شحن مجاني</h3>
                <p className="text-[#2c2c2c] opacity-75">للطلبات فوق 200 ₪</p>
              </div>
              <div className="p-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💳</span>
                </div>
                <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">دفع آمن</h3>
                <p className="text-[#2c2c2c] opacity-75">حماية كاملة لبياناتك</p>
              </div>
              <div className="p-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">إرجاع سهل</h3>
                <p className="text-[#2c2c2c] opacity-75">خلال 14 يوم من الشراء</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
