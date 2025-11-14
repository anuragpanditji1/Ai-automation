const { remote } = require('webdriverio');
const { performLogin, takeScreenshot } = require('./appium-clinikally-utils');

// TEST CONFIGURATION
// TODO: Configure these values based on actual test requirements
const TEST_CONFIG = {
  productSearchTerm: 'YOUR_PRODUCT_NAME_HERE', // TODO: Set product name to search
  phoneNumber: '9818106744', // Phone number for login
  otp: '123456', // OTP for login

  // Address details - TODO: Configure actual address
  address: {
    name: 'Test User',
    phone: '9818106744',
    addressLine1: 'Test Address Line 1',
    addressLine2: 'Test Address Line 2',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456'
  },

  // Coordinates - TODO: Update based on actual UI
  buyNowCoordinates: { x: 540, y: 1800 },
  addressSelectCoordinates: { x: 540, y: 1000 },
  continueToPaymentCoordinates: { x: 540, y: 2000 },
  paymentMethodCoordinates: { x: 540, y: 1500 },

  completePayment: false // Set to true to complete payment, false to stop before
};

const TEST_MODE = process.argv[2] || 'full'; // Options: 'full', 'buy-now', 'login', 'address', 'review', 'payment'

const shouldBuyNow = TEST_MODE === 'full' || TEST_MODE.includes('buy');
const shouldLogin = TEST_MODE === 'full' || TEST_MODE.includes('login');
const shouldSelectAddress = TEST_MODE === 'full' || TEST_MODE.includes('address');
const shouldReview = TEST_MODE === 'full' || TEST_MODE.includes('review');
const shouldPayment = TEST_MODE === 'full' || TEST_MODE.includes('payment');

console.log(`🔧 Test Mode: ${TEST_MODE}`);
console.log(`   Buy Now: ${shouldBuyNow ? '✅' : '❌'}`);
console.log(`   Login: ${shouldLogin ? '✅' : '❌'}`);
console.log(`   Address Selection: ${shouldSelectAddress ? '✅' : '❌'}`);
console.log(`   Review Page: ${shouldReview ? '✅' : '❌'}`);
console.log(`   Payment: ${shouldPayment ? '✅' : '❌'}\n`);

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
  console.log('🛒 Starting Checkout Test for GUEST USER (Buy Now Flow)...\n');

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

    await driver.pause(3000);

    const fs = require('fs');

    // STEP 1: Search and click Buy Now
    if (shouldBuyNow) {
      console.log('\n📄 TEST CASE: Search product and click Buy Now\n');

      try {
        console.log(`🔍 Searching for product: ${TEST_CONFIG.productSearchTerm}`);

        // TODO: Implement product search
        const searchBox = await driver.$('android.widget.EditText');
        if (searchBox && await searchBox.isDisplayed()) {
          await searchBox.click();
          await driver.pause(500);
          await searchBox.setValue(TEST_CONFIG.productSearchTerm);
          await driver.pause(2000);

          console.log('✅ Product search query entered');

          // Take screenshot
          let screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-guest-search.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-guest-search.png');

          reportTestCase('Search Product', 'PASS');
        } else {
          reportTestCase('Find Search Box', 'WARN', 'Search box not found - update test configuration');
        }

        // TODO: Click on product
        console.log('\n🔍 Selecting product from results...');
        console.log('⚠️  TODO: Configure product selection coordinates');

        // TODO: Click Buy Now button
        console.log('\n🛒 Clicking Buy Now button...');
        console.log('⚠️  TODO: Configure Buy Now button coordinates');

        reportTestCase('Click Buy Now', 'WARN', 'Buy Now button needs configuration');

      } catch (e) {
        const isBlocker = reportTestCase('Buy Now Flow', 'FAIL', e.message, true);
        if (isBlocker) return;
      }
    }

    // STEP 2: Login (reuse shared login utility)
    if (shouldLogin) {
      console.log('\n📄 TEST CASE: Guest Login for Checkout\n');

      const loginSuccess = await performLogin(
        driver,
        TEST_CONFIG.phoneNumber,
        TEST_CONFIG.otp,
        reportTestCase
      );

      if (!loginSuccess) {
        const isBlocker = reportTestCase('Guest Login', 'FAIL', 'Login failed', true);
        if (isBlocker) return;
      }
    }

    // STEP 3: Address Selection
    if (shouldSelectAddress) {
      console.log('\n📄 TEST CASE: Select delivery address\n');

      try {
        console.log('📍 Selecting delivery address...');

        // Check if address already exists or need to add new
        const pageSource = await driver.getPageSource();

        if (pageSource.includes('Add') && pageSource.includes('Address')) {
          console.log('➕ Need to add new address');
          console.log('⚠️  TODO: Configure Add Address flow');
          reportTestCase('Add New Address', 'WARN', 'Add address flow needs configuration');
        } else {
          console.log('✅ Selecting existing address');
          console.log('⚠️  TODO: Configure address selection coordinates');
          reportTestCase('Select Existing Address', 'WARN', 'Address selection needs configuration');
        }

        // Take screenshot
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-guest-address.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-guest-address.png');

      } catch (e) {
        const isBlocker = reportTestCase('Select Address', 'FAIL', e.message, false);
      }
    }

    // STEP 4: Review Page
    if (shouldReview) {
      console.log('\n📄 TEST CASE: Review order details\n');

      try {
        console.log('📋 Reviewing order...');

        // TODO: Verify order details on review page
        const pageSource = await driver.getPageSource();

        console.log('⚠️  TODO: Verify product details on review page');
        console.log('⚠️  TODO: Verify delivery address on review page');
        console.log('⚠️  TODO: Verify order total on review page');

        reportTestCase('Review Order', 'WARN', 'Order review verification needs configuration');

        // Take screenshot
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-guest-review.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-guest-review.png');

        // TODO: Click Continue to Payment
        console.log('\n💳 Proceeding to payment...');
        console.log('⚠️  TODO: Configure Continue to Payment button coordinates');

        reportTestCase('Continue to Payment', 'WARN', 'Payment button needs configuration');

      } catch (e) {
        const isBlocker = reportTestCase('Review Order', 'FAIL', e.message, false);
      }
    }

    // STEP 5: Payment Page
    if (shouldPayment) {
      console.log('\n📄 TEST CASE: Payment page\n');

      try {
        console.log('💰 On payment page...');

        console.log('⚠️  TODO: Configure payment method selection');

        if (TEST_CONFIG.completePayment) {
          console.log('⚠️  Payment completion is enabled - review before running!');
          console.log('⚠️  TODO: Add payment completion logic');
        } else {
          console.log('ℹ️  Payment completion is disabled - stopping before payment');
        }

        // Take screenshot
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-guest-payment.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-guest-payment.png');

        reportTestCase('Payment Page', 'WARN', 'Payment page needs configuration');

      } catch (e) {
        reportTestCase('Payment Page', 'WARN', e.message);
      }
    }

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
      console.log('⚠️  Test execution completed with WARNINGS (needs configuration)');
      process.exit(0);
    } else {
      console.log('✅ All tests PASSED');
      process.exit(0);
    }
  }
})();
