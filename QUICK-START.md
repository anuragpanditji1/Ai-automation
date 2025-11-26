# Quick Start Guide - Clinikally Login Tests

## ⚡ Run Tests in 3 Steps

### 1. Start Appium
```bash
appium
```

### 2. Run All Tests
```bash
cd ~/test-case
node appium-clinikally-login-comprehensive.js
```

### 3. View Results
```bash
# Screenshots
open /tmp/clinikally-tests/

# JSON Report
cat /tmp/clinikally-tests/test-report.json
```

---

## 🎯 Run Specific Test

```bash
# By number
node appium-clinikally-login-comprehensive.js 5     # Empty phone
node appium-clinikally-login-comprehensive.js 6     # Invalid phone
node appium-clinikally-login-comprehensive.js 2     # Invalid OTP

# By name
node appium-clinikally-login-comprehensive.js empty-phone
node appium-clinikally-login-comprehensive.js invalid-otp
node appium-clinikally-login-comprehensive.js max-retry
```

---

## 📊 Test Execution Flow

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

---

## 🔍 Interpreting Results

| Scenario | Meaning |
|----------|---------|
| ✅ All tests pass | Everything working correctly |
| ❌ Only TC1 fails | **Backend/Environment issue** |
| ❌ Negative tests fail | Test logic or app UI changed |
| ⚠️ Warnings appear | Validation exists (button disabled) |

---

## 📸 Screenshots Location

All test screenshots saved to:
```
/tmp/clinikally-tests/
```

**Naming pattern:**
- `tc1-phone-entered.png`
- `tc2-invalid-otp-entered.png`
- `tc3-expired-otp-entered.png`
- etc.

---

## ⚙️ Configuration (if needed)

Edit line 17 in `appium-clinikally-login-comprehensive.js`:

```javascript
validPhone: '9818106744',      // Change test phone
validOTP: '123456',              // Change valid OTP
invalidOTP: '000000',            // Change invalid OTP
```

Edit line 9 for different device:
```javascript
'appium:deviceName': 'YOUR_DEVICE_ID',
```

---

## 🐛 Troubleshooting

### "ECONNREFUSED"
→ Appium not running. Start with: `appium`

### "Element not found"
→ Check screenshot to see app state
→ UI might have changed, update selectors

### Tests timing out
→ Increase `driver.pause()` values in test file

---

## 📝 Full Documentation

See `LOGIN-TESTS-README.md` for complete details.
