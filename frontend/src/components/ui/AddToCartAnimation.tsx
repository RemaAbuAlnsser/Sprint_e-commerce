'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface AddToCartAnimationProps {
  show: boolean
  onComplete: () => void
  startPosition?: { x: number; y: number }
  productImage?: string
}

export default function AddToCartAnimation({ show, onComplete, startPosition, productImage }: AddToCartAnimationProps) {
  const [cartPosition, setCartPosition] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const triggerAnimation = useCallback(() => {
    if (!startPosition) return

    // Get cart icon position
    const cartIcon = document.querySelector('[data-cart-icon]')
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect()
      setCartPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }
    setIsAnimating(true)
    
    // Trigger cart icon bounce
    const cartIconElement = document.querySelector('[data-cart-icon]')
    if (cartIconElement) {
      cartIconElement.classList.add('cart-bounce')
      setTimeout(() => {
        cartIconElement.classList.remove('cart-bounce')
      }, 600)
    }
    
    // Complete animation after duration
    const timer = setTimeout(() => {
      setIsAnimating(false)
      onComplete()
    }, 700)
    
    return () => clearTimeout(timer)
  }, [startPosition, onComplete])

  useEffect(() => {
    if (show && startPosition) {
      triggerAnimation()
    }
  }, [show, startPosition, triggerAnimation])

  if (!mounted || !show || !startPosition || !isAnimating) return null

  const animationContent = (
    <>
      {/* Flying product image - beautiful arc animation */}
      <div 
        className="fixed pointer-events-none z-[9999]"
        style={{ 
          left: startPosition.x,
          top: startPosition.y,
          animation: 'fly-to-cart-arc 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
          '--end-x': `${cartPosition.x - startPosition.x}px`,
          '--end-y': `${cartPosition.y - startPosition.y}px`,
        } as React.CSSProperties}
      >
        <div 
          className="w-16 h-16 rounded-xl shadow-2xl overflow-hidden border-2 border-primary bg-white"
          style={{
            animation: 'product-shrink 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
          }}
        >
          {productImage ? (
            <img 
              src={productImage} 
              alt="Product" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          )}
        </div>
      </div>

      {/* Sparkle effects */}
      <div 
        className="fixed pointer-events-none z-[9998]"
        style={{ 
          left: startPosition.x,
          top: startPosition.y,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{
              animation: `sparkle-burst 0.5s ease-out forwards`,
              animationDelay: `${i * 0.05}s`,
              '--angle': `${i * 60}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Trail particles */}
      {[...Array(4)].map((_, i) => (
        <div 
          key={i}
          className="fixed pointer-events-none z-[9997]"
          style={{ 
            left: startPosition.x,
            top: startPosition.y,
            animation: 'fly-to-cart-arc 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
            animationDelay: `${i * 0.08}s`,
            '--end-x': `${cartPosition.x - startPosition.x}px`,
            '--end-y': `${cartPosition.y - startPosition.y}px`,
          } as React.CSSProperties}
        >
          <div 
            className="w-3 h-3 bg-primary/60 rounded-full blur-sm"
            style={{
              animation: 'trail-fade 0.7s ease-out forwards',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        </div>
      ))}
    </>
  )

  return createPortal(animationContent, document.body)
}
