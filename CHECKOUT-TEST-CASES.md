# Clinikally Checkout Flow - Test Cases

## Document Information
- **Application**: Clinikally Mobile App (Android)
- **Module**: Checkout Flow
- **Version**: 1.0
- **Last Updated**: November 15, 2025
- **Test Environment**: Android Device (DQ899HON5HPFJFFY)

---

## Table of Contents
1. [Logged-in User Checkout Flow](#logged-in-user-checkout-flow)
2. [Guest User Checkout Flow (Buy Now)](#guest-user-checkout-flow-buy-now)
3. [Negative Test Cases](#negative-test-cases)
4. [Edge Cases](#edge-cases)
5. [Performance & Security Tests](#performance--security-tests)

---

## Test Case Conventions
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Type**: Functional, UI/UX, Integration, Negative, Performance
- **Status**: Pass / Fail / Blocked / Not Tested

---

# Logged-in User Checkout Flow

## TC-CHECKOUT-001: Add Single Product to Cart and Checkout
**Priority**: P0
**Type**: Functional
**Automation**: `appium-clinikally-checkout-logged.js`

### Preconditions
- User is logged into the app
- User has valid delivery address saved
- User has valid payment method available

### Test Steps
1. Open Clinikally app
2. Search for a product using search bar
3. Select product from search results
4. Verify product details page loads
5. Click "Add to Cart" button
6. Verify cart badge updates with item count
7. Click on cart icon
8. Verify product appears in cart with correct:
   - Product name
   - Quantity (default: 1)
   - Price
   - Product image
9. Verify cart total is calculated correctly
10. Click "Proceed to Checkout" button
11. Verify delivery address is displayed
12. Verify order summary displays:
    - Product details
    - Subtotal
    - Delivery charges
    - Tax/GST
    - Total amount
13. Select payment method (e.g., UPI, Card, COD)
14. Click "Pay Now" / "Place Order"
15. Complete payment (if applicable)
16. Verify order confirmation page

### Expected Results
- Product successfully added to cart
- Cart displays accurate product and pricing information
- Checkout process completes without errors
- Order confirmation displayed with order ID
- User receives order confirmation notification/email

### Automation Notes
- Automated in `appium-clinikally-checkout-logged.js`
- Requires configuration of product coordinates
- Payment completion disabled by default

---

## TC-CHECKOUT-002: Add Multiple Products to Cart
**Priority**: P1
**Type**: Functional

### Preconditions
- User is logged in
- Multiple products are available

### Test Steps
1. Search and add Product A to cart
2. Continue shopping
3. Search and add Product B to cart
4. Continue shopping
5. Search and add Product C to cart
6. Click cart icon
7. Verify all 3 products appear in cart
8. Verify cart total = Sum of all product prices
9. Proceed to checkout

### Expected Results
- All products appear in cart
- Cart total correctly sums all items
- Checkout displays all products in order summary

---

## TC-CHECKOUT-003: Update Product Quantity in Cart
**Priority**: P1
**Type**: Functional

### Test Steps
1. Add product to cart
2. Open cart
3. Increase quantity using "+" button
4. Verify quantity updates
5. Verify price updates (quantity × unit price)
6. Verify cart total updates
7. Decrease quantity using "-" button
8. Verify updates

### Expected Results
- Quantity increases/decreases correctly
- Price calculation updates in real-time
- Cart total updates automatically

---

## TC-CHECKOUT-004: Remove Product from Cart
**Priority**: P1
**Type**: Functional

### Test Steps
1. Add 2 products to cart
2. Open cart
3. Click remove/delete icon on Product A
4. Verify Product A is removed
5. Verify Product B remains
6. Verify cart total updates
7. Remove Product B
8. Verify cart shows "Empty Cart" message

### Expected Results
- Product removed successfully
- Cart total updates correctly
- Empty cart state displays appropriate message

---

## TC-CHECKOUT-005: Apply Coupon/Promo Code
**Priority**: P1
**Type**: Functional

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Locate "Apply Coupon" field
4. Enter valid coupon code
5. Click "Apply"
6. Verify discount is applied
7. Verify order total reduces by discount amount

### Expected Results
- Valid coupon applies successfully
- Discount amount shown separately
- Total recalculates correctly
- Coupon details displayed (e.g., "SAVE10 - 10% off")

---

## TC-CHECKOUT-006: Select Different Delivery Address
**Priority**: P1
**Type**: Functional

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Verify default address is selected
4. Click "Change Address"
5. Select different saved address
6. Click "Deliver Here"
7. Verify new address displays on checkout page
8. Verify delivery charges update (if applicable)

### Expected Results
- Address changes successfully
- Updated address reflects on checkout page
- Delivery charges adjust based on location

---

## TC-CHECKOUT-007: Add New Delivery Address During Checkout
**Priority**: P1
**Type**: Functional

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Click "Add New Address"
4. Fill address form:
   - Full Name
   - Phone Number
   - Address Line 1
   - Address Line 2
   - City
   - State
   - PIN Code
5. Click "Save Address"
6. Verify new address appears in address list
7. Select new address
8. Complete checkout

### Expected Results
- New address saves successfully
- Address appears in saved addresses
- Can be used for current order
- Address validation works (e.g., PIN code format)

---

## TC-CHECKOUT-008: Checkout with Cash on Delivery (COD)
**Priority**: P1
**Type**: Functional

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Select "Cash on Delivery" payment method
4. Verify COD charges displayed (if applicable)
5. Click "Place Order"
6. Verify order confirmation

### Expected Results
- COD option available and selectable
- COD charges (if any) added to total
- Order placed successfully without payment
- Order status shows "COD"

---

## TC-CHECKOUT-009: Checkout with UPI Payment
**Priority**: P0
**Type**: Integration

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Select "UPI" payment method
4. Enter UPI ID or scan QR code
5. Complete payment in UPI app
6. Return to Clinikally app
7. Verify payment status
8. Verify order confirmation

### Expected Results
- UPI payment gateway launches correctly
- Payment processes successfully
- Returns to app after payment
- Order status updates to "Paid"
- Order confirmation displayed

---

## TC-CHECKOUT-010: Checkout with Credit/Debit Card
**Priority**: P0
**Type**: Integration

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Select "Credit/Debit Card"
4. Enter card details:
   - Card Number
   - Expiry Date
   - CVV
   - Cardholder Name
5. Click "Pay Now"
6. Complete 3D Secure authentication (if required)
7. Verify payment success

### Expected Results
- Card payment form displays correctly
- Card validation works (e.g., Luhn algorithm)
- 3D Secure handled properly
- Payment processes successfully
- Order confirmed

---

# Guest User Checkout Flow (Buy Now)

## TC-BUYNOW-001: Guest User Buy Now - Complete Flow
**Priority**: P0
**Type**: Functional
**Automation**: `appium-clinikally-checkout-guest.js`

### Preconditions
- User is NOT logged in
- App is on product listing/details page

### Test Steps
1. Browse/search for product
2. Open product details page
3. Click "Buy Now" button
4. Verify login screen appears
5. Enter phone number
6. Click "Send OTP"
7. Enter OTP received
8. Verify OTP and login
9. Add/Select delivery address
10. Review order details:
    - Product name, quantity, price
    - Delivery address
    - Order total
11. Click "Continue to Payment"
12. Select payment method
13. Complete payment
14. Verify order confirmation

### Expected Results
- Buy Now bypasses cart and goes directly to checkout
- Login flow works seamlessly
- Guest can add address during checkout
- Payment completes successfully
- Order placed without adding to cart

### Automation Notes
- Automated in `appium-clinikally-checkout-guest.js`
- Uses shared login utility from `appium-clinikally-utils.js`
- Requires OTP configuration

---

## TC-BUYNOW-002: Buy Now with Existing User Login
**Priority**: P1
**Type**: Functional

### Test Steps
1. Logout if logged in
2. Click "Buy Now" on product
3. Enter registered phone number
4. Enter OTP
5. Verify user details pre-populate:
   - Name
   - Saved addresses
6. Select existing address
7. Complete checkout

### Expected Results
- Existing user data loads correctly
- Saved addresses available immediately
- Checkout faster for returning users

---

## TC-BUYNOW-003: Buy Now - Guest Adds New Address
**Priority**: P1
**Type**: Functional

### Test Steps
1. Click "Buy Now" on product
2. Complete login
3. User has no saved addresses
4. Click "Add Address"
5. Fill complete address form
6. Save address
7. Verify address selected for delivery
8. Complete checkout

### Expected Results
- Address form accessible during Buy Now flow
- Address saves to user account
- Can proceed with newly added address

---

# Negative Test Cases

## TC-NEG-001: Checkout with Empty Cart
**Priority**: P1
**Type**: Negative

### Test Steps
1. Ensure cart is empty
2. Try to access cart
3. Verify "Empty Cart" message displays
4. Verify "Proceed to Checkout" button is disabled or hidden

### Expected Results
- Cannot proceed to checkout with empty cart
- Appropriate message shown
- "Continue Shopping" CTA displayed

---

## TC-NEG-002: Apply Invalid Coupon Code
**Priority**: P1
**Type**: Negative

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Enter invalid/expired coupon code
4. Click "Apply"
5. Verify error message

### Expected Results
- Error message: "Invalid coupon code" or "Coupon expired"
- No discount applied
- Order total unchanged

---

## TC-NEG-003: Checkout Without Selecting Address
**Priority**: P0
**Type**: Negative

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Remove/deselect delivery address
4. Try to proceed to payment

### Expected Results
- Cannot proceed without address
- Error message: "Please select delivery address"
- Payment button disabled

---

## TC-NEG-004: Payment Failure Handling
**Priority**: P0
**Type**: Negative

### Test Steps
1. Proceed to checkout
2. Select UPI/Card payment
3. Enter invalid payment details OR cancel payment
4. Verify payment fails
5. Check order status

### Expected Results
- Payment failure message displayed
- Order not created or marked as "Failed"
- User can retry payment
- No duplicate order created

---

## TC-NEG-005: Network Failure During Checkout
**Priority**: P1
**Type**: Negative

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Disconnect network during checkout
4. Try to proceed

### Expected Results
- Error message: "No internet connection"
- Data persists in cart
- Can retry when network restored

---

## TC-NEG-006: Add Out-of-Stock Product to Cart
**Priority**: P1
**Type**: Negative

### Test Steps
1. Find product that's out of stock
2. Try to click "Add to Cart"
3. Verify behavior

### Expected Results
- "Add to Cart" button disabled or shows "Out of Stock"
- Cannot add to cart
- Notification option available (e.g., "Notify when available")

---

## TC-NEG-007: Exceed Maximum Quantity Allowed
**Priority**: P2
**Type**: Negative

### Test Steps
1. Add product to cart
2. Try to increase quantity beyond maximum allowed
3. Verify validation

### Expected Results
- Error message: "Maximum quantity: X"
- Quantity doesn't exceed limit
- "+" button disabled at maximum

---

## TC-NEG-008: Session Timeout During Checkout
**Priority**: P1
**Type**: Negative

### Test Steps
1. Add product to cart
2. Proceed to checkout
3. Wait for session timeout (or force logout)
4. Try to complete payment

### Expected Results
- Redirects to login page
- Cart persists after re-login
- Can complete checkout after login

---

# Edge Cases

## TC-EDGE-001: Checkout During Price Change
**Priority**: P2
**Type**: Edge Case

### Test Steps
1. Add product to cart with Price A
2. Admin changes product price to Price B
3. Proceed to checkout
4. Verify which price is charged

### Expected Results
- Price at time of adding to cart should apply OR
- Updated price with notification to user
- No silent price change

---

## TC-EDGE-002: Concurrent Checkout - Low Stock
**Priority**: P2
**Type**: Edge Case

### Test Steps
1. Product has 1 item in stock
2. User A adds to cart
3. User B adds to cart
4. User A completes checkout
5. User B tries to complete checkout

### Expected Results
- User B gets "Out of stock" error
- Cannot complete checkout
- Cart updates automatically

---

## TC-EDGE-003: Checkout with Special Characters in Address
**Priority**: P2
**Type**: Edge Case

### Test Steps
1. Add address with special characters:
   - Address: "Flat #123, O'Brien Street"
   - City: "Coimbatore"
2. Proceed to checkout

### Expected Results
- Special characters handled correctly
- No validation errors
- Address displays properly

---

## TC-EDGE-004: Multiple Coupon Application
**Priority**: P2
**Type**: Edge Case

### Test Steps
1. Apply valid Coupon A
2. Try to apply Coupon B

### Expected Results
- If allowed: Both discounts apply
- If not allowed: Error message "Cannot use multiple coupons"
- Previous coupon removed if selecting new one

---

## TC-EDGE-005: Checkout with Minimum Order Value
**Priority**: P1
**Type**: Edge Case

### Test Steps
1. Add product with price below minimum order value
2. Try to proceed to checkout

### Expected Results
- Error: "Minimum order value: ₹X"
- Cannot proceed
- Suggestion to add more items

---

## TC-EDGE-006: Free Delivery Threshold
**Priority**: P1
**Type**: Edge Case

### Test Steps
1. Add items worth ₹(Free Delivery - 10)
2. Verify delivery charges apply
3. Add more items to cross free delivery threshold
4. Verify delivery charges removed

### Expected Results
- Delivery charges calculated correctly
- Free delivery applies when threshold met
- Clear indication of threshold (e.g., "Add ₹50 for free delivery")

---

## TC-EDGE-007: COD Availability by PIN Code
**Priority**: P1
**Type**: Edge Case

### Test Steps
1. Add product to cart
2. Select address in non-COD serviceable area
3. Proceed to checkout
4. Verify COD option

### Expected Results
- COD disabled for non-serviceable areas
- Message: "COD not available for this location"
- Other payment methods available

---

## TC-EDGE-008: App Killed During Payment
**Priority**: P1
**Type**: Edge Case

### Test Steps
1. Proceed to payment
2. Initiate payment
3. Kill app during payment process
4. Reopen app
5. Check order status

### Expected Results
- Order status checked with payment gateway
- If paid: Order confirmed
- If pending: User can retry
- No duplicate payment

---

# Performance & Security Tests

## TC-PERF-001: Checkout Page Load Time
**Priority**: P1
**Type**: Performance

### Test Steps
1. Add product to cart
2. Measure time to load checkout page

### Expected Results
- Checkout page loads within 2-3 seconds
- All elements render properly
- No UI blocking

---

## TC-PERF-002: High Cart Volume Performance
**Priority**: P2
**Type**: Performance

### Test Steps
1. Add 50+ items to cart
2. Open cart
3. Proceed to checkout
4. Measure performance

### Expected Results
- Cart handles large number of items
- No lag or crashes
- Smooth scrolling

---

## TC-SEC-001: Payment Data Security
**Priority**: P0
**Type**: Security

### Test Steps
1. Enter payment details
2. Inspect network traffic
3. Verify encryption

### Expected Results
- Payment data transmitted over HTTPS
- Card details encrypted
- No sensitive data in logs
- PCI DSS compliance

---

## TC-SEC-002: Session Security
**Priority**: P1
**Type**: Security

### Test Steps
1. Login and add items to cart
2. Clear app cache/cookies
3. Reopen app
4. Check session

### Expected Results
- Session invalidated properly
- User redirected to login
- Cart data cleared or re-fetched securely

---

## TC-UI-001: Responsive UI - Different Screen Sizes
**Priority**: P2
**Type**: UI/UX

### Test Steps
1. Test checkout on different devices:
   - Small screen (5")
   - Medium screen (6")
   - Large screen (6.5"+)

### Expected Results
- UI elements scale properly
- All buttons accessible
- Text readable
- Images display correctly

---

## TC-UI-002: Accessibility - Screen Reader
**Priority**: P2
**Type**: Accessibility

### Test Steps
1. Enable TalkBack (Android)
2. Navigate checkout flow
3. Verify screen reader announcements

### Expected Results
- All elements have proper labels
- Navigation flow is logical
- Important actions announced
- Form fields clearly labeled

---

## Test Execution Summary Template

| Test Case ID | Title | Priority | Status | Executed By | Date | Notes |
|-------------|-------|----------|--------|-------------|------|-------|
| TC-CHECKOUT-001 | Add Single Product | P0 | Pass | - | - | - |
| TC-CHECKOUT-002 | Multiple Products | P1 | - | - | - | - |
| TC-BUYNOW-001 | Guest Buy Now | P0 | - | - | - | - |
| TC-NEG-001 | Empty Cart | P1 | - | - | - | - |

---

## Automation Coverage

### Automated Tests
- TC-CHECKOUT-001: Logged-in user checkout (`appium-clinikally-checkout-logged.js`)
- TC-BUYNOW-001: Guest user buy now (`appium-clinikally-checkout-guest.js`)

### Pending Automation
- Payment integration tests
- Coupon application tests
- Address management tests
- Multiple product scenarios

### Manual Tests Only
- UI/UX validation
- Visual regression
- Accessibility testing
- Exploratory testing

---

## Test Data Requirements

### Test Users
- Logged-in user with saved addresses
- Logged-in user without addresses
- New user (for guest checkout)

### Test Products
- In-stock product
- Low-stock product (1-2 items)
- Out-of-stock product
- Products with different price ranges
- Products eligible for free delivery

### Test Coupons
- Valid percentage discount (e.g., SAVE10)
- Valid flat discount (e.g., FLAT50)
- Expired coupon
- Minimum order value coupon
- First-order discount

### Test Addresses
- Address in serviceable area
- Address in non-COD area
- Address in different states (for tax calculation)

---

## Defect Tracking Template

| Defect ID | Test Case | Severity | Description | Steps to Reproduce | Status |
|-----------|-----------|----------|-------------|-------------------|---------|
| - | - | - | - | - | - |

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | - | - | - |
| Developer | - | - | - |
| Product Owner | - | - | - |
