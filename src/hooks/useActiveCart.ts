"use client"

import { useSession } from "next-auth/react"
import { useCartStore } from "@/stores/cartStore"
import { useGuestCartStore } from "@/stores/guestCartStore"
import type { CartItem } from "@/stores/cartStore"

export function useActiveCart() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const authItems = useCartStore((s) => s.items)
  const authAddItem = useCartStore((s) => s.addItem)
  const authRemoveItem = useCartStore((s) => s.removeItem)
  const authUpdateQuantity = useCartStore((s) => s.updateQuantity)
  const authGetSubtotal = useCartStore((s) => s.getSubtotal)
  const authGetTotal = useCartStore((s) => s.getTotal)

  const guestItems = useGuestCartStore((s) => s.items)
  const guestAddItem = useGuestCartStore((s) => s.addItem)
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem)
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity)
  const guestGetSubtotal = useGuestCartStore((s) => s.getSubtotal)
  const guestGetTotal = useGuestCartStore((s) => s.getTotal)

  return {
    items: (isAuthed ? authItems : guestItems) as CartItem[],
    addItem: isAuthed ? authAddItem : guestAddItem,
    removeItem: isAuthed ? authRemoveItem : guestRemoveItem,
    updateQuantity: isAuthed ? authUpdateQuantity : guestUpdateQuantity,
    getSubtotal: isAuthed ? authGetSubtotal : guestGetSubtotal,
    getTotal: isAuthed ? authGetTotal : guestGetTotal,
  }
}