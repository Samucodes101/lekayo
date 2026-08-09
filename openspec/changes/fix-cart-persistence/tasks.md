## 1. Audit & Prep

- [x] 1.1 Search for all usages of `useCartStore` and `useGuestCartStore` and list files to update
- [x] 1.2 Add a brief note in the repo (README or CONTRIBUTING) recommending `useActiveCart` for components

## 2. Component Updates

- [x] 2.1 Update src/components/shared/CartItem.tsx to use `useActiveCart` instead of `useCartStore`
- [x] 2.2 Update src/components/shared/Navbar.tsx to use `useActiveCart` for cart counts and mutations
- [x] 2.3 Update src/components/shared/CartSheet.tsx to use `useActiveCart`
- [x] 2.4 Update src/components/shared/AddToCartButton.tsx to use `useActiveCart` addItem
- [x] 2.5 Update src/app/(public)/cart/page.tsx to use `useActiveCart`

## 3. Session & Sync

- [x] 3.1 Review SessionSync merge flow to ensure guest store is cleared after successful merge and that syncWithServer runs afterwards
- [ ] 3.2 Add a test or manual verification steps to confirm merge and clear ordering

## 4. Testing & Verification

- [ ] 4.1 Manual test: As guest, add item -> open cart -> remove item -> refresh -> confirm item is gone
- [ ] 4.2 Manual test: Add as guest -> sign in -> confirm merge endpoint called, guest storage cleared, and items reflect server cart
- [ ] 4.3 Run unit tests and lint

## 5. Optional Improvements

- [ ] 5.1 Add ESLint rule or codemod to prefer `useActiveCart` over direct store imports
- [ ] 5.2 Add unit tests for `useActiveCart` behavior

