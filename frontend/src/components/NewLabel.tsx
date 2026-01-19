import React from 'react';

interface NewLabelProps {
  className?: string;
}

export default function NewLabel({ className = '' }: NewLabelProps) {
  return (
    <div className={`absolute left-2 z-10 ${className || 'top-2'}`}>
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
        جديد
      </div>
    </div>
  );
}
