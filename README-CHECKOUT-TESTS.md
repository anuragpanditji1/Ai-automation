# Clinikally Checkout Test Scripts

## Overview

Two checkout test scripts have been created with framework and error handling in place:

1. **appium-clinikally-checkout-logged.js** - Checkout flow for logged-in users
2. **appium-clinikally-checkout-guest.js** - Buy now checkout flow for guest users
3. **appium-clinikally-utils.js** - Shared utilities (login, screenshots, etc.)

## Shared Utilities

The test scripts use **shared login functionality** from `appium-clinikally-utils.js`:

- **`performLogin()`** - Complete login flow (phone + OTP)
- **`ensureLoggedIn()`** - Checks if logged in, performs login if needed
- **`isUserLoggedIn()`** - Checks login status
- **`takeScreenshot()`** - Helper for screenshots

### Benefits:
✅ **No code duplication** - Login logic is reused
✅ **Consistency** - Same login flow across all tests
✅ **Easy maintenance** - Update login in one place
✅ **Auto-login** - Checkout tests automatically login if needed

## Test Flow

### 1. Logged User Checkout (`appium-clinikally-checkout-logged.js`)

**Flow:** Ensure logged in → Verify page → Add to cart → View cart → Checkout → Payment

**Steps:**
1. **Auto-login if needed** (calls `ensureLoggedIn()` from shared utils)
2. **Verify current page** (checks we're on home screen, counts elements)
3. Search and select product
4. Add product to cart
5. View cart
6. Proceed to checkout
7. Select payment method
8. (Optional) Complete payment

### 2. Guest User Checkout (`appium-clinikally-checkout-guest.js`)

**Flow:** Buy now → Login → Address selection → Review page → Payment page → Success page

**Steps:**
1. Search and select product
2. Click "Buy Now" button
3. **Login with phone + OTP** (calls `performLogin()` from shared utils)
4. Select delivery address
5. Review order details
6. Proceed to payment page
7. (Optional) Complete payment

## Configuration Needed (TODO)

Both test scripts are **setup/framework ready** but need the following configuration:

### Product Selection
- [ ] **Product name** to search for
- [ ] **Product selection coordinates** after search
- [ ] **Buy Now / Add to Cart button coordinates**

### Checkout Elements
- [ ] **Cart icon/button coordinates** (logged user)
- [ ] **Checkout button coordinates**
- [ ] **Continue/Proceed button coordinates**

### Address (Guest User)
- [ ] Test delivery address details
- [ ] Address selection coordinates
- [ ] Add new address flow (if needed)

### Payment
- [ ] Payment method selection coordinates
- [ ] Decide whether to complete payment in test (currently disabled)

### Validation Points
- [ ] Verify product appears in cart
- [ ] Verify cart total calculation
- [ ] Verify address on review page
- [ ] Verify order summary

## Usage

### Run Full Checkout Tests

```bash
# Logged user - full checkout
node appium-clinikally-checkout-logged.js

# Guest user - full buy now checkout
node appium-clinikally-checkout-guest.js
```

### Run Specific Test Sections

**Logged User:**
```bash
# Only verify page
node appium-clinikally-checkout-logged.js verify

# Only add to cart
node appium-clinikally-checkout-logged.js add

# Only view cart
node appium-clinikally-checkout-logged.js view

# Only checkout
node appium-clinikally-checkout-logged.js checkout

# Only payment
node appium-clinikally-checkout-logged.js payment
```

**Guest User:**
```bash
# Only buy now
node appium-clinikally-checkout-guest.js buy

# Only login
node appium-clinikally-checkout-guest.js login

# Only address selection
node appium-clinikally-checkout-guest.js address

# Only review page
node appium-clinikally-checkout-guest.js review

# Only payment
node appium-clinikally-checkout-guest.js payment
```

## Features Included

✅ **Test Case Reporting**
- PASS/FAIL/WARN status for each test
- Blocker detection - stops execution if critical failure
- Detailed error messages

✅ **Screenshot Capture**
- Screenshots at each major step
- Saved to `/tmp/` directory
- Helps with debugging failures

✅ **Modular Execution**
- Run full flow or specific sections
- Useful for debugging specific steps

✅ **Safety Features**
- Payment completion disabled by default
- Prevents accidental purchases during testing
- Can be enabled by setting `completePayment: true`

## Test Summary Report

Both scripts provide execution summary:

```
============================================================
📊 TEST EXECUTION SUMMARY
============================================================
✅ Passed: 2
❌ Failed: 0
⚠️  Warnings: 5
============================================================

✅ PASSED TEST CASES:
   - Verify Logged In
   - Search Product

⚠️  WARNINGS:
   - Select Product: Product selection needs configuration
   - Add to Cart: Add to cart needs configuration
   - View Cart: View cart needs configuration
   - Proceed to Checkout: Checkout button needs configuration
   - Select Payment Method: Payment method selection needs configuration

============================================================
```

## Next Steps

1. **Gather coordinates** - Use `appium-clinikally-test.js` to find UI elements
2. **Update TEST_CONFIG** - Fill in product names, coordinates, addresses
3. **Test individual sections** - Run each step separately to verify
4. **Add validations** - Verify cart items, totals, addresses
5. **Run full flow** - Test complete checkout end-to-end

## Prerequisites

- Appium server running: `appium`
- Device connected: `DQ899HON5HPFJFFY`
- Clinikally app installed: `com.clinikally.app`
- For logged user test: User must be logged in first

## Configuration File Locations

Update these sections in the test files:

**appium-clinikally-checkout-logged.js**
```javascript
const TEST_CONFIG = {
  productSearchTerm: 'YOUR_PRODUCT_NAME_HERE',
  // ... update coordinates and settings
};
```

**appium-clinikally-checkout-guest.js**
```javascript
const TEST_CONFIG = {
  productSearchTerm: 'YOUR_PRODUCT_NAME_HERE',
  phoneNumber: '9818106744',
  otp: '123456',
  address: {
    // ... update address details
  },
  // ... update coordinates
};
```

## Safety Notes

⚠️  **IMPORTANT:**
- Payment completion is **DISABLED** by default
- Review all coordinates before running
- Test on staging/test environment if possible
- Use test payment methods when enabled

---

**Created:** November 14, 2025
**Status:** Framework Ready - Needs Configuration
