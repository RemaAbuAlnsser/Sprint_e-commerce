import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProductColor {
  id: string
  color_name: string
  image_url: string
  inventory_quantity?: number
}

interface CartItem {
  id: string
  variantId: string
  title: string
  price: number
  quantity: number
  thumbnail?: string
  color?: string
  colorImage?: string
  availableColors?: ProductColor[]
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  updateColor: (variantId: string, color: string, colorImage: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.variantId === item.variantId)
        
        let finalItem = { ...item }
        
        if (item.availableColors && item.availableColors.length > 0) {
          const selectedColor = item.availableColors.find(c => c.color_name === item.color)
          
          if (!selectedColor || (selectedColor.inventory_quantity || 0) <= 0) {
            const availableColor = item.availableColors.find(c => (c.inventory_quantity || 0) > 0)
            
            if (availableColor) {
              finalItem = {
                ...item,
                color: availableColor.color_name,
                colorImage: availableColor.image_url
              }
            }
          }
        }
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity, color: finalItem.color, colorImage: finalItem.colorImage }
                : i
            ),
          })
        } else {
          set({ items: [...items, finalItem] })
        }
      },
      
      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) })
      },
      
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        })
      },
      
      updateColor: (variantId, color, colorImage) => {
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, color, colorImage } : i
          ),
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
