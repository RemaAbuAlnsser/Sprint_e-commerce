'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    danger: (
      <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
    ),
    warning: (
      <div className="w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    ),
    info: (
      <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  };

  const btnColorMap = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-600/30',
    warning: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/30',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30',
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onCancel}>
      <div
        className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {iconMap[type]}
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded-xl font-semibold transition-all shadow-lg ${btnColorMap[type]}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
