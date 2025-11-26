# Clinikally Mobile App Test Automation

Complete test automation suite for Clinikally mobile app (Android) using Appium and WebDriverIO.

## 📑 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Login Tests](#login-tests)
- [Checkout Tests](#checkout-tests)
- [Test Reports](#test-reports)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This repository contains comprehensive test automation for:
- **Login Flow** - 8 test cases covering positive and negative scenarios
- **Checkout Flow** - Complete e-commerce checkout for logged-in users

**Key Features:**
- ✅ Smart test execution order to prevent cascading failures
- ✅ API response validation to detect backend issues
- ✅ Screenshot capture at each step
- ✅ JSON test reports with detailed results
- ✅ Reusable utility functions
- ✅ Multiple fallback strategies for element location

---

## 🛠️ Prerequisites

### 1. Install Dependencies
```bash
# Install Node.js (if not installed)
brew install node

# Install Appium
npm install -g appium

# Install project dependencies
npm install
```

### 2. Setup Android Device
```bash
# Connect Android device via USB
adb devices

# Verify device connection
# Device ID should be: DQ899HON5HPFJFFY (or update in config)
```

### 3. Start Appium Server
```bash
appium
# Server runs on http://localhost:4723
```

---

## 🚀 Quick Start

### Run Login Tests
```bash
# Run all login tests (recommended order: negative → positive)
node appium-clinikally-login-comprehensive.js

# Run specific test
node appium-clinikally-login-comprehensive.js 2           # Invalid OTP
node appium-clinikally-login-comprehensive.js invalid-otp  # By name
```

### Run Checkout Tests
```bash
# Run complete checkout flow
node appium-clinikally-checkout-logged.js
```

---

## 🔐 Login Tests

### Test Suite: `appium-clinikally-login-comprehensive.js`

Comprehensive login flow testing with 8 test cases covering all scenarios.

### 📋 Test Cases

| Test # | Test Case | Description | Expected Result |
|--------|-----------|-------------|-----------------|
| **TC5** | Empty Mobile Number | Leave phone field empty, click Request OTP | Validation error or disabled button |
| **TC6** | Invalid Mobile Format | Test: `123`, `98181067`, `12345678901`, `abcdefghij` | Format validation error |
| **TC4** | Valid Mobile + Empty OTP | Enter phone, request OTP, leave OTP empty | OTP required error |
| **TC2** | Valid Mobile + Invalid OTP | Enter phone, request OTP, enter `000000` | Invalid OTP error |
| **TC3** | Valid Mobile + Expired OTP | Enter phone, request OTP, wait 60s, verify | Expired OTP error |
| **TC8** | Max Retry Attempts | Try wrong OTP 5 times | Account locked error |
| **TC7** | Resend OTP | Request OTP, wait 30s, click Resend | OTP resent successfully |
| **TC1** | Valid Mobile + Valid OTP | Enter `9818106744`, OTP `123456` | ✅ Successful login |

### 🧠 Smart Test Execution

**Tests run in intelligent order:**

```
🔴 NEGATIVE TESTS (Run First - Independent)
├── TC5: Empty Mobile Number
├── TC6: Invalid Mobile Format
├── TC4: Valid Mobile + Empty OTP
├── TC2: Valid Mobile + Invalid OTP
├── TC3: Valid Mobile + Expired OTP (60s wait)
├── TC8: Max Retry Attempts (5 attempts)
└── TC7: Resend OTP (30s wait)

🟢 POSITIVE TEST (Run Last - Sanity Check)
└── TC1: Valid Mobile + Valid OTP ✅
```

**Why this order?**
- ✅ Negative tests run independently without login state issues
- ✅ Reduces cascading failures from successful login
- ✅ Valid case at end = environment sanity check
- ✅ **If only TC1 fails** → Backend/Environment issue
- ✅ **If TC1 passes but others fail** → Test isolation issue

### 📸 Login Test Screenshots

All screenshots saved to: `/tmp/clinikally-tests/`

**Naming convention:**
```
tc1-phone-entered.png         # Test Case 1 - Phone entered
tc2-invalid-otp-entered.png   # Test Case 2 - Invalid OTP entered
tc3-expired-otp-entered.png   # Test Case 3 - Expired OTP
tc4-after-verify-empty.png    # Test Case 4 - Empty OTP verification
tc5-after-request-empty.png   # Test Case 5 - Empty phone request
tc6-invalid-123.png           # Test Case 6 - Invalid phone format
tc7-after-resend.png          # Test Case 7 - After resend OTP
tc8-attempt-1-result.png      # Test Case 8 - Retry attempt 1
```

### 🎯 Run Individual Login Tests

```bash
# By test number
node appium-clinikally-login-comprehensive.js 1     # Valid scenario
node appium-clinikally-login-comprehensive.js 2     # Invalid OTP
node appium-clinikally-login-comprehensive.js 5     # Empty phone

# By test name (easier to remember)
node appium-clinikally-login-comprehensive.js valid
node appium-clinikally-login-comprehensive.js invalid-otp
node appium-clinikally-login-comprehensive.js expired-otp
node appium-clinikally-login-comprehensive.js empty-otp
node appium-clinikally-login-comprehensive.js empty-phone
node appium-clinikally-login-comprehensive.js invalid-phone
node appium-clinikally-login-comprehensive.js resend
node appium-clinikally-login-comprehensive.js max-retry
```

---

## 🛒 Checkout Tests

### Test Suite: `appium-clinikally-checkout-logged.js`

Complete e-commerce checkout flow for logged-in users with API validation.

### 📋 Checkout Test Flow

```
1. ✅ Verify Login Status
2. ✅ Search Product (uriage 150ml)
3. ✅ Select Product from PLP
4. ✅ Add to Cart (with API validation)
5. ✅ Keep Browsing
6. ✅ Open Cart
7. ✅ View All Coupons (with API validation)
8. ✅ Apply Coupon - SUMMER12 (12% off) (with API validation)
9. ✅ Dismiss Success Popup
10. ✅ Scroll to Bill Summary
11. ✅ Change Delivery Address (with API validation)
12. ✅ Select Address from Saved Addresses
13. ✅ Verify Address on Cart
14. ✅ Checkout (with API validation)
15. ✅ Verify Checkout Page Details
```

### 🔍 API Response Validation

The checkout test validates backend API responses at critical steps:

**Validated APIs:**
- **Add to Cart API** - Detects if item actually added to cart
- **View Coupons API** - Verifies coupons loaded successfully
- **Apply Coupon API** - Confirms discount applied
- **Select Address API** - Validates address selection
- **Checkout API** - Confirms checkout initiated

**Error Detection:**
```javascript
// Success indicators checked:
- "View Cart", "Added to cart", "Item added"
- "YOU saved", "Discount applied"
- "Bill Summary", "Order Summary"
- "Confirm and Pay", "Place Order"

// Error indicators detected:
- "error", "Error", "failed", "Failed"
- "Something went wrong", "Try again"
- "Network error", "Unable to add"
- "Invalid coupon", "Coupon expired"
```

**BLOCKER Handling:**
- If critical APIs fail (Add to Cart, Address Selection, Checkout)
- Test marked as BLOCKER
- Subsequent tests skipped automatically
- Session kept open for 30s for manual inspection

### 📸 Checkout Test Screenshots

All screenshots saved to: `/tmp/`

**Screenshots captured:**
```
clinikally-checkout-logged-in.png           # Initial login state
clinikally-checkout-product-page.png        # Product detail page
clinikally-checkout-cart-button-clicked.png # After add to cart
clinikally-checkout-api-error.png           # If API fails
clinikally-checkout-keep-browsing.png       # After keep browsing
clinikally-checkout-coupons-page.png        # Coupons list
clinikally-checkout-coupon-applied.png      # After applying coupon
clinikally-checkout-address-list.png        # Saved addresses
clinikally-checkout-address-selected.png    # Selected address
clinikally-checkout-page.png                # Checkout page
```

### 🎯 Test Case Reporting

The checkout test uses a built-in reporting system:

```javascript
reportTestCase(name, status, message, isBlocker)

// Status types:
- PASS ✅ - Test passed successfully
- FAIL ❌ - Test failed
- WARN ⚠️  - Warning (non-critical)

// Blocker flag:
- true  - Critical failure, stops execution
- false - Non-critical, continues testing
```

**Example Output:**
```
✅ TC01: Verify Login [PASS]
✅ TC02: Search Product [PASS]
✅ TC03: Add to Cart [PASS] - Cart has 1 item(s)
❌ TC04: Apply Coupon [FAIL] - Coupon apply API failed - BLOCKER
⚠️  TC05: Checkout [FAIL] - SKIPPED - Blocked by Apply Coupon failure

SUMMARY:
Total: 5 | Passed: 3 | Failed: 2 | Blocker: 1
```

---

## 📊 Test Reports

### Login Test Report

Location: `/tmp/clinikally-tests/test-report.json`

**Report Structure:**
```json
{
  "timestamp": "2025-11-26T15:00:00.000Z",
  "device": "DQ899HON5HPFJFFY",
  "summary": {
    "total": 8,
    "passed": 7,
    "failed": 1,
    "warning": 0
  },
  "results": [
    {
      "test": "TC1",
      "result": {
        "status": "PASSED",
        "note": "Login successful with valid credentials"
      }
    }
  ]
}
```

### Checkout Test Report

**Console Output:**
- Real-time test execution logs
- Pass/Fail status for each step
- API validation results
- Error messages and debugging info
- Final summary report

**Screenshots:**
- Automatic screenshot capture at each step
- Error screenshots when API fails
- Success confirmation screenshots

---

## ⚙️ Configuration

### Login Test Configuration

Edit `appium-clinikally-login-comprehensive.js`:

```javascript
const TEST_CONFIG = {
  appiumUrl: 'http://localhost:4723',
  capabilities: {
    platformName: 'Android',
    'appium:deviceName': 'DQ899HON5HPFJFFY',  // Update your device ID
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.clinikally.app',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300
  },
  validPhone: '9818106744',        // Update test phone number
  validOTP: '123456',              // Update valid OTP
  invalidOTP: '000000',            // Update invalid OTP
  invalidPhones: ['123', '98181067', '12345678901', 'abcdefghij'],
  screenshots: '/tmp/clinikally-tests'
};
```

### Checkout Test Configuration

Edit `appium-clinikally-checkout-logged.js` (lines 1-30):

```javascript
const capabilities = {
  platformName: 'Android',
  'appium:deviceName': 'DQ899HON5HPFJFFY',  // Update device ID
  'appium:automationName': 'UiAutomator2',
  'appium:appPackage': 'com.clinikally.app',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': true,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 300
};
```

**Update search keywords:**
```javascript
// Line ~150
await searchInput.setValue('uriage 150ml');  // Change product
```

**Update coupon code:**
```javascript
// Line ~500
await couponInput.setValue('SUMMER12');  // Change coupon
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Appium Connection Error
```
Error: ECONNREFUSED
```
**Solution:**
```bash
# Start Appium server
appium
```

#### 2. Device Not Found
```
Error: No device found
```
**Solution:**
```bash
# Check device connection
adb devices

# If device not listed, reconnect USB
# Update device ID in test config
```

#### 3. Element Not Found
```
Error: Element not found
```
**Solution:**
- Check screenshot to see current app state
- UI might have changed, update element selectors
- Wait time might be too short, increase `driver.pause()` values

#### 4. App Not Installed
```
Error: Activity not found
```
**Solution:**
```bash
# Install Clinikally app
adb install clinikally.apk

# Or verify app package name
adb shell pm list packages | grep clinikally
```

#### 5. Test Timing Issues
**Solution:**
- Increase pause durations in test code
- Check network speed (OTP delivery delay)
- Adjust OTP expiration wait time (TC3)

### Debug Mode

**Enable verbose logging:**
```javascript
// In test file, change logLevel
logLevel: 'info'  // Change to 'debug' or 'trace'
```

**Manual inspection:**
- Tests pause for 10-30 seconds at critical failures
- Use this time to inspect app state manually
- Check screenshots in `/tmp/` directory

### Getting Help

**When reporting issues, provide:**
1. Test name and number (e.g., TC2 - Invalid OTP)
2. Error message from console
3. Screenshots from `/tmp/` directory
4. Test report JSON (for login tests)
5. Device ID and Android version

---

## 📁 Project Structure

```
test-case/
├── appium-clinikally-login-comprehensive.js  # Login test suite (779 lines)
├── appium-clinikally-checkout-logged.js      # Checkout test (1200+ lines)
├── appium-clinikally-login-final.js          # Original login test
├── appium-clinikally-login.js                # Alternative login test
├── appium-clinikally-checkout-guest.js       # Guest checkout (not maintained)
├── appium-clinikally-test.js                 # Basic test
├── appium-clinikally-utils.js                # Shared utilities
├── package.json                              # Dependencies
├── package-lock.json                         # Locked dependencies
└── README.md                                 # This file
```

---

## 🔑 Test Credentials

**Login Tests:**
- Phone: `9818106744`
- Valid OTP: `123456`
- Invalid OTP: `000000`

**Checkout Tests:**
- Requires pre-logged-in user session
- Product: "uriage 150ml"
- Coupon: "SUMMER12" (12% off)
- Uses saved delivery addresses

---

## 📈 Test Execution Tips

### Best Practices

1. **Always run Appium first**
   ```bash
   appium
   ```

2. **Run tests in order for login suite**
   - Negative tests first prevents login state issues
   - Valid test last confirms environment health

3. **Check screenshots after failures**
   - Screenshots show exact app state
   - Helps identify if issue is test or app

4. **Review test reports**
   - JSON report has detailed results
   - Console logs show real-time progress

5. **Use individual test execution for debugging**
   ```bash
   node appium-clinikally-login-comprehensive.js 2
   ```

6. **Clean app data between major test runs**
   ```bash
   adb shell pm clear com.clinikally.app
   ```

### Performance Tips

- Login tests take ~15-20 minutes (includes TC3 60s wait, TC7 30s wait)
- Checkout test takes ~3-5 minutes
- Reduce wait times for faster execution (may affect reliability)
- Run individual tests during development

---

## 📞 Support

For issues or questions:
- Check screenshots in `/tmp/` and `/tmp/clinikally-tests/`
- Review test report JSON for details
- Update device ID if using different device
- Ensure Appium server is running
- Verify app is installed and accessible

---

## 🤖 Generated with Claude Code

This test suite was created with assistance from [Claude Code](https://claude.com/claude-code).

**Contributors:**
- Anurag Mishra <anurag676mishra@gmail.com>
- Claude <noreply@anthropic.com>

---

**Last Updated:** November 26, 2025
**Version:** 2.0
**License:** MIT
