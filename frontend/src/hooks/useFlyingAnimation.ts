import { useState, useCallback } from 'react';
import gsap from 'gsap';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

export const useFlyingAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const createFlyingAnimation = useCallback((
    buttonElement: HTMLElement | null,
    product: Product,
    onComplete?: () => void
  ) => {
    if (!product || isAnimating || !buttonElement) return;
    
    setIsAnimating(true);
    
    // Get the current product image
    const currentImageUrl = product.image_url;
    if (!currentImageUrl) {
      setIsAnimating(false);
      onComplete?.();
      return;
    }
    
    // Create flying product element
    const flyingProduct = document.createElement('div');
    flyingProduct.className = 'fixed pointer-events-none z-[9999]';
    flyingProduct.style.width = '60px';
    flyingProduct.style.height = '60px';
    
    const flyingImage = document.createElement('img');
    flyingImage.src = `http://localhost:3000${currentImageUrl}`;
    flyingImage.className = 'w-full h-full object-cover rounded-lg shadow-lg';
    flyingProduct.appendChild(flyingImage);
    
    document.body.appendChild(flyingProduct);
    
    // Get button position
    const buttonRect = buttonElement.getBoundingClientRect();
    
    // Get cart icon position
    const cartIcon = document.querySelector('[aria-label="Cart"]');
    const cartRect = cartIcon?.getBoundingClientRect();
    
    if (!cartRect) {
      document.body.removeChild(flyingProduct);
      setIsAnimating(false);
      onComplete?.();
      return;
    }
    
    // Set initial position
    gsap.set(flyingProduct, {
      left: buttonRect.left + buttonRect.width / 2 - 30,
      top: buttonRect.top + buttonRect.height / 2 - 30,
      scale: 1,
      opacity: 1,
    });
    
    // Animate to cart
    gsap.to(flyingProduct, {
      left: cartRect.left + cartRect.width / 2 - 30,
      top: cartRect.top + cartRect.height / 2 - 30,
      scale: 0.3,
      opacity: 0.8,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        // Remove element and reset animation state
        document.body.removeChild(flyingProduct);
        setIsAnimating(false);
        
        // Add cart bounce effect
        if (cartIcon) {
          gsap.to(cartIcon, {
            scale: 1.2,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          });
        }
        
        onComplete?.();
      }
    });
  }, [isAnimating]);

  return {
    isAnimating,
    createFlyingAnimation,
  };
};
