'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center px-4">
            <div className="text-8xl mb-6">💥</div>
            <h1 className="text-3xl font-bold text-white mb-4">حدث خطأ في التطبيق</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              نعتذر عن هذا الخطأ الفني. يرجى تحديث الصفحة أو المحاولة لاحقاً.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                حاول مرة أخرى
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                العودة للرئيسية
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
