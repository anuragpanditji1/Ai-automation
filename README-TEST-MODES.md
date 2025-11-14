# Clinikally Login Test - Usage Guide

## Login Flow (2 Pages)

The Clinikally app has a 2-page login flow:

**PAGE 1 - Phone Entry:**
1. Enter phone number
2. Click "Request OTP" button
3. Navigate to OTP page

**PAGE 2 - OTP Verification:**
1. Enter OTP (6 digits)
2. Click "Verify OTP" button OR "Resend OTP" button

## Test Modes

The test supports running different sections independently or all together.

### Available Modes:

1. **`full`** (default) - Runs complete login flow
   - Phone entry
   - OTP entry
   - Verify OTP

2. **`phone`** - Only phone number entry and submit
   - Enters phone number: 9818106744
   - Clicks arrow button

3. **`otp`** - Only OTP entry
   - Enters OTP: 123456
   - **Note:** App must be on OTP page before running

4. **`verify`** - Only clicks Verify OTP button
   - **Note:** OTP must already be entered

5. **Combined modes:**
   - `phone-otp` - Phone entry + OTP entry
   - `otp-verify` - OTP entry + Verify OTP

## How to Run

### Run full test (default):
```bash
node appium-clinikally-login.js
# OR
node appium-clinikally-login.js full
```

### Run only phone entry:
```bash
node appium-clinikally-login.js phone
```

### Run only OTP entry:
```bash
node appium-clinikally-login.js otp
```

### Run only verify:
```bash
node appium-clinikally-login.js verify
```

### Run phone + OTP:
```bash
node appium-clinikally-login.js phone-otp
```

### Run OTP + verify:
```bash
node appium-clinikally-login.js otp-verify
```

## Additional Features

### Resend OTP
To test the Resend OTP button instead of Verify:
```bash
RESEND_OTP=true node appium-clinikally-login.js verify
```

## Prerequisites

- Appium server must be running
- Device must be connected
- **For phone mode:** App must be on PAGE 1 (login page)
- **For otp mode:** App must be on PAGE 2 (OTP page)
- **For verify mode:** OTP must already be entered on PAGE 2

## Examples

### Example 1: Test only OTP entry
1. Manually navigate to OTP page
2. Run: `node appium-clinikally-login.js otp`
3. Test will enter OTP 123456

### Example 2: Test full flow
1. Manually logout from app
2. Run: `node appium-clinikally-login.js`
3. Test will complete entire login

### Example 3: Resume from OTP page
1. App is on OTP page
2. Run: `node appium-clinikally-login.js otp-verify`
3. Test will enter OTP and click verify
