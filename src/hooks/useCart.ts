import { useActiveCart } from "@/hooks/useActiveCart"

export function useCart() {
  // Proxy to the active cart abstraction so callers don't need to know guest vs auth
  return useActiveCart()
}
