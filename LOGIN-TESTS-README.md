# Clinikally Login Test Suite

Comprehensive test automation for Clinikally mobile app login flow.

## 📋 Test Cases Covered

| Test # | Test Case | Description |
|--------|-----------|-------------|
| TC1 | Valid Mobile + Valid OTP | Complete successful login flow |
| TC2 | Valid Mobile + Invalid OTP | Tests error handling for wrong OTP |
| TC3 | Valid Mobile + Expired OTP | Tests OTP expiration (60s wait) |
| TC4 | Valid Mobile + Empty OTP | Tests validation for empty OTP field |
| TC5 | Empty Mobile Number | Tests validation for empty phone field |
| TC6 | Invalid Mobile Format | Tests multiple invalid phone formats |
| TC7 | Resend OTP Scenario | Tests OTP resend functionality |
| TC8 | Max Retry Attempts | Tests account locking after multiple failed attempts |

## 🧠 Test Execution Strategy

### Intelligent Test Ordering

**Negative cases run FIRST, Valid case runs LAST** (as sanity check)

**Execution Order:**
1. 🔴 TC5 - Empty Mobile Number
2. 🔴 TC6 - Invalid Mobile Format
3. 🔴 TC4 - Valid Mobile + Empty OTP
4. 🔴 TC2 - Valid Mobile + Invalid OTP
5. 🔴 TC3 - Valid Mobile + Expired OTP
6. 🔴 TC8 - Max Retry Attempts
7. 🔴 TC7 - Resend OTP Scenario
8. 🟢 TC1 - Valid Mobile + Valid OTP ✅ **SANITY CHECK**

**Why this order?**
- ✅ Negative tests run independently (no login state issues)
- ✅ Reduces cascading failures from successful login
- ✅ Valid case at end = sanity check
- ✅ **If only TC1 fails → Backend/Environment issue**
- ✅ **If TC1 passes but others fail → Test isolation issue**
- ✅ Easier to debug and identify root causes

## 🚀 How to Run

### Prerequisites
1. **Appium Server Running**
   ```bash
   appium
   ```

2. **Device Connected**
   - Device ID: `DQ899HON5HPFJFFY` (Update in config if different)

### Run All Tests
```bash
node appium-clinikally-login-comprehensive.js
```

### Run Individual Test
```bash
# By test number
node appium-clinikally-login-comprehensive.js 1
node appium-clinikally-login-comprehensive.js 2

# By test name
node appium-clinikally-login-comprehensive.js valid
node appium-clinikally-login-comprehensive.js invalid-otp
node appium-clinikally-login-comprehensive.js expired-otp
node appium-clinikally-login-comprehensive.js empty-otp
node appium-clinikally-login-comprehensive.js empty-phone
node appium-clinikally-login-comprehensive.js invalid-phone
node appium-clinikally-login-comprehensive.js resend
node appium-clinikally-login-comprehensive.js max-retry
```

## 📸 Screenshots

All screenshots are saved to: `/tmp/clinikally-tests/`

**Screenshot naming convention:**
- `tc1-phone-entered.png` - Test Case 1, phone entered
- `tc2-invalid-otp-entered.png` - Test Case 2, invalid OTP entered
- etc.

## 📊 Test Reports

After execution, a detailed JSON report is generated:
```
/tmp/clinikally-tests/test-report.json
```

Report includes:
- Timestamp
- Device info
- Summary (passed/failed/warnings)
- Detailed results for each test

## ⚙️ Configuration

Edit the `TEST_CONFIG` object in the test file to customize:

```javascript
const TEST_CONFIG = {
  appiumUrl: 'http://localhost:4723',
  capabilities: {
    'appium:deviceName': 'YOUR_DEVICE_ID',
    'appium:appPackage': 'com.clinikally.app',
    // ... other capabilities
  },
  validPhone: '9818106744',      // Valid test phone number
  validOTP: '123456',              // Valid OTP for testing
  invalidOTP: '000000',            // Invalid OTP for testing
  invalidPhones: ['123', '98181067', '12345678901', 'abcdefghij'],
  screenshots: '/tmp/clinikally-tests'
};
```

## 📝 Test Details

### TC1: Valid Mobile + Valid OTP
- ✅ Enters valid phone number
- ✅ Requests OTP
- ✅ Enters valid OTP
- ✅ Verifies OTP
- ✅ Expects successful login

### TC2: Valid Mobile + Invalid OTP
- ✅ Enters valid phone number
- ✅ Requests OTP
- ✅ Enters invalid OTP (000000)
- ✅ Expects error message

### TC3: Valid Mobile + Expired OTP
- ✅ Enters valid phone number
- ✅ Requests OTP
- ⏰ Waits 60 seconds
- ✅ Enters OTP after expiration
- ✅ Expects expired/invalid error

### TC4: Valid Mobile + Empty OTP
- ✅ Enters valid phone number
- ✅ Requests OTP
- ⚠️ Leaves OTP field empty
- ✅ Expects validation error or disabled button

### TC5: Empty Mobile Number
- ⚠️ Leaves phone field empty
- ✅ Tries to request OTP
- ✅ Expects validation error or disabled button

### TC6: Invalid Mobile Format
Tests multiple invalid formats:
- `123` - Too short
- `98181067` - Missing digits
- `12345678901` - Too long
- `abcdefghij` - Non-numeric

### TC7: Resend OTP
- ✅ Enters valid phone number
- ✅ Requests OTP
- ⏰ Waits 30 seconds
- ✅ Clicks Resend OTP
- ✅ Enters OTP and verifies

### TC8: Max Retry Attempts
- ✅ Enters valid phone number
- ✅ Requests OTP
- 🔄 Attempts wrong OTP 5 times
- ✅ Expects account lock/block message

## 🛠️ Utility Functions

The test suite includes reusable utility functions:
- `findPhoneInput()` - Multiple strategies to locate phone field
- `enterPhoneNumber()` - Enter phone with validation
- `clickRequestOTP()` - Find and click Request OTP button
- `enterOTP()` - Enter OTP using coordinates and key codes
- `clickVerifyOTP()` - Find and click Verify button
- `clickResendOTP()` - Find and click Resend button
- `checkForError()` - Detect error messages
- `takeScreenshot()` - Capture and save screenshots
- `restartApp()` - Restart app between tests

## 🐛 Troubleshooting

### Appium Connection Error
```
Error: ECONNREFUSED
```
**Solution:** Start Appium server with `appium`

### Element Not Found
**Solution:**
- Check if app is loaded
- Update selectors in utility functions
- Check screenshot to see current state

### Test Timing Issues
**Solution:** Adjust `driver.pause()` durations in the test code

## 📞 Support

For issues or questions:
- Check screenshots in `/tmp/clinikally-tests/`
- Review `test-report.json` for details
- Update device ID in TEST_CONFIG if using different device
