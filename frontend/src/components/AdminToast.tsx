'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface AdminToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function AdminToast({ message, type = 'success', onClose }: AdminToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        {
          x: 400,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
        }
      );

      const timer = setTimeout(() => {
        if (toastRef.current) {
          gsap.to(toastRef.current, {
            x: 400,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: onClose,
          });
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const handleClose = () => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        x: 400,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: onClose,
      });
    }
  };

  return (
    <div
      ref={toastRef}
      className={`fixed top-24 left-4 md:left-8 z-[100] bg-white shadow-2xl rounded-lg p-4 flex items-center gap-3 min-w-[320px] border-l-4 ${
        type === 'success' ? 'border-green-500' : 'border-red-500'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        type === 'success' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {type === 'success' ? (
          <CheckCircle className={`w-6 h-6 text-green-600`} />
        ) : (
          <AlertCircle className={`w-6 h-6 text-red-600`} />
        )}
      </div>
      <p className="flex-1 text-[#2c2c2c] font-semibold text-sm">{message}</p>
      <button
        onClick={handleClose}
        className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}
