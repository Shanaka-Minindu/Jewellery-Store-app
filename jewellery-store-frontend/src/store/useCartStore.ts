import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/product';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (variantId: number, qty: number) => void;
  removeFromCart: (variantId: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      addToCart: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.variantId === newItem.variantId);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const newQty = Math.min(updatedItems[existingIndex].quantity + newItem.quantity, newItem.maxStock);
            updatedItems[existingIndex].quantity = newQty;
            return { items: updatedItems, isCartOpen: true };
          }
          return { items: [...state.items, newItem], isCartOpen: true };
        }),
      updateQuantity: (variantId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) } : i
          ),
        })),
      removeFromCart: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'shopping-cart-storage', // unique name for localStorage key
      // If you only want to persist 'items' and not 'isCartOpen', you can uncomment partialize:
       partialize: (state) => ({ items: state.items }),
    }
  )
);