import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden w-full max-w-[280px] sm:max-w-none" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      
      {/* Content */}
      <div className="px-3 pt-3 pb-3 space-y-2" dir="rtl">
        {/* Brand Skeleton */}
        <Skeleton className="h-3 w-16" />
        {/* Title Skeleton */}
        <Skeleton className="h-4 w-3/4" />
        {/* Price Skeleton */}
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="min-w-0">
      <div className="relative aspect-square rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse mb-3" />
      <Skeleton className="h-5 w-24 mx-auto" />
    </div>
  )
}

export function BrandCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-64 h-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl" />
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Skeleton */}
      <div className="bg-white rounded-3xl p-4 sm:p-8">
        <div className="relative aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-2xl" />
      </div>

      {/* Info Skeleton */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-8 w-32 mb-6" />
          
          {/* Details Box */}
          <div className="bg-white rounded-2xl p-6 mb-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-white rounded-2xl p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl p-6">
          <Skeleton className="h-5 w-16 mb-3" />
          <Skeleton className="h-12 w-40" />
        </div>

        {/* Add to Cart Button */}
        <Skeleton className="h-14 w-full rounded-2xl" />

        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <Skeleton className="h-6 w-6 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-4">
      <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[500px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-3xl">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-12 w-40 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function FilterSidebarSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <Skeleton className="h-7 w-24" />
      
      {/* Category Filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Brand Filter */}
      <div className="space-y-3 border-t pt-6">
        <Skeleton className="h-5 w-24" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Price Filter */}
      <div className="space-y-3 border-t pt-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
          <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="border-t pt-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}

export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Side */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      {/* Summary Side */}
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <Skeleton className="h-7 w-28" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 py-3 border-b">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between pt-4 border-t">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl mt-4" />
      </div>
    </div>
  )
}
