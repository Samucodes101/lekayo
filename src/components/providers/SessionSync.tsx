"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useGuestCartStore } from "@/stores/guestCartStore"
import { useWishlistStore } from "@/stores/wishlistStore"
import { useGuestWishlistStore } from "@/stores/guestWishlistStore"

export function SessionSync() {
  const { data: session, status } = useSession()
  const syncWithServer = useCartStore((s) => s.syncWithServer)
  const syncWishlistWithServer = useWishlistStore((s) => s.syncWishlistWithServer)
  const mergedRef = useRef(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      mergedRef.current = false
      return
    }

    if (status === "authenticated" && session?.user?.email && !mergedRef.current) {
      mergedRef.current = true

      const sync = async () => {
        const guestItems = useGuestCartStore.getState().items
        if (guestItems.length > 0) {
          const res = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestItems }),
          })
          if (res.ok) {
            useGuestCartStore.getState().clear()
          }
        }
        await syncWithServer()

        const guestWishlistItems = useGuestWishlistStore.getState().items
        if (guestWishlistItems.length > 0) {
          const res = await fetch("/api/wishlist/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestWishlistItems }),
          })
          if (res.ok) {
            useGuestWishlistStore.getState().clear()
          }
        }
        await syncWishlistWithServer()
      }

      sync().catch(console.error)
    }
  }, [status, session, syncWithServer, syncWishlistWithServer])

  return null
}