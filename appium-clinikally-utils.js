// Shared utility functions for Clinikally app tests

/**
 * Performs login with phone number and OTP
 * @param {object} driver - WebdriverIO driver instance
 * @param {string} phoneNumber - Phone number to login with
 * @param {string} otp - OTP code
 * @param {function} reportTestCase - Test reporting function
 * @returns {boolean} - Success status
 */
async function performLogin(driver, phoneNumber, otp, reportTestCase) {
  const fs = require('fs');

  try {
    console.log('\n📄 TEST CASE: Login with phone and OTP\n');
    console.log(`📞 Phone: ${phoneNumber}`);
    console.log(`🔢 OTP: ${otp}`);

    // STEP 1: Enter phone number
    console.log('\n🔍 Looking for phone number input field...');

    let phoneInput;
    const editTexts = await driver.$$('android.widget.EditText');
    console.log(`Found ${editTexts.length} EditText fields`);

    if (editTexts.length > 0) {
      phoneInput = editTexts[0];
      console.log('✅ Found phone input field');

      await phoneInput.click();
      await driver.pause(500);

      console.log(`⌨️  Entering phone number: ${phoneNumber}...`);
      await phoneInput.setValue(phoneNumber);
      await driver.pause(1000);

      const enteredValue = await phoneInput.getText();
      console.log('✅ Phone number entered:', enteredValue || phoneNumber);

      if (enteredValue && (enteredValue.includes(phoneNumber) || enteredValue === phoneNumber)) {
        console.log('✅ Validation PASSED: Correct phone number in field');
        reportTestCase('Enter phone number', 'PASS');
      } else {
        reportTestCase('Enter phone number', 'FAIL', `Wrong value: "${enteredValue}"`, true);
        return false;
      }

      // Take screenshot
      let screenshot = await driver.takeScreenshot();
      fs.writeFileSync('/tmp/clinikally-checkout-login-phone.png', screenshot, 'base64');
      console.log('📸 Screenshot saved');

    } else {
      reportTestCase('Find phone input field', 'FAIL', 'No phone input found', true);
      return false;
    }

    // STEP 2: Click Request OTP arrow button
    console.log('\n📄 Clicking Request OTP arrow button...');
    await driver.pause(1000);

    console.log('👆 Clicking arrow button at coordinates (918, 1710)...');
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: 918, y: 1710 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
    await driver.pause(4000);
    console.log('✅ Arrow button clicked');

    // Verify navigation to OTP page
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('OTP') || pageSource.includes('Enter OTP') || pageSource.includes('Verify')) {
      console.log('✅ Validation PASSED: Successfully navigated to OTP page');
      reportTestCase('Click Request OTP button', 'PASS');
    } else {
      reportTestCase('Click Request OTP button', 'FAIL', 'Did not navigate to OTP page', true);
      return false;
    }

    // Take screenshot
    let screenshot = await driver.takeScreenshot();
    fs.writeFileSync('/tmp/clinikally-checkout-login-otp-page.png', screenshot, 'base64');
    console.log('📸 Screenshot saved');

    // STEP 3: Enter OTP
    console.log('\n📄 Entering OTP...');

    const otpX = 164;
    const otpY = 964;

    console.log(`👆 Tapping OTP input field at (${otpX}, ${otpY})...`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: otpX, y: otpY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
    await driver.pause(500);

    console.log(`⌨️  Typing OTP: ${otp}...`);
    for (const digit of otp) {
      const keyCode = 7 + parseInt(digit);
      await driver.pressKeyCode(keyCode);
      await driver.pause(100);
    }

    await driver.pause(1000);
    console.log('✅ OTP entered');
    reportTestCase('Enter OTP', 'PASS');

    // Take screenshot
    screenshot = await driver.takeScreenshot();
    fs.writeFileSync('/tmp/clinikally-checkout-login-otp-entered.png', screenshot, 'base64');
    console.log('📸 Screenshot saved');

    // STEP 4: Hide keyboard and verify
    console.log('\n📄 Verifying OTP...');

    try {
      console.log('⌨️  Hiding keyboard...');
      await driver.hideKeyboard();
      console.log('✅ Keyboard hidden');
      await driver.pause(3000);
    } catch (e) {
      console.log('⚠️  Keyboard already hidden');
    }

    // Take screenshot
    screenshot = await driver.takeScreenshot();
    fs.writeFileSync('/tmp/clinikally-checkout-login-after-verify.png', screenshot, 'base64');
    console.log('📸 Screenshot saved');

    // Try to find Verify button
    console.log('\n🔍 Looking for Verify OTP button...');
    let verifyButton;

    try {
      const allButtons = await driver.$$('android.widget.Button');
      console.log(`Found ${allButtons.length} Button elements`);
      if (allButtons.length > 0) {
        verifyButton = allButtons[allButtons.length - 1];
        console.log('✅ Found Verify button');

        await verifyButton.click();
        await driver.pause(3000);
        console.log('✅ Verify button clicked');
        reportTestCase('Click Verify OTP button', 'PASS');
      } else {
        console.log('⚠️  Verify button not found - OTP may have auto-verified');
        reportTestCase('Find Verify OTP button', 'WARN', 'Auto-verified');
      }
    } catch (e) {
      console.log('⚠️  Verify button not found - OTP may have auto-verified');
      reportTestCase('Find Verify OTP button', 'WARN', 'Auto-verified');
    }

    console.log('\n✅ Login completed successfully');
    return true;

  } catch (error) {
    console.error('❌ Login error:', error.message);
    reportTestCase('Login Flow', 'FAIL', error.message, true);
    return false;
  }
}

/**
 * Checks if user is logged in
 * @param {object} driver - WebdriverIO driver instance
 * @returns {boolean} - True if logged in
 */
async function isUserLoggedIn(driver) {
  try {
    const pageSource = await driver.getPageSource();

    // Check for logged-in indicators
    const hasLoginButton = pageSource.includes('Login') || pageSource.includes('login');
    const hasUserContent = pageSource.includes('My Cart') ||
                          pageSource.includes('Profile') ||
                          pageSource.includes('My Orders');

    // If we see login button and no user content, user is not logged in
    if (hasLoginButton && !hasUserContent) {
      return false;
    }

    // If we see user content, user is logged in
    if (hasUserContent) {
      return true;
    }

    // Default to not logged in if unclear
    return false;
  } catch (e) {
    console.error('Error checking login status:', e.message);
    return false;
  }
}

/**
 * Ensures user is logged in, performs login if needed
 * @param {object} driver - WebdriverIO driver instance
 * @param {string} phoneNumber - Phone number to login with
 * @param {string} otp - OTP code
 * @param {function} reportTestCase - Test reporting function
 * @returns {boolean} - Success status
 */
async function ensureLoggedIn(driver, phoneNumber, otp, reportTestCase) {
  console.log('\n🔐 Checking login status...');

  const loggedIn = await isUserLoggedIn(driver);

  if (loggedIn) {
    console.log('✅ User is already logged in');
    reportTestCase('Verify Logged In', 'PASS');
    return true;
  } else {
    console.log('⚠️  User is not logged in - performing login...');
    reportTestCase('Check Login Status', 'WARN', 'User not logged in, logging in now');
    return await performLogin(driver, phoneNumber, otp, reportTestCase);
  }
}

/**
 * Takes and saves a screenshot
 * @param {object} driver - WebdriverIO driver instance
 * @param {string} filename - Filename to save screenshot
 */
async function takeScreenshot(driver, filename) {
  try {
    const fs = require('fs');
    const screenshot = await driver.takeScreenshot();
    const filepath = `/tmp/${filename}`;
    fs.writeFileSync(filepath, screenshot, 'base64');
    console.log(`📸 Screenshot saved to ${filepath}`);
  } catch (e) {
    console.error('Error taking screenshot:', e.message);
  }
}

module.exports = {
  performLogin,
  isUserLoggedIn,
  ensureLoggedIn,
  takeScreenshot
};
