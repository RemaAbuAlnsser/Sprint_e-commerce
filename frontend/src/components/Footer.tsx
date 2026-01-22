'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { API_URL } from '@/lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Footer = memo(function Footer() {
  const router = useRouter();
  const footerRef = useRef<HTMLElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const socialIconsRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState({
    site_name: 'متجر Sprint',
    site_description: 'نقدم لكم أفضل المنتجات بأعلى جودة وأفضل الأسعار',
    contact_email: 'info@sprint-store.com',
    contact_phone: '+972 123 456 789',
    address: 'فلسطين، رام الله',
    facebook_url: '',
    instagram_url: '',
    whatsapp_url: '',
    site_logo: ''
  });

  useEffect(() => {
    // تحميل الإعدادات من API
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        setSettings({
          site_name: data.site_name || 'متجر Sprint',
          site_description: data.site_description || 'نقدم لكم أفضل المنتجات بأعلى جودة وأفضل الأسعار',
          contact_email: data.contact_email || 'info@sprint-store.com',
          contact_phone: data.contact_phone || '+972 123 456 789',
          address: data.address || 'فلسطين، رام الله',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          whatsapp_url: data.whatsapp_url || '',
          site_logo: data.site_logo || ''
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
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
                <span className="text-2xl font-bold text-white leading-tight">{settings.site_name}</span>
                <span className="text-sm text-gray-400">متجرك الموثوق</span>
              </div>
              {settings.site_logo ? (
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                  <img src={`http://104.234.26.192:3000${settings.site_logo}`} alt={settings.site_name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-[#2c2c2c]">S</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings.site_description}
            </p>
          </div>

          <div className="footer-column text-right">
            <h3 className="text-lg font-bold mb-4 text-white">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block cursor-pointer"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/new')}
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block cursor-pointer"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  المنتجات
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/deals')}
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block cursor-pointer"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  العروض
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm inline-block cursor-pointer"
                  onMouseEnter={handleLinkHover}
                  onMouseLeave={handleLinkHoverOut}
                >
                  من نحن
                </button>
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
              {settings.contact_email && (
                <li className="flex items-center gap-3 justify-end text-gray-400 text-sm">
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-[#d4af37] transition-colors">
                    {settings.contact_email}
                  </a>
                  <Mail size={18} className="text-[#d4af37]" />
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-3 justify-end text-gray-400 text-sm">
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-[#d4af37] transition-colors" dir="ltr">
                    {settings.contact_phone}
                  </a>
                  <Phone size={18} className="text-[#d4af37]" />
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-3 justify-end text-gray-400 text-sm">
                  <span>{settings.address}</span>
                  <MapPin size={18} className="text-[#d4af37]" />
                </li>
              )}
            </ul>

            <div ref={socialIconsRef} className="flex items-center gap-3 mt-6 justify-end">
              {settings.whatsapp_url && (
                <a
                  href={settings.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-colors"
                  onMouseEnter={handleIconHover}
                  onMouseLeave={handleIconHoverOut}
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-[#E4405F] rounded-full flex items-center justify-center transition-colors"
                  onMouseEnter={handleIconHover}
                  onMouseLeave={handleIconHoverOut}
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-colors"
                  onMouseEnter={handleIconHover}
                  onMouseLeave={handleIconHoverOut}
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
              )}
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
              © 2026 {settings.site_name}. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
