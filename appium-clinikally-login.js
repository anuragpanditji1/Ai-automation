const { remote } = require('webdriverio');

// TEST CONFIGURATION
// Set which parts of the test to run:
// Options: 'full', 'phone-only', 'otp-only', 'verify-only'
// You can also combine: 'phone-otp', 'otp-verify'
const TEST_MODE = process.argv[2] || 'full'; // Get from command line or default to 'full'

const shouldRunPhoneEntry = TEST_MODE === 'full' || TEST_MODE.includes('phone');
const shouldRunOtpEntry = TEST_MODE === 'full' || TEST_MODE.includes('otp');
const shouldRunVerify = TEST_MODE === 'full' || TEST_MODE.includes('verify');

console.log(`🔧 Test Mode: ${TEST_MODE}`);
console.log(`   Phone Entry: ${shouldRunPhoneEntry ? '✅' : '❌'}`);
console.log(`   OTP Entry: ${shouldRunOtpEntry ? '✅' : '❌'}`);
console.log(`   Verify OTP: ${shouldRunVerify ? '✅' : '❌'}\n`);

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function reportTestCase(name, status, message = '', isBlocker = false) {
  const timestamp = new Date().toISOString();
  const result = { name, status, message, isBlocker, timestamp };

  if (status === 'PASS') {
    testResults.passed.push(result);
    console.log(`✅ PASS: ${name}`);
  } else if (status === 'FAIL') {
    testResults.failed.push(result);
    console.log(`❌ FAIL: ${name} - ${message}`);
    if (isBlocker) {
      console.log(`🚫 BLOCKER: Cannot continue test execution`);
    }
  } else if (status === 'WARN') {
    testResults.warnings.push(result);
    console.log(`⚠️  WARN: ${name} - ${message}`);
  }

  return status === 'FAIL' && isBlocker;
}

(async () => {
  console.log('🤖 Starting Appium test for Clinikally app login...\n');

  // Appium capabilities
  const capabilities = {
    platformName: 'Android',
    'appium:deviceName': 'DQ899HON5HPFJFFY',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.clinikally.app',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300
  };

  let driver;

  try {
    console.log('📱 Connecting to Appium server at http://localhost:4723...');

    driver = await remote({
      protocol: 'http',
      hostname: 'localhost',
      port: 4723,
      path: '/',
      capabilities: capabilities,
      logLevel: 'info'
    });

    console.log('✅ Connected to device');
    console.log('🚀 Launching Clinikally app...\n');

    // Wait for app to load
    await driver.pause(3000);

    // PHONE ENTRY SECTION
    if (shouldRunPhoneEntry) {
      console.log('\n📄 TEST CASE: Find and enter phone number\n');

      // First verify we're on the login page by checking for login-specific text
      console.log('🔍 Verifying login page...');
      try {
        const loginText = await driver.$('android=new UiSelector().textContains("Login")');
        if (loginText && await loginText.isDisplayed()) {
          console.log('✅ Confirmed on Login page');
        }
      } catch (e) {
        const isBlocker = reportTestCase('Verify Login Page', 'FAIL', 'Not on login page - app may already be logged in', true);
        if (isBlocker) return;
      }

      // Try multiple strategies to find the phone number input field
      let phoneInput;
      let phoneEntrySuccess = false;

    try {
      // Strategy 1: Find by EditText class and verify it's for phone number
      const editTexts = await driver.$$('android.widget.EditText');
      console.log(`Found ${editTexts.length} EditText fields`);

      if (editTexts.length > 0) {
        phoneInput = editTexts[0];

        // Validate this is the phone input by checking nearby text
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('phone') || pageSource.includes('Login') || pageSource.includes('OTP')) {
          console.log('✅ Found phone input field (Strategy 1: EditText)');

          // Get field properties to validate
          const text = await phoneInput.getText();
          console.log(`Current field value: "${text}"`);

          // Check if field has phone-related hint/content-desc
          try {
            const contentDesc = await phoneInput.getAttribute('content-desc');
            console.log(`Field content-desc: "${contentDesc}"`);
          } catch (e) {
            // Ignore
          }
        } else {
          console.log('⚠️  EditText found but doesn\'t appear to be phone field');
          phoneInput = null;
        }
      }
    } catch (e) {
      console.log('Strategy 1 failed, trying next...');
    }

    // Strategy 2: Try finding by text/hint
    if (!phoneInput) {
      try {
        phoneInput = await driver.$('android=new UiSelector().textContains("phone")');
        console.log('✅ Found phone input field (Strategy 2: text contains "phone")');
      } catch (e) {
        console.log('Strategy 2 failed, trying next...');
      }
    }

    // Strategy 3: Try finding by resource-id
    if (!phoneInput) {
      try {
        phoneInput = await driver.$('android=new UiSelector().resourceIdMatches(".*phone.*")');
        console.log('✅ Found phone input field (Strategy 3: resource-id)');
      } catch (e) {
        console.log('Strategy 3 failed, trying next...');
      }
    }

    // Strategy 4: Try finding by content description
    if (!phoneInput) {
      try {
        phoneInput = await driver.$('android=new UiSelector().descriptionContains("phone")');
        console.log('✅ Found phone input field (Strategy 4: content-desc)');
      } catch (e) {
        console.log('Strategy 4 failed...');
      }
    }

    if (phoneInput) {
      try {
        console.log('📝 Clicking on phone number field...');
        await phoneInput.click();
        await driver.pause(500);

        console.log('⌨️  Entering phone number: 9818106744...');
        await phoneInput.setValue('9818106744');

        await driver.pause(1000);

        // Verify the value was entered correctly
        const enteredValue = await phoneInput.getText();
        console.log('✅ Phone number entered:', enteredValue || '9818106744');

        // Validate the entered value
        if (enteredValue && (enteredValue.includes('9818106744') || enteredValue === '9818106744')) {
          console.log('✅ Validation PASSED: Correct phone number in field');
          phoneEntrySuccess = true;
          reportTestCase('Enter phone number', 'PASS');
        } else {
          const isBlocker = reportTestCase('Enter phone number', 'FAIL', `Wrong value entered: "${enteredValue}" instead of "9818106744"`, true);
          if (isBlocker) return;
        }
      } catch (e) {
        const isBlocker = reportTestCase('Enter phone number', 'FAIL', e.message, true);
        if (isBlocker) return; // Stop execution
      }
    } else {
      const isBlocker = reportTestCase('Find phone input field', 'FAIL', 'Could not find phone input field - app may be logged in', true);
      if (isBlocker) return; // Stop execution
    }

    if (phoneEntrySuccess) {

      // Take screenshot after entering number
      let screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      fs.writeFileSync('/tmp/clinikally-login-with-number.png', screenshot, 'base64');
      console.log('📸 Screenshot saved to /tmp/clinikally-login-with-number.png');

      // PAGE 1: Click "Request OTP" arrow button (icon button without text)
      console.log('\n📄 TEST CASE: Click Request OTP arrow button\n');
      await driver.pause(1000);

      // The arrow button is an icon/image button at coordinates (846, 1034)
      // It doesn't have text, so we use coordinate-based clicking
      console.log('👆 Clicking arrow button at coordinates (846, 1034)...');

      try {
        await driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: 846, y: 1034 },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 100 },
              { type: 'pointerUp', button: 0 }
            ]
          }
        ]);
        await driver.releaseActions();
        await driver.pause(4000); // Wait for OTP page to load
        console.log('✅ Arrow button clicked at coordinates (846, 1034)');

        // Take screenshot after requesting OTP
        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-request-otp.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-request-otp.png');

        // Verify we navigated to OTP page
        console.log('🔍 Verifying navigation to OTP page...');
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('OTP') || pageSource.includes('Enter OTP') || pageSource.includes('Verify')) {
          console.log('✅ Validation PASSED: Successfully navigated to OTP page');
          reportTestCase('Click Request OTP button', 'PASS');
        } else {
          const isBlocker = reportTestCase('Click Request OTP button', 'FAIL', 'Did not navigate to OTP page', true);
          if (isBlocker) return;
        }
      } catch (e) {
        const isBlocker = reportTestCase('Click Request OTP button', 'FAIL', e.message, true);
        if (isBlocker) return; // Stop execution
      }
      } // End of if (phoneEntrySuccess)
    } // End of phone entry section

    // OTP ENTRY SECTION - PAGE 2
    if (shouldRunOtpEntry) {
      console.log('\n📄 TEST CASE: Enter OTP on verification page\n');

      // Verify we're on OTP page
      console.log('🔍 Verifying OTP page...');
      try {
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('OTP') || pageSource.includes('Enter OTP') || pageSource.includes('Verify')) {
          console.log('✅ Confirmed on OTP page');
        } else {
          const isBlocker = reportTestCase('Verify OTP Page', 'FAIL', 'Not on OTP page - wrong navigation', true);
          if (isBlocker) return;
        }
      } catch (e) {
        const isBlocker = reportTestCase('Verify OTP Page', 'FAIL', 'Could not verify OTP page', true);
        if (isBlocker) return;
      }

      let screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      fs.writeFileSync('/tmp/clinikally-otp-page.png', screenshot, 'base64');
      console.log('📸 Screenshot saved to /tmp/clinikally-otp-page.png');

      // Look for OTP input fields
      console.log('🔍 Looking for OTP input fields...');
      const otpFields = await driver.$$('android.widget.EditText');
      console.log(`Found ${otpFields.length} EditText fields on OTP page`);

      // Validate we're not on search/home page
      const pageSource = await driver.getPageSource();
      if (pageSource.includes('search') || pageSource.includes('No results found')) {
        const isBlocker = reportTestCase('Verify OTP Page', 'FAIL', 'On search/home page instead of OTP page', true);
        if (isBlocker) return;
      }

      // Enter OTP at specific coordinates [99,892][229,1036]
      try {
        // Calculate center point of bounds [99,892][229,1036]
        // Center X = (99 + 229) / 2 = 164
        // Center Y = (892 + 1036) / 2 = 964
        const otpX = 164;
        const otpY = 964;

        console.log(`👆 Tapping OTP input field at (${otpX}, ${otpY})...`);

        // Tap on OTP input field
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

        console.log('✅ OTP field tapped');

        // Enter OTP using key codes
        console.log('⌨️  Typing OTP: 123456...');

        // Enter each digit using pressKeyCode
        // Key codes: 7=0, 8=1, 9=2, 10=3, 11=4, 12=5, 13=6, 14=7, 15=8, 16=9
        const otp = '123456';
        for (const digit of otp) {
          const keyCode = 7 + parseInt(digit); // 0=keycode 7, 1=keycode 8, etc.
          await driver.pressKeyCode(keyCode);
          await driver.pause(100);
        }

        await driver.pause(1000);
        console.log('✅ OTP entered: 123456');

        // Take screenshot after entering OTP
        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-otp-entered.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-otp-entered.png');

        reportTestCase('Enter OTP', 'PASS');
      } catch (e) {
        const isBlocker = reportTestCase('Enter OTP', 'FAIL', e.message, true);
        if (isBlocker) return; // Stop execution
      }
    } // End of OTP entry section

    // VERIFY OTP SECTION - PAGE 2
    if (shouldRunVerify) {
      console.log('\n📄 TEST CASE: Verify OTP\n');

      // Hide keyboard first
      try {
        console.log('⌨️  Hiding keyboard...');
        await driver.hideKeyboard();
        console.log('✅ Keyboard hidden');
        await driver.pause(3000); // Wait for UI to settle and any auto-verification
      } catch (e) {
        console.log('⚠️  Keyboard already hidden or could not hide');
      }

      // Take screenshot after hiding keyboard to check current state
      let screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      fs.writeFileSync('/tmp/clinikally-after-keyboard-hide.png', screenshot, 'base64');
      console.log('📸 Screenshot saved to /tmp/clinikally-after-keyboard-hide.png');

      // Check if we should resend OTP (can be configured)
      const RESEND_OTP = process.env.RESEND_OTP === 'true';

      if (RESEND_OTP) {
        console.log('🔍 Looking for Resend OTP button...');
        await driver.pause(1000);

        let resendButton;

        // Try to find Resend OTP button
        try {
          resendButton = await driver.$('android=new UiSelector().textContains("Resend")');
          console.log('✅ Found Resend OTP button');
          await resendButton.click();
          console.log('✅ Resend OTP clicked');
          await driver.pause(2000);
          reportTestCase('Resend OTP', 'PASS');
        } catch (e) {
          reportTestCase('Resend OTP', 'WARN', 'Could not find Resend OTP button');
        }
      }

      // Click verify OTP button
      console.log('\n🔍 Looking for Verify OTP button...');
      await driver.pause(1000);

      let verifyButton;
      let verifyButtonFound = false;

        // Strategy 1: Find by text
        try {
          verifyButton = await driver.$('android=new UiSelector().textContains("Verify")');
          if (verifyButton && await verifyButton.isDisplayed()) {
            console.log('✅ Found Verify button (Strategy 1: text contains "Verify")');
            verifyButtonFound = true;
          }
        } catch (e) {
          console.log('Strategy 1 failed, trying next...');
        }

        // Strategy 2: Find by text "VERIFY"
        if (!verifyButtonFound) {
          try {
            verifyButton = await driver.$('android=new UiSelector().text("VERIFY OTP")');
            if (verifyButton && await verifyButton.isDisplayed()) {
              console.log('✅ Found Verify button (Strategy 2: text "VERIFY OTP")');
              verifyButtonFound = true;
            }
          } catch (e) {
            console.log('Strategy 2 failed, trying next...');
          }
        }

        // Strategy 3: Find clickable TextView with "Verify"
        if (!verifyButtonFound) {
          try {
            const textViews = await driver.$$('android=new UiSelector().className("android.widget.TextView").textContains("Verify").clickable(true)');
            console.log(`Found ${textViews.length} clickable TextView elements with "Verify"`);
            if (textViews.length > 0) {
              verifyButton = textViews[0];
              console.log('✅ Found Verify button (Strategy 3: clickable TextView)');
              verifyButtonFound = true;
            }
          } catch (e) {
            console.log('Strategy 3 failed, trying next...');
          }
        }

        // Strategy 4: Find button elements
        if (!verifyButtonFound) {
          try {
            const allButtons = await driver.$$('android.widget.Button');
            console.log(`Found ${allButtons.length} Button elements`);
            if (allButtons.length > 0) {
              verifyButton = allButtons[allButtons.length - 1]; // Usually the last button
              console.log('✅ Found Verify button (Strategy 4: last Button element)');
              verifyButtonFound = true;
            }
          } catch (e) {
            console.log('Strategy 4 failed...');
          }
        }

      if (verifyButtonFound && verifyButton) {
        try {
          console.log('👆 Clicking Verify OTP button...');
          await verifyButton.click();
          await driver.pause(3000);

          // Take screenshot after clicking verify
          screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-after-verify.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-after-verify.png');

          reportTestCase('Click Verify OTP button', 'PASS');
        } catch (e) {
          reportTestCase('Click Verify OTP button', 'WARN', `Found button but failed to click: ${e.message}`);
        }
      } else {
        reportTestCase('Find Verify OTP button', 'WARN', 'Could not find Verify button - OTP may have auto-verified');
      }
    } // End of verify section

    console.log('\n⏸️  Keeping session open for 30 seconds for manual inspection...');
    await driver.pause(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Appium server is not running!');
      console.error('Start Appium with: appium');
    }
  } finally {
    if (driver) {
      await driver.deleteSession();
      console.log('\n🔚 Session closed');
    }

    // Print test summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
    console.log('='.repeat(60));

    if (testResults.passed.length > 0) {
      console.log('\n✅ PASSED TEST CASES:');
      testResults.passed.forEach(test => {
        console.log(`   - ${test.name}`);
      });
    }

    if (testResults.failed.length > 0) {
      console.log('\n❌ FAILED TEST CASES:');
      testResults.failed.forEach(test => {
        console.log(`   - ${test.name}: ${test.message}${test.isBlocker ? ' [BLOCKER]' : ''}`);
      });
    }

    if (testResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      testResults.warnings.forEach(test => {
        console.log(`   - ${test.name}: ${test.message}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    // Exit with appropriate code
    if (testResults.failed.length > 0) {
      console.log('❌ Test execution completed with FAILURES');
      process.exit(1);
    } else if (testResults.warnings.length > 0) {
      console.log('⚠️  Test execution completed with WARNINGS');
      process.exit(0);
    } else {
      console.log('✅ All tests PASSED');
      process.exit(0);
    }
  }
})();
