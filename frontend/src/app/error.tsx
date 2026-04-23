'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">حدث خطأ غير متوقع</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            حاول مرة أخرى
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  )
}
