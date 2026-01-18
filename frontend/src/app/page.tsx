'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import CategorySection from '@/components/CategorySection';
import CategoriesMenu from '@/components/CategoriesMenu';
import Footer from '@/components/Footer';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [siteImage, setSiteImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
        console.log('Fetching settings from API...');
        const response = await fetch('http://localhost:3000/settings');
        console.log('Settings response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Settings data received:', data);
          setSiteImage(data.site_image);
          console.log('Site image set to:', data.site_image);
        } else {
          console.error('Failed to fetch settings:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from API...');
        const response = await fetch('http://localhost:3000/categories');
        console.log('Categories response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Categories data received:', data.length, 'categories');
          console.log('Categories:', data);
          setCategories(data);
        } else {
          console.error('Failed to fetch categories:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchSettings();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          opacity: 0,
          scale: 1.15,
          duration: 1.5,
          ease: 'power4.out',
        });
      }

      const timeline = gsap.timeline();
      
      timeline
        .from(titleRef.current, {
          opacity: 0,
          x: 120,
          y: 30,
          duration: 1.2,
          ease: 'power4.out',
        })
        .from(subtitleRef.current, {
          opacity: 0,
          x: 100,
          y: 20,
          duration: 1,
          ease: 'power3.out',
        }, '-=0.6')
        .from(ctaRef.current, {
          opacity: 0,
          scale: 0.7,
          y: 20,
          duration: 0.8,
          ease: 'back.out(2.5)',
        }, '-=0.4');
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
          className="relative h-[60vh] md:h-[70vh] lg:h-screen w-full overflow-hidden"
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
            </div>
          )}

          {!siteImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
          )}

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-4">
              <h1
                ref={titleRef}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl"
              >
                {slides[currentSlide].title}
              </h1>
              <p
                ref={subtitleRef}
                className="text-lg md:text-xl lg:text-2xl text-white mb-6 md:mb-8 drop-shadow-lg"
              >
                {slides[currentSlide].subtitle}
              </p>
              <button
                ref={ctaRef}
                className="px-6 md:px-8 py-3 md:py-4 bg-white text-[#2c2c2c] rounded-full font-bold text-base md:text-lg hover:bg-[#2c2c2c] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {slides[currentSlide].cta}
              </button>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#2c2c2c]" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#2c2c2c]" />
          </button>

          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-white w-6 md:w-8'
                    : 'bg-white/50 w-2 md:w-3 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <div className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c] mb-3 md:mb-4">
                أصنافنا
              </h2>
              <div className="h-1 w-20 md:w-24 bg-[#d4af37] mx-auto rounded-full"></div>
            </div>
          </div>
          
          <CategoriesMenu />
        </div>

        {categoriesLoading ? (
          <div className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center text-[#2c2c2c]">جاري تحميل الأقسام...</div>
            </div>
          </div>
        ) : (
          categories.map((category, index) => (
            <CategorySection key={category.id} category={category} index={index} />
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}
