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
  const [siteImages, setSiteImages] = useState<Array<{id: number; image_url: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.site_images && data.site_images.length > 0) {
            setSiteImages(data.site_images);
          }
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
          className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black"
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
                    src={`http://localhost:3000${image.image_url}`}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2c] via-[#1a1a1a] to-black"></div>
          )}

          {/* Professional Content Overlay */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-white space-y-8">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">متجر Sprint الرسمي</span>
                  </div>

                  {/* Main Heading */}
                  <div className="space-y-4">
                    <h1 
                      ref={titleRef}
                      className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight"
                    >
                      <span className="block text-white">اكتشف عالم</span>
                      <span className="block bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent">
                        التسوق الذكي
                      </span>
                    </h1>
                    <p 
                      ref={subtitleRef}
                      className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl"
                    >
                      منتجات عالية الجودة، أسعار منافسة، وتجربة تسوق استثنائية تناسب جميع احتياجاتك
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-6 py-6">
                    <div className="text-center lg:text-right">
                      <div className="text-2xl md:text-3xl font-bold text-[#d4af37]">1000+</div>
                      <div className="text-sm text-gray-400">منتج متنوع</div>
                    </div>
                    <div className="text-center lg:text-right">
                      <div className="text-2xl md:text-3xl font-bold text-[#d4af37]">50K+</div>
                      <div className="text-sm text-gray-400">عميل راضي</div>
                    </div>
                    <div className="text-center lg:text-right">
                      <div className="text-2xl md:text-3xl font-bold text-[#d4af37]">24/7</div>
                      <div className="text-sm text-gray-400">دعم فني</div>
                    </div>
                  </div>

                  {/* Call to Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      ref={ctaRef}
                      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[#d4af37]/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="relative z-10">تسوق الآن</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f4d03f] to-[#d4af37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button
                      onClick={() => document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                    >
                      <span>استكشف الأقسام</span>
                      <ChevronLeft className="inline-block w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">شحن مجاني</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">ضمان الجودة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">دفع آمن</span>
                    </div>
                  </div>
                </div>

                {/* Right Visual Element */}
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent rounded-3xl blur-3xl"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">جودة مضمونة</h3>
                            <p className="text-gray-400 text-sm">منتجات أصلية 100%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">توصيل سريع</h3>
                            <p className="text-gray-400 text-sm">خلال 24-48 ساعة</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">دعم 24/7</h3>
                            <p className="text-gray-400 text-sm">خدمة عملاء متميزة</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {siteImages.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group"
                aria-label="Next slide"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Modern Dots Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
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
          <div className="absolute bottom-8 right-8 z-30 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        <div id="categories" className="py-8 md:py-12 bg-gray-50">
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
