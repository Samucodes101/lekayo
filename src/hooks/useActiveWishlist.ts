"use client"

import { useSession } from "next-auth/react"
import { useWishlistStore } from "@/stores/wishlistStore"
import { useGuestWishlistStore } from "@/stores/guestWishlistStore"
import type { WishlistItem } from "@/stores/wishlistStore"

export function useActiveWishlist() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const authItems = useWishlistStore((s) => s.items)
  const authAddItem = useWishlistStore((s) => s.addItem)
  const authRemoveItem = useWishlistStore((s) => s.removeItem)
  const authIsInWishlist = useWishlistStore((s) => s.isInWishlist)

  const guestItems = useGuestWishlistStore((s) => s.items)
  const guestAddItem = useGuestWishlistStore((s) => s.addItem)
  const guestRemoveItem = useGuestWishlistStore((s) => s.removeItem)
  const guestIsInWishlist = useGuestWishlistStore((s) => s.isInWishlist)

  return {
    items: (isAuthed ? authItems : guestItems) as WishlistItem[],
    addItem: isAuthed ? authAddItem : guestAddItem,
    removeItem: isAuthed ? authRemoveItem : guestRemoveItem,
    isInWishlist: isAuthed ? authIsInWishlist : guestIsInWishlist,
  }
}