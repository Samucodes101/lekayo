import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WishlistItem {
  id: string
  name: string
  slug: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  isHydrated: boolean
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  syncWishlistWithServer: () => Promise<void>
  setHydrated: (state: boolean) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      setHydrated: (state: boolean) => set({ isHydrated: state }),

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        })),

      isInWishlist: (productId) => get().items.some((i) => i.id === productId),

      clearWishlist: () => set({ items: [] }),

      // No userEmail param — server derives the user from the session, never trust a client-passed email
      syncWishlistWithServer: async () => {
        const res = await fetch("/api/wishlist")
        if (res.ok) {
          const serverItems = await res.json()
          set({ items: serverItems })
        }
      },
    }),
    {
      name: "wishlist-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)