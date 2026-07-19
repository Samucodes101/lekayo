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
  mergeGuestWishlist: (userEmail: string) => Promise<void>
  syncWishlistWithServer: (userEmail: string) => Promise<void>
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

      mergeGuestWishlist: async (userEmail: string) => {
        const { items } = get()
        if (items.length === 0) return
        await fetch("/api/wishlist/merge", {
          method: "POST",
          body: JSON.stringify({ items, userEmail }),
          headers: { "Content-Type": "application/json" },
        })
        set({ items: [] })
      },

      syncWishlistWithServer: async (userEmail: string) => {
        const res = await fetch(`/api/wishlist?userEmail=${userEmail}`)
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