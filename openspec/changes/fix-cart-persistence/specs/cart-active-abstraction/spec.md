## Purpose

Provide a single, observable contract for cart behavior that applies to both guest and authenticated users. The system shall present and mutate an "active cart" which resolves to either the guest cart store or authenticated cart store depending on the user's session state.

## ADDED Requirements

### Requirement: Active cart abstraction
The system SHALL expose an active cart interface that components use to read and mutate cart items. The active cart SHALL behave identically for callers regardless of whether the user is authenticated or not.

#### Scenario: Guest adds item
- **WHEN** an unauthenticated user adds an item using the active cart interface
- **THEN** the item appears in the active cart items list
- **THEN** the item is persisted to guest-local storage so it remains after a page refresh

#### Scenario: Guest removes item
- **WHEN** an unauthenticated user removes an item using the active cart interface
- **THEN** the item is removed from the active cart items list
- **THEN** the item is removed from guest-local persisted storage so it does not reappear after refresh

#### Scenario: Authenticated adds item
- **WHEN** an authenticated user adds an item using the active cart interface
- **THEN** the item is added to the server-side cart and appears in the active cart items list after a sync

#### Scenario: Merge after sign-in
- **WHEN** a user signs in and the guest cart has items
- **THEN** the system SHALL POST guest items to /api/cart/merge
- **THEN** after a successful merge, guest persisted storage SHALL be cleared and the active cart SHALL reflect the merged server cart

## ADDED Requirements

### Requirement: API sync behavior
Components using the active cart SHALL not call server endpoints directly for reads/writes; instead, the active cart implementation SHALL provide server sync helpers (e.g., syncWithServer) to keep behavior consistent.

#### Scenario: Component shows cart
- **WHEN** a component renders and uses the active cart items
- **THEN** the component sees the latest items from either guest storage or server-synced auth store depending on session status

