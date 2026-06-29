import { useWishlistStore } from "@/stores/wishlistStore"

export function useWishlist() {
  const { items, addItem, removeItem, isInWishlist } = useWishlistStore()
  return { items, addItem, removeItem, isInWishlist }
}