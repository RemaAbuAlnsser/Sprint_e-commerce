export default function ProductSkeleton() {
  return (
    <div className="product-card animate-pulse">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200 mb-3"></div>
      <div className="text-center">
        <div className="h-6 bg-gray-200 rounded mb-3 mx-auto w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded mb-4 mx-auto w-1/2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}
