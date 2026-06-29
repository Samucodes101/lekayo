import { useCartStore } from "@/stores/cartStore"

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore()
  return { items, addItem, removeItem, updateQuantity, clearCart }
}