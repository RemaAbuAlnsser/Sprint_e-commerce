import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center px-4">
        <div className="text-9xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  )
}
