'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import CategorySection from '@/components/CategorySection';
import CategoriesMenu from '@/components/CategoriesMenu';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

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
  const [siteImages, setSiteImages] = useState<Array<{id: number; image_url: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.site_images && data.site_images.length > 0) {
            setSiteImages(data.site_images);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
        }
      } catch (error) {
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchSettings();
    fetchCategories();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (siteImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % siteImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [siteImages.length]);

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
    if (siteImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % siteImages.length);
  };

  const prevSlide = () => {
    if (siteImages.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + siteImages.length) % siteImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <section
          ref={heroRef}
          className="relative h-[60vh] md:h-[80vh] lg:h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black"
        >
          {/* Background Images Slider */}
          {siteImages.length > 0 ? (
            <>
              {siteImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                    currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <Image
                    src={`${API_URL}${image.image_url}`}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes="100vw"
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2c] via-[#1a1a1a] to-black"></div>
          )}

          {/* Navigation Controls */}
          {siteImages.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group"
                aria-label="Next slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Modern Dots Indicator */}
              <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-30">
                {siteImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentSlide === index
                        ? 'bg-[#d4af37] w-8 shadow-lg shadow-[#d4af37]/50'
                        : 'bg-white/40 w-1 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 z-30 animate-bounce hidden md:block">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        <div id="categories" className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="section-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c] mb-3 md:mb-4">
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
