import { create } from "zustand"
import { persist } from "zustand/middleware"
export interface CartItem {
  variantId: string
  productId: string
  name: string
  sku: string
  price: number
  originalPrice: number
  quantity: number
  image: string
  stock?: number
  color?: { name: string; hex: string }
  size?: string
}

interface CartStore {
  items: CartItem[]
  isHydrated: boolean
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  syncWithServer: () => Promise<void>
  getSubtotal: () => number
  getTotal: () => number
  setHydrated: (state: boolean) => void
}

// Clamp a quantity to the variant's available stock (when known).
function clampQuantity(quantity: number, stock?: number) {
  if (stock === undefined) return quantity
  return Math.max(1, Math.min(quantity, stock))
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            const stock = item.stock ?? existing.stock
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      stock,
                      quantity: clampQuantity(
                        i.quantity + (item.quantity || 1),
                        stock,
                      ),
                    }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: clampQuantity(item.quantity || 1, item.stock),
              },
            ],
          }
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: clampQuantity(quantity, i.stock) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      // No userEmail param needed — server derives user from session, same as your GET route
      syncWithServer: async () => {
        const res = await fetch("/api/cart")
        if (res.ok) {
          const serverItems = await res.json()
          set({ items: serverItems })
        }
      },

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getTotal: () => get().getSubtotal(),
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)