/**
 * Observer Pattern Implementation for Stock Notifications
 * 
 * This service manages product stock notifications using the Observer pattern.
 * It allows components to subscribe to product availability updates and get notified
 * when products become available.
 */

export interface ProductInterest {
  productId: string
  variantId: string
  productTitle: string
  productImage: string
  variantPrice?: number
  timestamp: number
}

export interface StockUpdate {
  productId: string
  variantId: string
  inStock: boolean
  quantity: number
}

type Observer = (products: ProductInterest[]) => void

class StockNotificationObserver {
  private observers: Set<Observer> = new Set()
  private interestedProducts: ProductInterest[] = []
  private readonly STORAGE_KEY = 'interested_products'
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Subscribe an observer to receive notifications
   */
  subscribe(observer: Observer): () => void {
    this.observers.add(observer)
    
    // Immediately notify the new observer with current state
    observer(this.interestedProducts)
    
    // Return unsubscribe function
    return () => this.unsubscribe(observer)
  }

  /**
   * Unsubscribe an observer
   */
  unsubscribe(observer: Observer): void {
    this.observers.delete(observer)
  }

  /**
   * Notify all observers with updated product list
   */
  private notify(): void {
    this.observers.forEach(observer => {
      observer([...this.interestedProducts])
    })
  }

  /**
   * Add a product to the interested list
   */
  addInterest(product: ProductInterest): void {
    // Check if already exists
    const exists = this.interestedProducts.some(
      p => p.productId === product.productId && p.variantId === product.variantId
    )

    if (!exists) {
      this.interestedProducts.push(product)
      this.saveToStorage()
      this.notify()
    }
  }

  /**
   * Remove a product from the interested list
   */
  removeInterest(productId: string, variantId: string): void {
    this.interestedProducts = this.interestedProducts.filter(
      p => !(p.productId === productId && p.variantId === variantId)
    )
    this.saveToStorage()
    this.notify()
  }

  /**
   * Get all interested products
   */
  getInterestedProducts(): ProductInterest[] {
    return [...this.interestedProducts]
  }

  /**
   * Check if a product is in the interested list
   */
  isInterested(productId: string, variantId: string): boolean {
    return this.interestedProducts.some(
      p => p.productId === productId && p.variantId === variantId
    )
  }

  /**
   * Clear all interested products
   */
  clearAll(): void {
    this.interestedProducts = []
    this.saveToStorage()
    this.notify()
  }

  /**
   * Start periodic stock checking
   */
  startStockChecking(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(() => {
      this.checkStockAvailability()
    }, intervalMs)

    // Check immediately
    this.checkStockAvailability()
  }

  /**
   * Stop periodic stock checking
   */
  stopStockChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Check stock availability for all interested products
   */
  async checkStockAvailability(): Promise<ProductInterest[]> {
    if (this.interestedProducts.length === 0) {
      return []
    }

    const availableProducts: ProductInterest[] = []

    for (const product of this.interestedProducts) {
      try {
        const res = await fetch(`${API_URL}/store/products/${product.productId}`)
        const data = await res.json()

        if (data.product && data.product.variants) {
          const variant = data.product.variants.find(
            (v: any) => v.id === product.variantId
          )

          if (variant && variant.inventory_quantity > 0) {
            availableProducts.push({
              ...product,
              variantPrice: variant.price
            })
          }
        }
      } catch (error) {
        console.error(`Error checking product ${product.productId}:`, error)
      }
    }

    // Remove available products from interested list
    if (availableProducts.length > 0) {
      availableProducts.forEach(p => {
        this.removeInterest(p.productId, p.variantId)
      })
    }

    return availableProducts
  }

  /**
   * Save interested products to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.interestedProducts))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Load interested products from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.interestedProducts = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      this.interestedProducts = []
    }
  }
}

// Singleton instance
import { API_URL } from '@/lib/api';

let observerInstance: StockNotificationObserver | null = null

export const getStockNotificationObserver = (): StockNotificationObserver => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return a dummy instance
    return new StockNotificationObserver()
  }

  if (!observerInstance) {
    observerInstance = new StockNotificationObserver()
  }

  return observerInstance
}

export default StockNotificationObserver
