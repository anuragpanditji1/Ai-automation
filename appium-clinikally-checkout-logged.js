const { remote } = require('webdriverio');
const { ensureLoggedIn, takeScreenshot } = require('./appium-clinikally-utils');

// TEST CONFIGURATION
// TODO: Configure these values based on actual test requirements
const TEST_CONFIG = {
  // Login credentials (in case user is not logged in)
  phoneNumber: '9818106744',
  otp: '123456',

  // Product selection
  productSearchTerm: 'YOUR_PRODUCT_NAME_HERE', // TODO: Set product name to search
  productCoordinates: { x: 540, y: 800 }, // TODO: Update coordinates if needed
  addToCartCoordinates: { x: 540, y: 1800 }, // TODO: Update coordinates
  viewCartCoordinates: { x: 540, y: 2100 }, // TODO: Update coordinates
  checkoutButtonCoordinates: { x: 540, y: 2000 }, // TODO: Update coordinates
  paymentMethodCoordinates: { x: 540, y: 1500 }, // TODO: Update coordinates
  completePayment: false // Set to true to complete payment, false to stop before
};

const TEST_MODE = process.argv[2] || 'full'; // Options: 'full', 'add-to-cart', 'view-cart', 'checkout', 'payment'

const shouldAddToCart = TEST_MODE === 'full' || TEST_MODE.includes('add');
const shouldViewCart = TEST_MODE === 'full' || TEST_MODE.includes('view');
const shouldCheckout = TEST_MODE === 'full' || TEST_MODE.includes('checkout');
const shouldPayment = TEST_MODE === 'full' || TEST_MODE.includes('payment');

console.log(`🔧 Test Mode: ${TEST_MODE}`);
console.log(`   Add to Cart: ${shouldAddToCart ? '✅' : '❌'}`);
console.log(`   View Cart: ${shouldViewCart ? '✅' : '❌'}`);
console.log(`   Checkout: ${shouldCheckout ? '✅' : '❌'}`);
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
  console.log('🛒 Starting Checkout Test for LOGGED USER...\n');

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

    // PREREQUISITE: Ensure user is logged in
    console.log('\n📄 PREREQUISITE: Ensure user is logged in\n');
    const loginSuccess = await ensureLoggedIn(
      driver,
      TEST_CONFIG.phoneNumber,
      TEST_CONFIG.otp,
      reportTestCase
    );

    if (!loginSuccess) {
      const isBlocker = reportTestCase('Ensure Logged In', 'FAIL', 'Login failed', true);
      if (isBlocker) return;
    }

    // STEP 1: Search and select product
    if (shouldAddToCart) {
      console.log('\n📄 TEST CASE: Search and add product to cart\n');

      // TODO: Implement product search
      try {
        console.log(`🔍 Searching for product: ${TEST_CONFIG.productSearchTerm}`);

        // Find search box
        const searchBox = await driver.$('android.widget.EditText');
        if (searchBox && await searchBox.isDisplayed()) {
          await searchBox.click();
          await driver.pause(500);
          await searchBox.setValue(TEST_CONFIG.productSearchTerm);
          await driver.pause(2000);

          console.log('✅ Product search query entered');

          // Take screenshot
          const fs = require('fs');
          let screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-checkout-search.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-checkout-search.png');

          reportTestCase('Search Product', 'PASS');
        } else {
          reportTestCase('Find Search Box', 'WARN', 'Search box not found - update test configuration');
        }

        // TODO: Click on product from search results
        console.log('\n🔍 Selecting product from results...');
        console.log('⚠️  TODO: Configure product selection coordinates');

        reportTestCase('Select Product', 'WARN', 'Product selection needs configuration');

        // TODO: Click Add to Cart
        console.log('\n🛒 Adding product to cart...');
        console.log('⚠️  TODO: Configure Add to Cart button coordinates');

        reportTestCase('Add to Cart', 'WARN', 'Add to cart needs configuration');

      } catch (e) {
        const isBlocker = reportTestCase('Add Product to Cart', 'FAIL', e.message, true);
        if (isBlocker) return;
      }
    }

    // STEP 2: View Cart
    if (shouldViewCart) {
      console.log('\n📄 TEST CASE: View cart\n');

      try {
        console.log('🛒 Opening cart...');
        console.log('⚠️  TODO: Configure View Cart button coordinates');

        // TODO: Click on cart icon/button

        reportTestCase('View Cart', 'WARN', 'View cart needs configuration');

        // Take screenshot
        const fs = require('fs');
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-checkout-cart.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-checkout-cart.png');

      } catch (e) {
        const isBlocker = reportTestCase('View Cart', 'FAIL', e.message, false);
      }
    }

    // STEP 3: Proceed to Checkout
    if (shouldCheckout) {
      console.log('\n📄 TEST CASE: Proceed to checkout\n');

      try {
        console.log('💳 Clicking Checkout button...');
        console.log('⚠️  TODO: Configure Checkout button coordinates');

        // TODO: Click checkout button

        reportTestCase('Proceed to Checkout', 'WARN', 'Checkout button needs configuration');

        // Take screenshot
        const fs = require('fs');
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-checkout-page.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-checkout-page.png');

      } catch (e) {
        const isBlocker = reportTestCase('Proceed to Checkout', 'FAIL', e.message, false);
      }
    }

    // STEP 4: Payment
    if (shouldPayment) {
      console.log('\n📄 TEST CASE: Select payment method\n');

      try {
        console.log('💰 Selecting payment method...');
        console.log('⚠️  TODO: Configure payment method selection');

        if (TEST_CONFIG.completePayment) {
          console.log('⚠️  Payment completion is enabled - review before running!');
        } else {
          console.log('ℹ️  Payment completion is disabled - stopping before payment');
        }

        reportTestCase('Select Payment Method', 'WARN', 'Payment method selection needs configuration');

        // Take screenshot
        const fs = require('fs');
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-checkout-payment.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-checkout-payment.png');

      } catch (e) {
        reportTestCase('Select Payment Method', 'WARN', e.message);
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
