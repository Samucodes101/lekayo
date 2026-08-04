## Context

Currently the codebase maintains two separate Zustand stores for cart state: `useCartStore` for authenticated users (server-synced) and `useGuestCartStore` for unauthenticated users (persisted locally). The hook `useActiveCart` provides a thin selector that switches between these stores based on `useSession` status. However, several components (Navbar, CartItem) directly import and use `useCartStore`, causing mutations like removeItem to affect only the auth store. When guests add or remove items, those operations sometimes target the wrong store, leaving guest-persisted items unchanged and causing them to reappear after a refresh.

See proposal.md for motivation and specs/cart-active-abstraction/spec.md for expected behavior.

## Goals / Non-Goals

**Goals:**
- Ensure UI components use a single active cart abstraction for reads and writes.
- Guarantee guest deletions persist to guest storage and are reflected immediately.
- Ensure session sign-in merge clears guest storage when merge succeeds.

**Non-Goals:**
- Changing server API endpoints or server-side cart model.
- Introducing a new server-side persistence mechanism for guests.

## Decisions

1. Standardize on `useActiveCart` as the only client-facing cart API for components.
   - Rationale: Centralizes the guest/auth branching in one place and reduces risk of inconsistent store usage.
   - Alternative considered: Keep components as-is and audit usages; rejected because it's error-prone and brittle.

2. Update components that currently import `useCartStore` directly (Navbar, CartItem, CartSheet, possibly others) to use `useActiveCart` instead. For components that need store mutation methods, prefer passing actions from parent rather than calling the hook locally to simplify unit testing.
   - Rationale: This reduces the surface area of changes and makes components more testable.

3. Ensure SessionSync clears guest store persisted data (useGuestCartStore.clear) after a successful merge response from /api/cart/merge. Keep server sync in `useCartStore.syncWithServer` as-is.
   - Rationale: Current code clears guest store after merge already; verify ordering and ensure persisted storage is removed.

## Risks / Trade-offs

- Risk: Missing a component that still references `useCartStore` directly. Mitigation: Run a grep for `useCartStore` usages and update them; add a lint rule or code comment to prefer `useActiveCart` in future.
- Risk: Session race where merge runs while other components still hold references. Mitigation: Use mergedRef in SessionSync to block duplicate merges; ensure sync order is clear (merge -> clear guest -> syncWithServer).

## Migration Plan

1. Update UI components to use `useActiveCart`.
2. Run integration tests and manual verification for guest add/remove and sign-in merge flows.
3. Deploy behind a feature flag if desired; not necessary for this change.

## Open Questions

- Should we add a lint rule or codemod to enforce `useActiveCart` usage? (Recommended)

