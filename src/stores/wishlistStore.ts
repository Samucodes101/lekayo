import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistItem {
  id: string
  name: string
  slug: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (productId) => set((state) => ({ items: state.items.filter(i => i.id !== productId) })),
      isInWishlist: (productId) => get().items.some(i => i.id === productId),
    }),
    { name: "wishlist-storage" }
  )
)