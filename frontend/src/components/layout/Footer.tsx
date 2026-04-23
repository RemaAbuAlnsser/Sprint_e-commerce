import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, MessageCircle, Phone, MapPin, ChevronLeft } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        {/* Top Section - Logo & Social */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-12 border-b border-white/10">
          {/* Logo */}
          <div className="text-center lg:text-right">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Spirit - متجر الإكسسوارات"
                width={180}
                height={65}
                className="h-14 w-auto object-contain mx-auto lg:mx-0 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-white/60 text-sm mt-2">متجر الإكسسوارات</p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://www.facebook.com/spirit.Accessories" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://wa.me/972566331012" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Middle Section - Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
          {/* Quick Links */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-3 text-white">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/70 hover:text-primary transition-colors flex items-center justify-center md:justify-end gap-2 group">
                  <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>الرئيسية</span>
                </Link>
              </li>

              <li>
                <Link href="/products" className="text-white/70 hover:text-primary transition-colors flex items-center justify-center md:justify-end gap-2 group">
                  <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>المنتجات</span>
                </Link>
              </li>

              <li>
                <Link href="/cart" className="text-white/70 hover:text-primary transition-colors flex items-center justify-center md:justify-end gap-2 group">
                  <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>السلة</span>
                </Link>
              </li>

              {/* ✅ الرابط المضاف فقط */}
              <li>
                <Link
                  href="/return-policy"
                  className="text-white/70 hover:text-primary transition-colors flex items-center justify-center md:justify-end gap-2 group"
                >
                  <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>سياسة التبديل والاسترجاع</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-3 text-white">تواصل معنا</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+972566331012" className="text-white/70 hover:text-primary transition-colors flex items-center justify-center md:justify-end gap-3">
                  <span dir="ltr">+972-56-633-1012</span>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                </a>
              </li>
              <li>
                <div className="text-white/70 flex items-center justify-center md:justify-end gap-3">
                  <span>نابلس ، فلسطين</span>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-3 text-white">خدمة العملاء</h3>
            <p className="text-white/60 text-sm mb-4">تواصل معنا عبر الواتساب للاستفسارات والطلبات</p>
            <a 
              href="https://wa.me/972566331012" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
            >
              <span className="font-medium">تواصل واتساب</span>
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/30">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
            <p className="text-white/50 text-sm">
              © 2026 Spirit. جميع الحقوق محفوظة
            </p>
            <p className="text-white/40 text-xs">
              Made by{' '}
              <a
                href="https://www.linkedin.com/in/zaid-abu-samra-b96130336/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Zaid Abu Samra ❤️
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
