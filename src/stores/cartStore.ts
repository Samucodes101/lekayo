import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  variantId: string
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  image: string
  color?: { name: string; hex: string }
  size?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getShipping: () => number
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.variantId === item.variantId)
        if (existing) {
          return { items: state.items.map(i => i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i) }
        }
        return { items: [...state.items, item] }
      }),
      removeItem: (variantId) => set((state) => ({ items: state.items.filter(i => i.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) => set((state) => ({ items: state.items.map(i => i.variantId === variantId ? { ...i, quantity } : i) })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getDiscount: () => 0,
      getShipping: () => 0,
      getTotal: () => get().getSubtotal() - get().getDiscount() + get().getShipping(),
    }),
    { name: "cart-storage" }
  )
)