'use client';
import { API_URL } from '@/lib/api';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  color_name?: string;
  color_image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { id: number; name: string; price: number; image_url?: string; color_name?: string; color_image_url?: string }) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (productId: number, colorName?: string) => void;
  updateQuantity: (productId: number, quantity: number, colorName?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = async (product: { id: number; name: string; price: number; image_url?: string; color_name?: string; color_image_url?: string }) => {
    try {
      // فحص الكمية المتوفرة من الباك إند
      const response = await fetch(`http://104.234.26.192:3000/products/${product.id}`);
      if (!response.ok) {
        return { success: false, message: 'فشل التحقق من توفر المنتج' };
      }
      
      const productData = await response.json();
      
      // حساب الكمية الحالية في السلة (مع مراعاة اللون)
      const existingItem = items.find((item) => 
        item.id === product.id && 
        item.color_name === product.color_name
      );
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newQuantity = currentQuantity + 1;
      
      // التحقق من توفر الكمية
      if (productData.stock < newQuantity) {
        const message = productData.stock === 0 
          ? `عذراً، المنتج "${product.name}" غير متوفر حالياً`
          : `عذراً، الكمية المتوفرة من "${product.name}" هي ${productData.stock} فقط`;
        return { success: false, message };
      }
      
      // إضافة المنتج للسلة
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => 
          item.id === product.id && 
          item.color_name === product.color_name
        );
        
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id && item.color_name === product.color_name
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        return [...prevItems, { ...product, quantity: 1 }];
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error checking product availability:', error);
      return { success: false, message: 'حدث خطأ أثناء التحقق من توفر المنتج' };
    }
  };

  const removeFromCart = (productId: number, colorName?: string) => {
    setItems((prevItems) => prevItems.filter((item) => 
      !(item.id === productId && item.color_name === colorName)
    ));
  };

  const updateQuantity = (productId: number, quantity: number, colorName?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, colorName);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.color_name === colorName ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
