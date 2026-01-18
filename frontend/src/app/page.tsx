'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import CategoriesList from '@/components/CategoriesList';
import Image from 'next/image';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [siteImage, setSiteImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/settings');
        if (response.ok) {
          const data = await response.json();
          setSiteImage(data.site_image);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 1.2,
          ease: 'power3.out',
        });
      }

      gsap.from(titleRef.current, {
        opacity: 0,
        x: 100,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      });

      gsap.from(subtitleRef.current, {
        opacity: 0,
        x: 100,
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
  }, [currentSlide, loading]);

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
          {!loading && siteImage && (
            <div ref={imageRef} className="absolute inset-0 w-full h-full">
              <Image
                src={`http://localhost:3000${siteImage}`}
                alt="Hero Background"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {!siteImage && (
            <div className="absolute inset-0 bg-white"></div>
          )}

          <button
            onClick={prevSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#2c2c2c] hover:bg-[#1a1a1a] flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#2c2c2c] hover:bg-[#1a1a1a] flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-[#2c2c2c] w-8'
                    : 'bg-[#2c2c2c]/30 hover:bg-[#2c2c2c]/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <CategoriesList />

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-right text-[#2c2c2c] mb-16">
              المنتجات المميزة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#2c2c2c] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                    <span className="text-6xl text-[#2c2c2c] opacity-20 group-hover:opacity-30 transition-opacity duration-300">📦</span>
                  </div>
                  <div className="p-6 bg-white text-right">
                    <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">
                      منتج رقم {item}
                    </h3>
                    <p className="text-[#2c2c2c] opacity-75 mb-4 text-sm">
                      وصف مختصر للمنتج وميزاته الرائعة
                    </p>
                    <div className="flex items-center justify-between">
                      <button className="px-4 py-2 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold text-sm">
                        أضف للسلة
                      </button>
                      <span className="text-2xl font-bold text-[#2c2c2c]">
                        99.99 ₪
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
              <div className="p-8">
                <div className="w-16 h-16 bg-[#2c2c2c] rounded-full flex items-center justify-center mr-auto mb-4">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">شحن مجاني</h3>
                <p className="text-[#2c2c2c] opacity-75">للطلبات فوق 200 ₪</p>
              </div>
              <div className="p-8">
                <div className="w-16 h-16 bg-[#2c2c2c] rounded-full flex items-center justify-center mr-auto mb-4">
                  <span className="text-3xl">💳</span>
                </div>
                <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">دفع آمن</h3>
                <p className="text-[#2c2c2c] opacity-75">حماية كاملة لبياناتك</p>
              </div>
              <div className="p-8">
                <div className="w-16 h-16 bg-[#2c2c2c] rounded-full flex items-center justify-center mr-auto mb-4">
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
