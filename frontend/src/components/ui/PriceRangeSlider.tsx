'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface PriceRangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  className?: string
}

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  className = ''
}: PriceRangeSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const minThumbRef = useRef<HTMLDivElement>(null)
  const maxThumbRef = useRef<HTMLDivElement>(null)
  const minTooltipRef = useRef<HTMLDivElement>(null)
  const maxTooltipRef = useRef<HTMLDivElement>(null)
  
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return min

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    return Math.round(min + (percentage / 100) * (max - min))
  }

  const updateThumbPosition = (thumb: 'min' | 'max', newValue: number) => {
    const percentage = getPercentage(newValue)
    const thumbEl = thumb === 'min' ? minThumbRef.current : maxThumbRef.current
    const tooltipEl = thumb === 'min' ? minTooltipRef.current : maxTooltipRef.current

    if (thumbEl) {
      gsap.to(thumbEl, {
        left: `${percentage}%`,
        duration: 0.2,
        ease: 'power2.out'
      })
    }

    if (tooltipEl) {
      gsap.to(tooltipEl, {
        left: `${percentage}%`,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
  }

  const updateFill = () => {
    if (!fillRef.current) return

    const minPercent = getPercentage(localValue[0])
    const maxPercent = getPercentage(localValue[1])

    gsap.to(fillRef.current, {
      left: `${minPercent}%`,
      width: `${maxPercent - minPercent}%`,
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  useEffect(() => {
    updateThumbPosition('min', localValue[0])
    updateThumbPosition('max', localValue[1])
    updateFill()
  }, [localValue, min, max])

  const handleStart = (thumb: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(thumb)

    const thumbEl = thumb === 'min' ? minThumbRef.current : maxThumbRef.current
    if (thumbEl) {
      gsap.to(thumbEl, {
        scale: 1.3,
        duration: 0.2,
        ease: 'back.out(2)'
      })
    }
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const newValue = getValueFromPosition(clientX)

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, localValue[1] - 1)
      setLocalValue([newMin, localValue[1]])
      onChange([newMin, localValue[1]])
    } else {
      const newMax = Math.max(newValue, localValue[0] + 1)
      setLocalValue([localValue[0], newMax])
      onChange([localValue[0], newMax])
    }
  }

  const handleEnd = () => {
    if (!isDragging) return

    const thumbEl = isDragging === 'min' ? minThumbRef.current : maxThumbRef.current
    if (thumbEl) {
      gsap.to(thumbEl, {
        scale: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      })
    }

    setIsDragging(null)
  }

  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
      
      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false })
      document.addEventListener('touchend', handleEnd)

      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isDragging, localValue])

  const handleThumbHover = (thumb: HTMLDivElement, isEnter: boolean) => {
    if (isDragging) return

    gsap.to(thumb, {
      scale: isEnter ? 1.2 : 1,
      duration: 0.3,
      ease: 'back.out(2)'
    })
  }

  return (
    <div className={`relative ${className}`}>
      {/* Value Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
          ₪{localValue[0]}
        </div>
        <div className="text-xs text-gray-500">إلى</div>
        <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
          ₪{localValue[1]}
        </div>
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative h-2 cursor-pointer"
        style={{ paddingTop: '20px', paddingBottom: '20px' }}
      >
        {/* Background Track */}
        <div
          ref={trackRef}
          className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full"
        />

        {/* Active Fill */}
        <div
          ref={fillRef}
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full shadow-lg"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`
          }}
        />

        {/* Min Thumb */}
        <div
          ref={minThumbRef}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing z-10 touch-none"
          style={{ left: `${getPercentage(localValue[0])}%` }}
          onMouseDown={handleStart('min')}
          onTouchStart={handleStart('min')}
          onMouseEnter={(e) => handleThumbHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleThumbHover(e.currentTarget, false)}
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>

        {/* Max Thumb */}
        <div
          ref={maxThumbRef}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing z-10 touch-none"
          style={{ left: `${getPercentage(localValue[1])}%` }}
          onMouseDown={handleStart('max')}
          onTouchStart={handleStart('max')}
          onMouseEnter={(e) => handleThumbHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleThumbHover(e.currentTarget, false)}
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>

        {/* Min Tooltip */}
        <div
          ref={minTooltipRef}
          className={`absolute -top-8 -translate-x-1/2 px-2 py-1 bg-primary text-white text-xs font-semibold rounded shadow-lg transition-opacity ${
            isDragging === 'min' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ left: `${getPercentage(localValue[0])}%` }}
        >
          ₪{localValue[0]}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-primary rotate-45" />
        </div>

        {/* Max Tooltip */}
        <div
          ref={maxTooltipRef}
          className={`absolute -top-8 -translate-x-1/2 px-2 py-1 bg-primary text-white text-xs font-semibold rounded shadow-lg transition-opacity ${
            isDragging === 'max' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ left: `${getPercentage(localValue[1])}%` }}
        >
          ₪{localValue[1]}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-primary rotate-45" />
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>₪{min}</span>
        <span>₪{max}</span>
      </div>
    </div>
  )
}
