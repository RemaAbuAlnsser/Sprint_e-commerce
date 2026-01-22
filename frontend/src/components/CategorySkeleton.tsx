export default function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200 mb-3"></div>
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded mb-3 mx-auto w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded mb-4 mx-auto w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
