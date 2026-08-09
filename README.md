# Lekayo

## Cart Store Guidance

Prefer `useActiveCart` in UI components and pages that need the current shopping cart. `useActiveCart` automatically routes cart behavior through the guest cart store for unauthenticated customers and the authenticated cart store for logged-in users, while keeping local state synchronized with the server.
