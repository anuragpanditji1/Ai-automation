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
      console.log('🔍 Looking for phone number input field...\n');

      // Try multiple strategies to find the phone number input field
      let phoneInput;

    try {
      // Strategy 1: Find by EditText class
      const editTexts = await driver.$$('android.widget.EditText');
      console.log(`Found ${editTexts.length} EditText fields`);

      if (editTexts.length > 0) {
        phoneInput = editTexts[0]; // Usually the first one is the phone number
        console.log('✅ Found phone input field (Strategy 1: EditText)');
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
      console.log('📝 Clicking on phone number field...');
      await phoneInput.click();
      await driver.pause(500);

      console.log('⌨️  Entering phone number: 9818106744...');
      await phoneInput.setValue('9818106744');

      await driver.pause(1000);

      // Verify the value was entered
      const enteredValue = await phoneInput.getText();
      console.log('✅ Phone number entered:', enteredValue || '9818106744');

      // Take screenshot after entering number
      let screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      fs.writeFileSync('/tmp/clinikally-login-with-number.png', screenshot, 'base64');
      console.log('📸 Screenshot saved to /tmp/clinikally-login-with-number.png');

      // Dismiss keyboard first
      try {
        console.log('⌨️  Hiding keyboard...');
        await driver.hideKeyboard();
        await driver.pause(500);
        console.log('✅ Keyboard hidden');
      } catch (e) {
        console.log('⚠️  Keyboard already hidden or not found');
      }

      // PAGE 1: Click "Request OTP" button
      console.log('\n📄 PAGE 1: Looking for Request OTP button...');
      await driver.pause(1000);

      let requestOtpButton;
      let foundRequestButton = false;

      // Strategy 1: Find by text "Request OTP" (must be clickable)
      try {
        const elements = await driver.$$('android=new UiSelector().textContains("Request").clickable(true)');
        if (elements.length > 0) {
          requestOtpButton = elements[0];
          console.log('✅ Found Request OTP button (Strategy 1: text contains "Request")');
          foundRequestButton = true;
        }
      } catch (e) {
        console.log('Strategy 1 failed, trying next...');
      }

      // Strategy 2: Find by text "Get OTP" (must be clickable)
      if (!foundRequestButton) {
        try {
          const elements = await driver.$$('android=new UiSelector().textContains("Get").clickable(true)');
          if (elements.length > 0) {
            requestOtpButton = elements[0];
            console.log('✅ Found Request OTP button (Strategy 2: text contains "Get")');
            foundRequestButton = true;
          }
        } catch (e) {
          console.log('Strategy 2 failed, trying next...');
        }
      }

      // Strategy 3: Find clickable TextView/Button with "OTP"
      if (!foundRequestButton) {
        try {
          const elements = await driver.$$('android=new UiSelector().textMatches(".*OTP.*").clickable(true)');
          if (elements.length > 0) {
            requestOtpButton = elements[0];
            console.log('✅ Found Request OTP button (Strategy 3: clickable with "OTP")');
            foundRequestButton = true;
          }
        } catch (e) {
          console.log('Strategy 3 failed, trying next...');
        }
      }

      // Strategy 4: Use coordinates as fallback
      if (!foundRequestButton) {
        console.log('⚠️  Could not find Request OTP button by text, using coordinates...');
        console.log('👆 Clicking Request OTP at coordinates (918, 1710)...');

        try {
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
          await driver.pause(3000);
          console.log('✅ Request OTP clicked at coordinates (918, 1710)');

          // Take screenshot after requesting OTP
          screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-request-otp.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-request-otp.png');
        } catch (e) {
          console.log('❌ Error clicking Request OTP:', e.message);
        }
      } else {
        // Click the Request OTP button if found
        try {
          console.log('👆 Clicking Request OTP button...');
          await requestOtpButton.click();
          await driver.pause(3000); // Wait for OTP page
          console.log('✅ Request OTP button clicked successfully');

          // Take screenshot after requesting OTP
          screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-request-otp.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-request-otp.png');
        } catch (e) {
          console.log('❌ Error clicking Request OTP button:', e.message);
        }
      }
      } // End of if (phoneInput)
    } // End of phone entry section

    // OTP ENTRY SECTION - PAGE 2
    if (shouldRunOtpEntry) {
      // Verify OTP page
      console.log('\n📄 PAGE 2: OTP Verification Page');
      console.log('🔍 Verifying OTP page...');
      let screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      fs.writeFileSync('/tmp/clinikally-otp-page.png', screenshot, 'base64');
      console.log('📸 Screenshot saved to /tmp/clinikally-otp-page.png');

      // Look for OTP input fields
      console.log('🔍 Looking for OTP input fields...');
      const otpFields = await driver.$$('android.widget.EditText');
      console.log(`Found ${otpFields.length} EditText fields on OTP page`);

      // Enter OTP at specific coordinates [99,892][229,1036]
      console.log('\n⌨️  Entering OTP: 123456 at coordinates...');

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

      } catch (e) {
        console.log('❌ Error entering OTP:', e.message);
      }
    } // End of OTP entry section

    // VERIFY OTP SECTION - PAGE 2
    if (shouldRunVerify) {
      console.log('\n📄 PAGE 2: Verify/Resend OTP');

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
        } catch (e) {
          console.log('⚠️  Could not find Resend OTP button');
        }
      }

      // Click verify OTP button
      console.log('\n🔍 Looking for Verify OTP button...');
      await driver.pause(1000);

      let verifyButton;

        // Strategy 1: Find by text
        try {
          verifyButton = await driver.$('android=new UiSelector().textContains("Verify")');
          console.log('✅ Found Verify button (Strategy 1: text contains "Verify")');
        } catch (e) {
          console.log('Strategy 1 failed, trying next...');
        }

        // Strategy 2: Find by text "VERIFY"
        if (!verifyButton) {
          try {
            verifyButton = await driver.$('android=new UiSelector().text("VERIFY OTP")');
            console.log('✅ Found Verify button (Strategy 2: text "VERIFY OTP")');
          } catch (e) {
            console.log('Strategy 2 failed, trying next...');
          }
        }

        // Strategy 3: Find button elements
        if (!verifyButton) {
          try {
            const allButtons = await driver.$$('android.widget.Button');
            console.log(`Found ${allButtons.length} Button elements`);
            if (allButtons.length > 0) {
              verifyButton = allButtons[allButtons.length - 1]; // Usually the last button
              console.log('✅ Found Verify button (Strategy 3: last Button element)');
            }
          } catch (e) {
            console.log('Strategy 3 failed...');
          }
        }

      if (verifyButton) {
        console.log('👆 Clicking Verify OTP button...');
        await verifyButton.click();
        await driver.pause(3000);

        // Take screenshot after clicking verify
        const screenshot = await driver.takeScreenshot();
        const fs = require('fs');
        fs.writeFileSync('/tmp/clinikally-after-verify.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-after-verify.png');
        console.log('✅ Verify OTP button clicked successfully!');
      } else {
        console.log('❌ Could not find Verify OTP button');
      }
    } // End of verify section

    console.log('\n⏸️  Keeping session open for 10 seconds for manual inspection...');
    await driver.pause(10000);

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
  }
})();
