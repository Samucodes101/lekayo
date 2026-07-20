import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WishlistItem } from "./wishlistStore"

interface GuestWishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clear: () => void
}

export const useGuestWishlistStore = create<GuestWishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
      isInWishlist: (productId) => get().items.some((i) => i.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "guest-wishlist-storage" } // different key from "wishlist-storage" — that's the fix
  )
)