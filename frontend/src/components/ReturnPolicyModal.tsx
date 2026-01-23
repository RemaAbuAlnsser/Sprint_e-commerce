'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ReturnPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReturnPolicyModal({ isOpen, onClose }: ReturnPolicyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      
      gsap.fromTo(
        contentRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: 'power2.in',
    });
    
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-300 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-black text-center flex-1" dir="rtl">
              سياسة التبديل والاسترجاع
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="إغلاق"
            >
              <X size={24} className="text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8" dir="rtl">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-bold text-black mb-4">1. الكفالة</h3>
              <p className="text-black leading-relaxed">
                جميع المنتجات المباعة تشمل كفالة لمدة سنة كاملة ضد عيوب التصنيع.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-bold text-black mb-4">2. الترجيع بسبب عيب أو مشكلة</h3>
              <ul className="space-y-3 text-black">
                <li className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="leading-relaxed">
                    في حال وجود مشكلة أو عيب مصنعي في المنتج، يحق للزبون إرجاع المنتج.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="leading-relaxed">
                    تكلفة التوصيل (الشحن) في هذه الحالة تكون على <strong>الشركة</strong>.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-bold text-black mb-4">3. سياسة التبديل</h3>
              <ul className="space-y-3 text-black">
                <li className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="leading-relaxed">
                    خدمة التبديل متاحة خلال <strong>7 أيام فقط</strong> من تاريخ شراء المنتج.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="leading-relaxed">
                    يشترط أن يكون المنتج بحالته الأصلية وغير متضرر، مع كامل الإكسسوارات والتغليف.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-bold text-black mb-4">4. تكلفة الشحن في التبديل</h3>
              <p className="text-black leading-relaxed">
                في حالات التبديل (بدون وجود عيب مصنعي)، تكون تكلفة الشحن على <strong>الزبون</strong>.
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <h3 className="text-xl font-bold text-black mb-4">5. ملاحظات عامة</h3>
              <ul className="space-y-3 text-black">
                <li className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="leading-relaxed">
                    لا يتم قبول أي طلب تبديل أو ترجيع بعد انتهاء المدة المحددة.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="leading-relaxed">
                    تحتفظ الشركة بحق فحص المنتج قبل الموافقة النهائية على التبديل أو الترجيع.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-300 rounded-b-3xl">
          <button
            onClick={handleClose}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
