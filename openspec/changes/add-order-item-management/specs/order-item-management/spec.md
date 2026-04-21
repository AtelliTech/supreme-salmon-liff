## ADDED Requirements

### Requirement: User can add products from order page modal
The system SHALL provide an Add action in the order item section and open a product selection modal on the same page. The modal SHALL list all selectable products and allow the user to add a product to the current order by tapping an item.

#### Scenario: Open product selection modal
- **WHEN** the user taps the Add action in the order item section
- **THEN** the system opens a product selection modal without navigating away from the order page

#### Scenario: Add product from modal list
- **WHEN** the product selection modal is open and the user taps a product item
- **THEN** the system adds that product to the order item list and updates the item count display

### Requirement: User can modify order item quantity with stepper component
The system SHALL provide quantity controls for each editable order item using the existing component interaction pattern: minus button, numeric input, and plus button. Quantity updates SHALL be reflected immediately in the order item list state.

#### Scenario: Increase quantity by plus button
- **WHEN** the user taps the plus button for an order item
- **THEN** the system increments that item's quantity by 1 and updates the displayed quantity immediately

#### Scenario: Decrease quantity by minus button
- **WHEN** the user taps the minus button for an order item with quantity greater than 0
- **THEN** the system decrements that item's quantity by 1 and updates the displayed quantity immediately

#### Scenario: Normalize manual quantity input
- **WHEN** the user enters a non-integer or negative value in the quantity input
- **THEN** the system normalizes the value to a valid non-negative integer and reflects the normalized value in the UI

### Requirement: User can remove products from order item list
The system SHALL provide a remove action for each order item and remove the selected item from the order list after user confirmation or equivalent mis-tap protection.

#### Scenario: Remove an item from order list
- **WHEN** the user triggers remove on an order item and confirms the action
- **THEN** the system removes that item from the order list and updates item count display immediately

#### Scenario: Keep item when removal is canceled
- **WHEN** the user triggers remove on an order item and cancels the action
- **THEN** the system keeps the item unchanged in the order list
