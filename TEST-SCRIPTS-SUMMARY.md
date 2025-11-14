# Clinikally Test Scripts Summary

## Available Test Scripts

### 1. appium-clinikally-login.js (Main Script)
**Purpose:** Complete modular login test with 2-page flow support

**Features:**
- ✅ Modular test modes (run specific sections)
- ✅ PAGE 1: Phone entry + Request OTP
- ✅ PAGE 2: OTP entry + Verify/Resend OTP
- ✅ Supports coordinates for reliable clicking
- ✅ Multiple fallback strategies

**Usage:**
```bash
# Full test
node appium-clinikally-login.js

# PAGE 1 only (phone + request OTP)
node appium-clinikally-login.js phone

# PAGE 2 only (OTP entry + verify)
node appium-clinikally-login.js otp-verify

# OTP entry only
node appium-clinikally-login.js otp

# Verify button only
node appium-clinikally-login.js verify

# Resend OTP
RESEND_OTP=true node appium-clinikally-login.js verify
```

**Test Configuration:**
- Phone number: 9818106744
- OTP: 123456
- Request OTP coordinates: (846, 1034)
- OTP input coordinates: (164, 964)

---

### 2. appium-clinikally-login-final.js (Backup)
**Purpose:** Backup copy of the working login script
**Status:** Same as appium-clinikally-login.js

---

### 3. appium-clinikally-test.js
**Purpose:** Page verification and UI element discovery test
**Features:**
- Retrieves page source
- Finds UI elements (TextViews, Buttons, ImageViews)
- Takes screenshots

**Usage:**
```bash
node appium-clinikally-test.js
```

---

## Test Files Structure

```
test-case/
├── appium-clinikally-login.js        # Main modular login test
├── appium-clinikally-login-final.js  # Backup of login test
├── appium-clinikally-test.js         # Page verification test
├── package.json                       # Dependencies
├── README-TEST-MODES.md              # Detailed usage guide
└── TEST-SCRIPTS-SUMMARY.md           # This file
```

---

## Login Flow (2 Pages)

### PAGE 1 - Phone Entry
1. Enter phone number: 9818106744
2. Click "Request OTP" button at (846, 1034)
3. Navigate to OTP page

### PAGE 2 - OTP Verification
1. Tap OTP field at (164, 964)
2. Enter OTP: 123456 (using key codes)
3. Click "Verify OTP" button OR "Resend OTP"

---

## Screenshots Generated

Login test saves screenshots at each step:
- `/tmp/clinikally-login-with-number.png` - After phone entry
- `/tmp/clinikally-request-otp.png` - After Request OTP click
- `/tmp/clinikally-otp-page.png` - OTP page loaded
- `/tmp/clinikally-otp-entered.png` - After OTP entry
- `/tmp/clinikally-after-verify.png` - After verification

---

## Prerequisites

- ✅ Appium server running on `http://localhost:4723`
- ✅ Android device connected: `DQ899HON5HPFJFFY`
- ✅ Clinikally app installed: `com.clinikally.app`
- ✅ Node.js and webdriverio installed

---

## Quick Start

1. **Start Appium server:**
   ```bash
   appium
   ```

2. **Run full login test:**
   ```bash
   cd ~/test-case
   node appium-clinikally-login.js
   ```

3. **Run only PAGE 2 (if already on OTP screen):**
   ```bash
   node appium-clinikally-login.js otp-verify
   ```

---

## Troubleshooting

**Issue:** "Could not find phone input field"
- **Solution:** Manually logout from app first

**Issue:** "Verify button not found"
- **Solution:** May auto-verify or use different text. Check screenshot.

**Issue:** "Permission denied for adb_shell"
- **Solution:** Already fixed - using key codes instead

---

## Created: November 14, 2025
## Last Updated: November 14, 2025
