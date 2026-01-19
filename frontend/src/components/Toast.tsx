'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        {
          y: -100,
          opacity: 0,
          scale: 0.8,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
        }
      );

      const timer = setTimeout(() => {
        if (toastRef.current) {
          gsap.to(toastRef.current, {
            y: -100,
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: onClose,
          });
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const handleClose = () => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        y: -100,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: onClose,
      });
    }
  };

  return (
    <div
      ref={toastRef}
      className="fixed top-24 left-4 md:left-8 z-[100] bg-white shadow-2xl rounded-lg p-4 flex items-center gap-3 min-w-[300px] border-l-4 border-green-500"
    >
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <p className="flex-1 text-[#2c2c2c] font-semibold">{message}</p>
      <button
        onClick={handleClose}
        className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}
