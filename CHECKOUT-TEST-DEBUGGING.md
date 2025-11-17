# Checkout Test Debugging Guide

## Current Issue Identified

### Error: ANDROID_HOME / ANDROID_SDK_ROOT Not Set

**Status**: BLOCKER - Prevents all tests from running

**Error Message**:
```
WebDriverError: Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported.
```

**Root Cause**:
Appium requires Android SDK environment variables to be set, but they are missing from your shell environment.

---

## Quick Fix - Run This First

### Option 1: Run with Environment Variables (Recommended)

Create a test runner script that sets the required environment variables:

```bash
cd /Users/anuragmishra/test-case
./run-checkout-tests.sh
```

The script `run-checkout-tests.sh` has been created for you with proper environment setup.

### Option 2: Set Environment Variables Manually

**For Current Session (Temporary)**:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools

# Then run your tests
node appium-clinikally-checkout-logged.js
```

**For Permanent Fix (Add to ~/.zshrc or ~/.bash_profile)**:
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools' >> ~/.zshrc
source ~/.zshrc
```

---

## Debugging Checklist

### Prerequisites Validation

| Check | Command | Expected Result | Status |
|-------|---------|-----------------|--------|
| Appium Installed | `which appium` | `/usr/local/bin/appium` | ✅ PASS |
| Appium Running | `pgrep -f appium` | Returns PID | ✅ PASS |
| Device Connected | `adb devices` | `DQ899HON5HPFJFFY device` | ✅ PASS |
| WebDriverIO Installed | `npm list webdriverio` | `webdriverio@9.20.0` | ✅ PASS |
| ANDROID_HOME Set | `echo $ANDROID_HOME` | `/Users/anuragmishra/Library/Android/sdk` | ❌ FAIL |
| ANDROID_SDK_ROOT Set | `echo $ANDROID_SDK_ROOT` | `/Users/anuragmishra/Library/Android/sdk` | ❌ FAIL |
| Android SDK Exists | `ls ~/Library/Android/sdk` | Lists SDK directories | ✅ PASS |

### Test Execution Checklist

1. **Start Appium Server**
   ```bash
   appium
   ```
   Expected: Server starts on `http://localhost:4723`

2. **Verify Device Connection**
   ```bash
   adb devices
   ```
   Expected: Shows `DQ899HON5HPFJFFY device`

3. **Check App is Installed**
   ```bash
   adb shell pm list packages | grep clinikally
   ```
   Expected: `package:com.clinikally.app`

4. **Set Environment Variables**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
   ```

5. **Run Test**
   ```bash
   node appium-clinikally-checkout-logged.js
   ```

---

## Common Test Failures & Solutions

### 1. Environment Variable Error (Current Issue)

**Error**:
```
WebDriverError: Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported
```

**Solution**:
Set the environment variables as shown above in the Quick Fix section.

**Verification**:
```bash
echo $ANDROID_HOME
# Should output: /Users/anuragmishra/Library/Android/sdk
```

---

### 2. Appium Server Not Running

**Error**:
```
Error: ECONNREFUSED
⚠️  Appium server is not running!
```

**Solution**:
```bash
# Start Appium in a separate terminal
appium

# Or start in background
appium > /tmp/appium.log 2>&1 &
```

**Verification**:
```bash
pgrep -f appium
# Should return a process ID
```

---

### 3. Device Not Connected

**Error**:
```
An unknown server-side error occurred while processing the command.
Original error: Could not find a connected Android device
```

**Solution**:
```bash
# Check device connection
adb devices

# If not showing, reconnect device
adb kill-server
adb start-server
adb devices
```

**Verification**:
```bash
adb devices
# Should show: DQ899HON5HPFJFFY device
```

---

### 4. App Not Installed

**Error**:
```
Activity used to start app doesn't exist or cannot be launched
```

**Solution**:
```bash
# Check if app is installed
adb shell pm list packages | grep clinikally

# If not installed, install it
adb install path/to/clinikally.apk
```

---

### 5. Element Not Found Errors

**Error**:
```
An element could not be located on the page using the given search parameters
```

**Cause**: UI coordinates or selectors in TEST_CONFIG are incorrect or outdated.

**Solution**:
1. Update `TEST_CONFIG` in the test file with correct coordinates
2. Use `appium-clinikally-test.js` to find element coordinates
3. Take screenshots to verify UI layout

**Debug Steps**:
```bash
# Run test with screenshots
node appium-clinikally-checkout-logged.js

# Check screenshots in /tmp/
ls -la /tmp/clinikally-*.png

# View screenshots to identify UI changes
open /tmp/clinikally-checkout-*.png
```

---

### 6. Login Failures

**Error**:
```
❌ FAIL: Login Flow - OTP verification failed
```

**Common Causes**:
- Invalid phone number
- Incorrect OTP
- OTP expired
- UI changed (button coordinates outdated)

**Solution**:
1. Verify phone number in `TEST_CONFIG`
2. Update OTP (use actual OTP received)
3. Check login button coordinates
4. Review screenshots in `/tmp/clinikally-login-*.png`

---

### 7. Payment Method Not Found

**Error**:
```
⚠️  WARN: Payment method selection needs configuration
```

**Cause**: Payment UI elements not configured in `TEST_CONFIG`.

**Solution**:
1. Manually navigate to payment page
2. Identify element coordinates using Appium Inspector or test script
3. Update `paymentMethodCoordinates` in `TEST_CONFIG`

---

### 8. Session Timeout

**Error**:
```
The session with id xxx does not exist
```

**Cause**: Test took too long, session expired.

**Solution**:
Update `newCommandTimeout` in test file:
```javascript
'appium:newCommandTimeout': 600 // Increase from 300 to 600 seconds
```

---

### 9. Product Not Found

**Error**:
```
⚠️  WARN: Product selection needs configuration
```

**Cause**: Product search term is placeholder or product doesn't exist.

**Solution**:
1. Update `productSearchTerm` in `TEST_CONFIG`
2. Use an actual product name from the app
3. Verify product exists and is in stock

---

### 10. Keyboard Not Hiding

**Issue**: Keyboard blocks elements after text input.

**Solution**:
The tests already handle this with:
```javascript
await driver.hideKeyboard();
```

If still failing, add manual tap outside input field:
```javascript
await driver.performActions([{
  type: 'pointer',
  id: 'finger1',
  parameters: { pointerType: 'touch' },
  actions: [
    { type: 'pointerMove', duration: 0, x: 540, y: 300 },
    { type: 'pointerDown', button: 0 },
    { type: 'pointerUp', button: 0 }
  ]
}]);
```

---

## Test Configuration Needed

Both test scripts require configuration before full execution:

### appium-clinikally-checkout-logged.js

```javascript
const TEST_CONFIG = {
  phoneNumber: '9818106744', // ✅ Configured
  otp: '123456', // ⚠️  Update with actual OTP

  productSearchTerm: 'YOUR_PRODUCT_NAME_HERE', // ❌ TODO
  productCoordinates: { x: 540, y: 800 }, // ❌ TODO
  addToCartCoordinates: { x: 540, y: 1800 }, // ❌ TODO
  viewCartCoordinates: { x: 540, y: 2100 }, // ❌ TODO
  checkoutButtonCoordinates: { x: 540, y: 2000 }, // ❌ TODO
  paymentMethodCoordinates: { x: 540, y: 1500 }, // ❌ TODO

  completePayment: false // ✅ Keep false for testing
};
```

### appium-clinikally-checkout-guest.js

```javascript
const TEST_CONFIG = {
  phoneNumber: '9818106744', // ✅ Configured
  otp: '123456', // ⚠️  Update with actual OTP

  productSearchTerm: 'YOUR_PRODUCT_NAME_HERE', // ❌ TODO

  address: { // ❌ TODO - Update with test address
    name: 'Test User',
    phone: '9818106744',
    addressLine1: 'Test Address Line 1',
    addressLine2: 'Test Address Line 2',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456'
  },

  buyNowCoordinates: { x: 540, y: 1800 }, // ❌ TODO
  addressSelectCoordinates: { x: 540, y: 1000 }, // ❌ TODO
  continueToPaymentCoordinates: { x: 540, y: 2000 }, // ❌ TODO
  paymentMethodCoordinates: { x: 540, y: 1500 }, // ❌ TODO

  completePayment: false // ✅ Keep false for testing
};
```

---

## Finding UI Element Coordinates

### Method 1: Using appium-clinikally-test.js

```bash
node appium-clinikally-test.js
# Manually interact with app
# Check screenshots in /tmp/
```

### Method 2: Using Appium Inspector

1. Download Appium Inspector: https://github.com/appium/appium-inspector
2. Connect to Appium server at `http://localhost:4723`
3. Use device capabilities:
   ```json
   {
     "platformName": "Android",
     "appium:deviceName": "DQ899HON5HPFJFFY",
     "appium:automationName": "UiAutomator2",
     "appium:appPackage": "com.clinikally.app",
     "appium:appActivity": ".MainActivity"
   }
   ```
4. Inspect elements visually and get coordinates

### Method 3: Manual Calculation

1. Take screenshot during test
2. Open in image editor
3. Note pixel coordinates
4. Convert to device coordinates (if needed)

---

## Viewing Test Results

### Screenshots

All tests save screenshots to `/tmp/`:

```bash
# List all screenshots
ls -la /tmp/clinikally-*.png

# View specific test screenshots
open /tmp/clinikally-checkout-*.png
open /tmp/clinikally-guest-*.png
```

### Test Summary

Tests output a summary at the end:

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
   ...
============================================================
```

### Exit Codes

- `0`: All tests passed (may have warnings)
- `1`: One or more tests failed

---

## Running Tests

### Full Checkout Flow

```bash
# Logged user checkout
ANDROID_HOME=$HOME/Library/Android/sdk \
ANDROID_SDK_ROOT=$HOME/Library/Android/sdk \
node appium-clinikally-checkout-logged.js

# Guest user checkout
ANDROID_HOME=$HOME/Library/Android/sdk \
ANDROID_SDK_ROOT=$HOME/Library/Android/sdk \
node appium-clinikally-checkout-guest.js
```

### Specific Test Sections

**Logged User**:
```bash
# Only add to cart
node appium-clinikally-checkout-logged.js add

# Only checkout
node appium-clinikally-checkout-logged.js checkout
```

**Guest User**:
```bash
# Only buy now
node appium-clinikally-checkout-guest.js buy

# Only login
node appium-clinikally-checkout-guest.js login
```

---

## Next Steps to Fix Tests

1. **Immediate Fix** (Blocker):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
   ```

2. **Configure Product Search**:
   - Find a real product name
   - Update `productSearchTerm` in both test files

3. **Find UI Coordinates**:
   - Use Appium Inspector or test script
   - Update all coordinates in `TEST_CONFIG`

4. **Test Login Flow**:
   - Ensure phone number is valid
   - Use real OTP when testing

5. **Test Incrementally**:
   - Run one section at a time
   - Fix issues before proceeding
   - Update coordinates as needed

6. **Add Validations**:
   - Verify cart totals
   - Verify addresses
   - Verify order summaries

---

## Support & Resources

- **Appium Docs**: https://appium.io/docs/en/latest/
- **WebdriverIO Docs**: https://webdriver.io/
- **Android SDK Docs**: https://developer.android.com/studio/command-line/variables

---

**Last Updated**: November 15, 2025
**Status**: ANDROID_HOME issue identified - Quick fix provided
