'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { API_URL } from '@/lib/api';
import ReturnPolicyModal from './ReturnPolicyModal';

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

  const [isReturnPolicyOpen, setIsReturnPolicyOpen] = useState(false);

  const getWhatsAppUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const phoneNumber = url.replace(/[^0-9+]/g, '');
    return `https://wa.me/${phoneNumber}`;
  };

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
    <footer ref={footerRef} className="bg-[#1a1d2e] text-white border-t border-white/5">
      <div className="container mx-auto px-6 py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Left Section - Social Icons & Links (4 columns) */}
          <div className="md:col-span-4 flex flex-col gap-8 order-3 md:order-1">
            {/* Social Icons */}
            <div className="flex flex-col gap-4">
              <div ref={socialIconsRef} className="flex items-center gap-3">
                {settings.whatsapp_url && (
                  <a
                    href={getWhatsAppUrl(settings.whatsapp_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#25D366] hover:bg-[#20bd5a] rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                    onMouseEnter={handleIconHover}
                    onMouseLeave={handleIconHoverOut}
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={20} className="text-white" />
                  </a>
                )}
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#1877F2] hover:bg-[#0d65d9] rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                    onMouseEnter={handleIconHover}
                    onMouseLeave={handleIconHoverOut}
                    aria-label="Facebook"
                  >
                    <Facebook size={20} className="text-white" />
                  </a>
                )}
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                    onMouseEnter={handleIconHover}
                    onMouseLeave={handleIconHoverOut}
                    aria-label="Instagram"
                  >
                    <Instagram size={20} className="text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h3 className="text-lg font-bold mb-6 text-white">روابط سريعة</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => router.push('/')}
                    className="text-gray-300 hover:text-white transition-colors text-sm inline-block cursor-pointer hover:translate-x-1 transition-transform"
                    onMouseEnter={handleLinkHover}
                    onMouseLeave={handleLinkHoverOut}
                  >
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/new')}
                    className="text-gray-300 hover:text-white transition-colors text-sm inline-block cursor-pointer hover:translate-x-1 transition-transform"
                    onMouseEnter={handleLinkHover}
                    onMouseLeave={handleLinkHoverOut}
                  >
                    المنتجات
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/deals')}
                    className="text-gray-300 hover:text-white transition-colors text-sm inline-block cursor-pointer hover:translate-x-1 transition-transform"
                    onMouseEnter={handleLinkHover}
                    onMouseLeave={handleLinkHoverOut}
                  >
                    العروض
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsReturnPolicyOpen(true)}
                    className="text-gray-300 hover:text-white transition-colors text-sm inline-block cursor-pointer hover:translate-x-1 transition-transform"
                    onMouseEnter={handleLinkHover}
                    onMouseLeave={handleLinkHoverOut}
                  >
                    سياسة التبديل والاسترجاع
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Center Section - Contact Info (4 columns) */}
          <div className="md:col-span-4 flex flex-col items-start md:items-center gap-6 order-2 md:order-2">
            <div className="w-full">
              <h3 className="text-lg font-bold mb-6 text-white text-right md:text-center">تواصل معنا</h3>
              <ul className="space-y-4">
                {settings.contact_phone && (
                  <li className="flex items-center gap-3 justify-start md:justify-center text-gray-300 text-sm">
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-white transition-colors" dir="ltr">
                      {settings.contact_phone}
                    </a>
                    <Phone size={18} className="text-gray-400" />
                  </li>
                )}
                {settings.address && (
                  <li className="flex items-center gap-3 justify-start md:justify-center text-gray-300 text-sm">
                    <span>{settings.address}</span>
                    <MapPin size={18} className="text-gray-400" />
                  </li>
                )}
              </ul>

              {/* Contact Button */}
              <div className="mt-8 flex justify-start md:justify-center">
                {settings.whatsapp_url && (
                  <a
                    href={getWhatsAppUrl(settings.whatsapp_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <MessageCircle size={20} />
                    <span>تواصل واتساب</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Logo & Brand (4 columns) */}
          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-4 order-1 md:order-3">
            <div className="flex flex-col items-start md:items-end gap-3">
              {settings.site_logo && (
                <img 
                  src={`${API_URL}${settings.site_logo}`} 
                  alt={settings.site_name} 
                  className="h-20 w-auto object-contain"
                />
              )}
              <h2 className="text-2xl font-bold text-white">
                {settings.site_name}
              </h2>
              <p className="text-sm text-gray-400 text-right max-w-xs">
                {settings.site_description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div ref={bottomSectionRef} className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center">
            <p className="text-sm text-gray-400">
              © 2026 {settings.site_name}. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>

      {/* Return Policy Modal */}
      <ReturnPolicyModal 
        isOpen={isReturnPolicyOpen} 
        onClose={() => setIsReturnPolicyOpen(false)} 
      />
    </footer>
  );
});

export default Footer;
