"use client"

import { useSession } from "next-auth/react"
import { useCartStore } from "@/stores/cartStore"
import { useGuestCartStore } from "@/stores/guestCartStore"
import type { CartItem } from "@/stores/cartStore"
import { useCallback } from "react"

export function useActiveCart() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const authItems = useCartStore((s) => s.items)
  const authAddItem = useCartStore((s) => s.addItem)
  const authRemoveItem = useCartStore((s) => s.removeItem)
  const authUpdateQuantity = useCartStore((s) => s.updateQuantity)
  const authGetSubtotal = useCartStore((s) => s.getSubtotal)
  const authGetTotal = useCartStore((s) => s.getTotal)
  const authSync = useCartStore((s) => s.syncWithServer)

  const guestItems = useGuestCartStore((s) => s.items)
  const guestAddItem = useGuestCartStore((s) => s.addItem)
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem)
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity)
  const guestGetSubtotal = useGuestCartStore((s) => s.getSubtotal)
  const guestGetTotal = useGuestCartStore((s) => s.getTotal)

  // Wrapped actions that ensure server-side sync for authenticated users
  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      if (isAuthed) {
        // Optimistically update local auth store
        authAddItem(item)
        try {
          await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ variantId: item.variantId, quantity: item.quantity || 1 }] }),
          })
        } catch (err) {
          console.error("Failed to merge cart item:", err)
        }
        // Refresh from server to ensure canonical state
        try {
          await authSync()
        } catch (err) {
          console.error("Failed to sync cart after add:", err)
        }
      } else {
        guestAddItem(item)
      }
    },
    [isAuthed, authAddItem, guestAddItem, authSync]
  )

  const removeItem = useCallback(
    async (variantId: string) => {
      if (isAuthed) {
        authRemoveItem(variantId)
        try {
          await fetch("/api/cart/item", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId }),
          })
        } catch (err) {
          console.error("Failed to delete cart item:", err)
        }
        try {
          await authSync()
        } catch (err) {
          console.error("Failed to sync cart after delete:", err)
        }
      } else {
        guestRemoveItem(variantId)
      }
    },
    [isAuthed, authRemoveItem, guestRemoveItem, authSync]
  )

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (isAuthed) {
        authUpdateQuantity(variantId, quantity)
        try {
          await fetch("/api/cart/item", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId, quantity }),
          })
        } catch (err) {
          console.error("Failed to update cart item quantity:", err)
        }
        try {
          await authSync()
        } catch (err) {
          console.error("Failed to sync cart after update:", err)
        }
      } else {
        guestUpdateQuantity(variantId, quantity)
      }
    },
    [isAuthed, authUpdateQuantity, guestUpdateQuantity, authSync]
  )

  return {
    items: (isAuthed ? authItems : guestItems) as CartItem[],
    addItem,
    removeItem,
    updateQuantity,
    getSubtotal: isAuthed ? authGetSubtotal : guestGetSubtotal,
    getTotal: isAuthed ? authGetTotal : guestGetTotal,
  }
}
