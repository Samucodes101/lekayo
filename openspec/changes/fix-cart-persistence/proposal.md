## Why

Guest cart items persist after deletion and reappear after a page refresh because some UI components (Navbar, CartItem) directly use the authenticated cart store (useCartStore) while the rest of the app uses useActiveCart which switches between guest and auth stores. This leads to delete/remove operating on the wrong store for unauthenticated users.

## What Changes

- Ensure all cart-reading and cart-mutating UI and hooks use a single abstraction: `useActiveCart`.
- Replace direct uses of `useCartStore` in UI components that display or modify the cart with `useActiveCart` so actions operate on the active (guest or auth) store.
- Update SessionSync merging logic to clear both guest and auth store persisted storage where appropriate after a successful merge.
- Add tests or manual verification steps for guest add/remove behavior and sign-in merge behavior.

## Capabilities

### New Capabilities
- `cart-active-abstraction`: Standardize cart access to `useActiveCart` and ensure consistent behavior across authenticated and guest flows.

### Modified Capabilities
- `ui-cart`: Update cart UI components (Navbar, CartSheet, CartItem) to use the active cart abstraction. This is a behavior-level change because guests will now have deletions reflected immediately in their visible cart and persistent guest storage.

## Impact

Affected code:
- src/components/shared/Navbar.tsx
- src/components/shared/CartItem.tsx
- src/components/shared/CartSheet.tsx
- src/components/shared/AddToCartButton.tsx
- src/app/(public)/cart/page.tsx
- src/hooks/useActiveCart.ts
- src/components/providers/SessionSync.tsx
- src/stores/cartStore.ts
- src/stores/guestCartStore.ts
- Any tests referencing cart stores directly

APIs/Dependencies:
- No external API changes. Behavior change for client-side state handling only.

Notes:
- This change is not a breaking API change for external clients but does change client-side behavior for guests.

