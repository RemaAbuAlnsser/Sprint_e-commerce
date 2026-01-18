'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  orderId: number;
  onClose: () => void;
}

export default function SuccessModal({ orderId, onClose }: SuccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current && contentRef.current && iconRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
        contentRef.current,
        { scale: 0.5, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );

      gsap.fromTo(
        iconRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, delay: 0.3, ease: 'back.out(2)' }
      );
    }

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (overlayRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 0.3,
        ease: 'power2.in',
      });

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        onComplete: onClose,
      });
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div
        ref={contentRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div
          ref={iconRef}
          className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-[#2c2c2c] mb-4">
          تم تأكيد طلبك بنجاح!
        </h2>

        <div className="bg-[#d4af37]/10 border-2 border-[#d4af37] rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">رقم الطلب</p>
          <p className="text-3xl font-bold text-[#d4af37]">#{orderId}</p>
        </div>

        <p className="text-lg text-gray-700 mb-2">
          شكراً لاختياركم موقعنا! 🎉
        </p>
        <p className="text-sm text-gray-600 mb-6">
          سيتم التواصل معكم قريباً لتأكيد الطلب وترتيب التوصيل
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-[#2c2c2c] text-white rounded-full hover:bg-[#1a1a1a] transition-colors font-semibold"
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
}
