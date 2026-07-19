"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useWishlistStore } from "@/stores/wishlistStore"

export function SessionSync() {
  const { data: session, status } = useSession()
  const { mergeGuestCart, syncWithServer } = useCartStore()
  const { mergeGuestWishlist, syncWishlistWithServer } = useWishlistStore()
  const mergedRef = useRef(false)

  useEffect(() => {
    // Reset merge flag on logout
    if (status === "unauthenticated") {
      mergedRef.current = false
      return
    }

    // Only run once per authenticated session
    if (status === "authenticated" && session?.user?.email && !mergedRef.current) {
      mergedRef.current = true
      const sync = async () => {
        // Merge guest cart into DB, then sync back
        await mergeGuestCart(session.user.email!)
        await syncWithServer(session.user.email!)
        await mergeGuestWishlist(session.user.email!)
        await syncWishlistWithServer(session.user.email!)
      }
      sync().catch(console.error)
    }
  }, [status, session, mergeGuestCart, syncWithServer, mergeGuestWishlist, syncWishlistWithServer])

  return null
}