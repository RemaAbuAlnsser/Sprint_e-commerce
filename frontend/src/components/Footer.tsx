'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const socialIconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (topSectionRef.current) {
        const columns = topSectionRef.current.querySelectorAll('.footer-column');
        gsap.from(columns, {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 60,
          scale: 0.95,
          duration: 1,
          stagger: {
            amount: 0.4,
            ease: 'power2.out',
          },
          ease: 'power4.out',
        });
      }

      if (socialIconsRef.current) {
        const icons = socialIconsRef.current.children;
        gsap.from(icons, {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          scale: 0,
          rotation: -360,
          duration: 0.8,
          stagger: {
            amount: 0.3,
            ease: 'power2.out',
          },
          ease: 'back.out(2.5)',
          delay: 0.6,
        });
      }

      if (bottomSectionRef.current) {
        gsap.from(bottomSectionRef.current, {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          delay: 1,
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleIconHover = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.3,
      rotate: 15,
      duration: 0.4,
      ease: 'back.out(2)',
    });
  };

  const handleIconHoverOut = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      rotate: 0,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  const handleLinkHover = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      x: -8,
      scale: 1.05,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  const handleLinkHoverOut = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  return (
    <footer ref={footerRef} className="bg-[#2c2c2c] text-white">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div ref={topSectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="footer-column text-right">
            <div className="flex items-center gap-3 mb-6 justify-end">
              <div className="flex flex-col text-right">
                <span className="text-2xl font-bold text-white leading-tight">متجر Sprint</span>
                <span className="text-sm text-gray-400">متجرك الموثوق</span>
              </div>
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-[#2c2c2c]">S</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              نقدم لكم أفضل المنتجات بأعلى جودة وأفضل الأسعار. تسوق بثقة وراحة من منزلك.
            </p>
          </div>

          <div className="footer-column text-right">
            <h3 className="text-lg font-bold mb-4 text-white">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  الرئيسية
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  المنتجات
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  العروض
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  من نحن
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column text-right">
            <h3 className="text-lg font-bold mb-4 text-white">خدمة العملاء</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  تواصل معنا
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  سياسة الإرجاع
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  الشحن والتوصيل
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column text-right">
            <h3 className="text-lg font-bold mb-4 text-white">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 justify-end text-gray-400 text-sm">
                <span>info@sprint-store.com</span>
                <Mail size={18} className="text-[#d4af37]" />
              </li>
              <li className="flex items-center gap-3 justify-end text-gray-400 text-sm">
                <span dir="ltr">+972 123 456 789</span>
                <Phone size={18} className="text-[#d4af37]" />
              </li>
              <li className="flex items-center gap-3 justify-end text-gray-400 text-sm">
                <span>فلسطين، رام الله</span>
                <MapPin size={18} className="text-[#d4af37]" />
              </li>
            </ul>

            <div ref={socialIconsRef} className="flex items-center gap-3 mt-6 justify-end">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#d4af37] rounded-full flex items-center justify-center transition-colors"
                onMouseEnter={handleIconHover}
                onMouseLeave={handleIconHoverOut}
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#d4af37] rounded-full flex items-center justify-center transition-colors"
                onMouseEnter={handleIconHover}
                onMouseLeave={handleIconHoverOut}
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#d4af37] rounded-full flex items-center justify-center transition-colors"
                onMouseEnter={handleIconHover}
                onMouseLeave={handleIconHoverOut}
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>

        <div ref={bottomSectionRef} className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-[#d4af37] transition-colors">
                سياسة الخصوصية
              </a>
              <span className="text-white/20">|</span>
              <a href="#" className="hover:text-[#d4af37] transition-colors">
                الشروط والأحكام
              </a>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 متجر Sprint. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

