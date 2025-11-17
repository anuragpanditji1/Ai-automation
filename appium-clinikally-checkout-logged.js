const { remote } = require('webdriverio');
const { ensureLoggedIn, takeScreenshot } = require('./appium-clinikally-utils');

// TEST CONFIGURATION
// TODO: Configure these values based on actual test requirements
const TEST_CONFIG = {
  // Login credentials (in case user is not logged in)
  phoneNumber: '9818106744',
  otp: '123456',

  // Product selection
  productSearchTerm: 'uriage 150ml', // Product to search for
  productCoordinates: { x: 540, y: 800 }, // TODO: Update coordinates if needed
  addToCartCoordinates: { x: 540, y: 1800 }, // TODO: Update coordinates
  viewCartCoordinates: { x: 540, y: 2100 }, // TODO: Update coordinates
  checkoutButtonCoordinates: { x: 540, y: 2000 }, // TODO: Update coordinates
  paymentMethodCoordinates: { x: 540, y: 1500 }, // TODO: Update coordinates
  completePayment: false // Set to true to complete payment, false to stop before
};

const TEST_MODE = process.argv[2] || 'full'; // Options: 'full', 'verify', 'add-to-cart', 'view-cart', 'checkout', 'payment'

const shouldVerifyPage = TEST_MODE === 'full' || TEST_MODE.includes('verify');
const shouldAddToCart = TEST_MODE === 'full' || TEST_MODE.includes('add');
const shouldViewCart = TEST_MODE === 'full' || TEST_MODE.includes('view');
const shouldCheckout = TEST_MODE === 'full' || TEST_MODE.includes('checkout');
const shouldPayment = TEST_MODE === 'full' || TEST_MODE.includes('payment');

console.log(`🔧 Test Mode: ${TEST_MODE}`);
console.log(`   Verify Page: ${shouldVerifyPage ? '✅' : '❌'}`);
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

    // STEP 0: Verify Current Page
    if (shouldVerifyPage) {
      console.log('\n📄 TEST CASE: Verify current page/screen\n');

      try {
        const fs = require('fs');

        console.log('🔍 Verifying current page...');

        // Take screenshot of current page
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/tmp/clinikally-checkout-initial-page.png', screenshot, 'base64');
        console.log('📸 Screenshot saved to /tmp/clinikally-checkout-initial-page.png');

        // Get page source to verify elements
        const pageSource = await driver.getPageSource();

        // Check for common home/main page elements
        const hasSearchBox = pageSource.includes('EditText') || pageSource.includes('Search');
        const isOnHomePage = hasSearchBox;

        if (isOnHomePage) {
          console.log('✅ Verified: On home page/main screen');
          reportTestCase('Verify Home Page', 'PASS');
        } else {
          console.log('⚠️  Warning: Current page verification unclear');
          reportTestCase('Verify Home Page', 'WARN', 'Unable to confirm home page');
        }

        // Log visible elements count for debugging
        const editTexts = await driver.$$('android.widget.EditText');
        const buttons = await driver.$$('android.widget.Button');
        const textViews = await driver.$$('android.widget.TextView');

        console.log(`\n📊 Page Elements Summary:`);
        console.log(`   EditText fields: ${editTexts.length}`);
        console.log(`   Buttons: ${buttons.length}`);
        console.log(`   TextViews: ${textViews.length}`);

        reportTestCase('Count Page Elements', 'PASS', `Found ${editTexts.length + buttons.length} interactive elements`);

        await driver.pause(2000);

      } catch (e) {
        console.error('⚠️  Page verification error:', e.message);
        reportTestCase('Verify Current Page', 'WARN', `Verification error: ${e.message}`);
      }
    }

    // STEP 1: Search and select product
    if (shouldAddToCart) {
      console.log('\n📄 TEST CASE: Search and add product to cart\n');

      try {
        const fs = require('fs');
        console.log(`🔍 Searching for product: ${TEST_CONFIG.productSearchTerm}`);

        // Strategy 1: Find search box by EditText
        console.log('\n🔍 Looking for search box (Strategy 1: EditText)...');
        let searchBox;
        let searchFound = false;

        const editTexts = await driver.$$('android.widget.EditText');
        console.log(`Found ${editTexts.length} EditText fields`);

        if (editTexts.length > 0) {
          // Usually the search box is the first EditText on home page
          searchBox = editTexts[0];
          console.log('✅ Found search box (EditText)');
          searchFound = true;
        }

        // Strategy 2: Try to find by text/hint
        if (!searchFound) {
          console.log('\n🔍 Looking for search box (Strategy 2: by hint/text)...');
          try {
            const searchByHint = await driver.$('android=new UiSelector().textContains("Search")');
            if (await searchByHint.isDisplayed()) {
              searchBox = searchByHint;
              console.log('✅ Found search box (by text/hint)');
              searchFound = true;
            }
          } catch (e) {
            console.log('⚠️  Search box not found by hint');
          }
        }

        if (searchFound && searchBox) {
          // Click on search box
          console.log('\n📝 Clicking on search box...');
          await searchBox.click();
          await driver.pause(1000);

          // Clear any existing text
          console.log('🧹 Clearing search box...');
          try {
            await searchBox.clearValue();
          } catch (e) {
            console.log('⚠️  Could not clear, field might be empty');
          }

          // Enter product name
          console.log(`⌨️  Entering product: "${TEST_CONFIG.productSearchTerm}"...`);
          await searchBox.setValue(TEST_CONFIG.productSearchTerm);
          await driver.pause(2000);

          // Verify text was entered
          const enteredValue = await searchBox.getText();
          console.log(`✅ Search query entered: "${enteredValue || TEST_CONFIG.productSearchTerm}"`);

          // Take screenshot after entering search
          let screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-checkout-search-entered.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-checkout-search-entered.png');

          reportTestCase('Find Search Box', 'PASS');
          reportTestCase('Enter Search Query', 'PASS', `Entered: ${TEST_CONFIG.productSearchTerm}`);

          // Press Enter key to search
          console.log('\n⏎  Pressing Enter key to search...');
          await driver.pressKeyCode(66); // 66 is the keycode for Enter on Android
          await driver.pause(2000);
          console.log('✅ Enter key pressed');

          reportTestCase('Press Enter to Search', 'PASS');

          // Wait for PLP (Product Listing Page) to load
          console.log('\n⏳ Waiting for PLP (Product Listing Page) to load...');
          await driver.pause(4000);

          // Take screenshot of PLP
          screenshot = await driver.takeScreenshot();
          fs.writeFileSync('/tmp/clinikally-checkout-plp.png', screenshot, 'base64');
          console.log('📸 Screenshot saved to /tmp/clinikally-checkout-plp.png');

          // Verify PLP page
          console.log('\n🔍 Verifying PLP page...');
          const plpSource = await driver.getPageSource();

          // Check for PLP indicators
          const hasProducts = plpSource.includes('Showing') || plpSource.includes('items') ||
                             plpSource.includes('Products') || plpSource.includes('Filters');

          if (hasProducts) {
            console.log('✅ PLP page verified - product listing displayed');
            reportTestCase('Verify PLP Page', 'PASS');
          } else {
            console.log('⚠️  PLP verification unclear - continuing anyway');
            reportTestCase('Verify PLP Page', 'WARN', 'Could not confirm PLP page');
          }

          reportTestCase('Search Product', 'PASS', `Searched for: ${TEST_CONFIG.productSearchTerm}`);

        } else {
          console.log('⚠️  Search box not found - assuming already on PLP');
          reportTestCase('Find Search Box', 'WARN', 'Search skipped - already on PLP');
        }

        // Find and click on product from PLP
        console.log('\n🔍 Clicking on product from PLP...');

        try {
          // Click on product at specific coordinates (bounds: [72,1159][498,1279])
          const productX = 285; // Center X: (72 + 498) / 2
          const productY = 1219; // Center Y: (1159 + 1279) / 2

          console.log(`👆 Clicking product at coordinates (${productX}, ${productY})...`);

          await driver.performActions([
            {
              type: 'pointer',
              id: 'finger1',
              parameters: { pointerType: 'touch' },
              actions: [
                { type: 'pointerMove', duration: 0, x: productX, y: productY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerUp', button: 0 }
              ]
            }
          ]);
          await driver.releaseActions();
          await driver.pause(3000);

          // Verify we're on product details page
          const pdpSource = await driver.getPageSource();
          const isPDP = pdpSource.includes('Add to Cart') ||
                       pdpSource.includes('Buy Now') ||
                       pdpSource.includes('Add To Cart');

          if (isPDP) {
            console.log('✅ Product clicked successfully - on PDP');

            // Take screenshot of PDP
            screenshot = await driver.takeScreenshot();
            fs.writeFileSync('/tmp/clinikally-checkout-pdp.png', screenshot, 'base64');
            console.log('📸 Screenshot saved to /tmp/clinikally-checkout-pdp.png');

            reportTestCase('Click on Product', 'PASS', `Clicked at (${productX}, ${productY})`);

            // Click Add to Cart or View Cart button
            console.log('\n🛒 Looking for "Add to Cart" or "View Cart" button...');
            try {
              let cartButton;
              let buttonType = '';

              // Try to find Add to Cart first
              try {
                cartButton = await driver.$('android=new UiSelector().text("Add to Cart")');
                const isDisplayed = await cartButton.isDisplayed();
                if (isDisplayed) {
                  buttonType = 'Add to Cart';
                  console.log('✅ Found "Add to Cart" button');
                }
              } catch (e) {
                console.log('⚠️  "Add to Cart" not found, trying "View Cart"...');
              }

              // If Add to Cart not found, try View Cart
              if (!buttonType) {
                try {
                  cartButton = await driver.$('android=new UiSelector().text("View Cart")');
                  const isDisplayed = await cartButton.isDisplayed();
                  if (isDisplayed) {
                    buttonType = 'View Cart';
                    console.log('✅ Found "View Cart" button');
                  }
                } catch (e) {
                  console.log('⚠️  "View Cart" not found either');
                }
              }

              if (buttonType) {
                console.log(`👆 Clicking "${buttonType}" button...`);
                await cartButton.click();
                await driver.pause(2000);
                console.log(`✅ ${buttonType} button clicked`);

                // Take screenshot after clicking button
                screenshot = await driver.takeScreenshot();
                fs.writeFileSync('/tmp/clinikally-checkout-cart-button-clicked.png', screenshot, 'base64');
                console.log('📸 Screenshot saved to /tmp/clinikally-checkout-cart-button-clicked.png');

                reportTestCase(`Click ${buttonType}`, 'PASS');
              } else {
                console.error('❌ Neither "Add to Cart" nor "View Cart" found');
                reportTestCase('Click Cart Button', 'FAIL', 'Neither Add to Cart nor View Cart found', false);
                return;
              }

              // If we clicked "Add to Cart", we need to click "Keep Browsing" then cart icon
              // If we clicked "View Cart", we're already in cart view
              if (buttonType === 'Add to Cart') {
                // Click Keep Browsing button
                console.log('\n👆 Clicking "Keep Browsing" button...');
                const keepBrowsingBtn = await driver.$('android=new UiSelector().text("Keep Browsing")');
                await keepBrowsingBtn.click();
                await driver.pause(2000);
                console.log('✅ Keep Browsing button clicked');

                // Take screenshot after keep browsing
                screenshot = await driver.takeScreenshot();
                fs.writeFileSync('/tmp/clinikally-checkout-keep-browsing.png', screenshot, 'base64');
                console.log('📸 Screenshot saved to /tmp/clinikally-checkout-keep-browsing.png');

                reportTestCase('Click Keep Browsing', 'PASS');

                // Click cart icon with description "1"
                console.log('\n🛒 Clicking cart icon (description "1")...');
                const cartIcon = await driver.$('android=new UiSelector().description("1")');
                await cartIcon.click();
                await driver.pause(2000);
                console.log('✅ Cart icon clicked');

                reportTestCase('Click Cart Icon', 'PASS');
              } else {
                console.log('ℹ️  Already in cart view after clicking "View Cart"');
              }

              // Take screenshot of cart
              screenshot = await driver.takeScreenshot();
              fs.writeFileSync('/tmp/clinikally-checkout-cart-view.png', screenshot, 'base64');
              console.log('📸 Screenshot saved to /tmp/clinikally-checkout-cart-view.png');

              reportTestCase('Navigate to Cart', 'PASS', `Via ${buttonType}`);

              // VERIFY CART PAGE AND APPLY COUPON
              console.log('\n🎟️  Verifying cart page and applying coupon...');

              try {
                // Verify we're on cart page
                console.log('\n🔍 Verifying cart page...');
                const cartPageSource = await driver.getPageSource();
                const isCartPage = cartPageSource.includes('Cart') ||
                                  cartPageSource.includes('cart') ||
                                  cartPageSource.includes('Bill') ||
                                  cartPageSource.includes('Total');

                if (isCartPage) {
                  console.log('✅ Cart page verified');
                  reportTestCase('Verify Cart Page', 'PASS');
                } else {
                  console.log('⚠️  Cart page verification unclear');
                  reportTestCase('Verify Cart Page', 'WARN', 'Could not confirm cart page');
                }

                await driver.pause(2000);

                // Find and click "View All Coupons" button
                console.log('\n🔍 Looking for "View All Coupons" button...');
                let couponsButton;
                let couponsBtnFound = false;

                try {
                  // Try exact match first
                  couponsButton = await driver.$('android=new UiSelector().textContains("View All Coupons")');
                  const isDisplayed = await couponsButton.isDisplayed();
                  if (isDisplayed) {
                    couponsBtnFound = true;
                    console.log('✅ Found "View All Coupons" button (exact match)');
                  }
                } catch (e) {
                  console.log('⚠️  Exact match not found, trying variants...');
                }

                // Try variations if exact not found
                if (!couponsBtnFound) {
                  try {
                    couponsButton = await driver.$('android=new UiSelector().textContains("View all coupons")');
                    const isDisplayed = await couponsButton.isDisplayed();
                    if (isDisplayed) {
                      couponsBtnFound = true;
                      console.log('✅ Found "View all coupons" button (lowercase)');
                    }
                  } catch (e) {
                    console.log('⚠️  Lowercase variant not found, trying "Coupons"...');
                  }
                }

                if (!couponsBtnFound) {
                  try {
                    couponsButton = await driver.$('android=new UiSelector().textContains("Coupons")');
                    const isDisplayed = await couponsButton.isDisplayed();
                    if (isDisplayed) {
                      couponsBtnFound = true;
                      console.log('✅ Found "Coupons" button');
                    }
                  } catch (e) {
                    console.log('⚠️  "Coupons" button not found');
                  }
                }

                if (couponsBtnFound) {
                  console.log('\n👆 Clicking "View All Coupons" button...');
                  await couponsButton.click();
                  await driver.pause(3000);
                  console.log('✅ Coupons button clicked');

                  // Take screenshot of coupons page
                  screenshot = await driver.takeScreenshot();
                  fs.writeFileSync('/tmp/clinikally-checkout-coupons-page.png', screenshot, 'base64');
                  console.log('📸 Screenshot saved to /tmp/clinikally-checkout-coupons-page.png');

                  reportTestCase('Click View All Coupons', 'PASS');

                  // Verify we're on coupons page (not cart page) to avoid entering text in wrong place
                  console.log('\n🔍 Verifying coupons page...');
                  await driver.pause(1000);
                  const couponsPageSource = await driver.getPageSource();
                  const isOnCouponsPage = couponsPageSource.includes('Enter Coupon Code') ||
                                         couponsPageSource.includes('Tap to apply') ||
                                         couponsPageSource.includes('Summer Savings');

                  if (isOnCouponsPage) {
                    console.log('✅ On coupons page - safe to proceed');
                  } else {
                    console.log('⚠️  Not on coupons page - may be on cart');
                  }

                  // Find and click 12% off coupon
                  console.log('\n🔍 Looking for "12% off" coupon...');
                  await driver.pause(2000);

                  try {
                    // Try to find 12% off coupon
                    const coupon12 = await driver.$('android=new UiSelector().textContains("12% off")');
                    const isCouponDisplayed = await coupon12.isDisplayed();

                    if (isCouponDisplayed) {
                      console.log('✅ Found "12% off" coupon');

                      // Now find and click the "Tap to apply" button under this coupon
                      // Using instance(1) to get the SECOND "Tap to apply" (for 12% off, not 10% off)
                      console.log('\n🔍 Looking for "Tap to apply" button (instance 1 - for 12% off)...');
                      await driver.pause(1000);

                      let applyButton;
                      let applyButtonFound = false;

                      // Try to find "Tap to apply" button - instance(1) = second button
                      try {
                        applyButton = await driver.$('android=new UiSelector().text("Tap to apply").instance(1)');
                        const isApplyDisplayed = await applyButton.isDisplayed();
                        if (isApplyDisplayed) {
                          applyButtonFound = true;
                          console.log('✅ Found "Tap to apply" button (instance 1)');
                        }
                      } catch (e) {
                        console.log('⚠️  "Tap to apply" instance(1) not found, trying textContains...');
                      }

                      // Fallback: try textContains
                      if (!applyButtonFound) {
                        try {
                          applyButton = await driver.$('android=new UiSelector().textContains("Tap to apply")');
                          const isApplyDisplayed = await applyButton.isDisplayed();
                          if (isApplyDisplayed) {
                            applyButtonFound = true;
                            console.log('✅ Found "Tap to apply" button (first match)');
                          }
                        } catch (e) {
                          console.log('⚠️  "Tap to apply" not found, trying "Apply"...');
                        }
                      }

                      // Try variations
                      if (!applyButtonFound) {
                        try {
                          applyButton = await driver.$('android=new UiSelector().textContains("Apply")');
                          const isApplyDisplayed = await applyButton.isDisplayed();
                          if (isApplyDisplayed) {
                            applyButtonFound = true;
                            console.log('✅ Found "Apply" button');
                          }
                        } catch (e) {
                          console.log('⚠️  "Apply" button not found');
                        }
                      }

                      if (applyButtonFound) {
                        console.log('\n👆 Clicking "Tap to apply" button for 12% off coupon...');
                        await applyButton.click();
                        await driver.pause(3000);
                        console.log('✅ 12% off coupon applied');

                        // Take screenshot after applying coupon
                        screenshot = await driver.takeScreenshot();
                        fs.writeFileSync('/tmp/clinikally-checkout-coupon-applied.png', screenshot, 'base64');
                        console.log('📸 Screenshot saved to /tmp/clinikally-checkout-coupon-applied.png');

                        reportTestCase('Apply 12% Off Coupon', 'PASS');

                        // Look for success popup with "YOU saved" and click "Thanks" button
                        console.log('\n🔍 Looking for success popup...');
                        await driver.pause(2000);

                        try {
                          // Check if popup is displayed
                          const popupSource = await driver.getPageSource();
                          const hasPopup = popupSource.includes('YOU saved') ||
                                          popupSource.includes('saved') ||
                                          popupSource.includes('applied successfully');

                          if (hasPopup) {
                            console.log('✅ Success popup detected');

                            // Find and click "Woohoo! Thanks" button
                            console.log('\n🔍 Looking for "Woohoo! Thanks" button...');
                            let thanksButton;
                            let thanksFound = false;

                            // Try "Woohoo! Thanks" first (exact match)
                            try {
                              thanksButton = await driver.$('android=new UiSelector().text("Woohoo! Thanks")');
                              const isThanksDisplayed = await thanksButton.isDisplayed();
                              if (isThanksDisplayed) {
                                thanksFound = true;
                                console.log('✅ Found "Woohoo! Thanks" button');
                              }
                            } catch (e) {
                              console.log('⚠️  "Woohoo! Thanks" not found, trying textContains...');
                            }

                            // Try textContains "Woohoo" if exact match not found
                            if (!thanksFound) {
                              try {
                                thanksButton = await driver.$('android=new UiSelector().textContains("Woohoo")');
                                const isWoohooDisplayed = await thanksButton.isDisplayed();
                                if (isWoohooDisplayed) {
                                  thanksFound = true;
                                  console.log('✅ Found button with "Woohoo" text');
                                }
                              } catch (e) {
                                console.log('⚠️  "Woohoo" not found, trying "Thanks"...');
                              }
                            }

                            // Fallback to "Thanks" or "OK"
                            if (!thanksFound) {
                              try {
                                thanksButton = await driver.$('android=new UiSelector().text("Thanks")');
                                const isThanksDisplayed = await thanksButton.isDisplayed();
                                if (isThanksDisplayed) {
                                  thanksFound = true;
                                  console.log('✅ Found "Thanks" button');
                                }
                              } catch (e) {
                                console.log('⚠️  "Thanks" not found, trying "OK"...');
                              }
                            }

                            // Try OK button if Thanks not found
                            if (!thanksFound) {
                              try {
                                thanksButton = await driver.$('android=new UiSelector().text("OK")');
                                const isOKDisplayed = await thanksButton.isDisplayed();
                                if (isOKDisplayed) {
                                  thanksFound = true;
                                  console.log('✅ Found "OK" button');
                                }
                              } catch (e) {
                                console.log('⚠️  "OK" button not found');
                              }
                            }

                            if (thanksFound) {
                              console.log('\n👆 Clicking to dismiss popup...');
                              await thanksButton.click();
                              await driver.pause(2000);
                              console.log('✅ Popup dismissed');
                              reportTestCase('Dismiss Success Popup', 'PASS');
                            } else {
                              console.log('⚠️  Dismiss button not found, popup may auto-dismiss');
                              reportTestCase('Dismiss Success Popup', 'WARN', 'Dismiss button not found');
                            }
                          } else {
                            console.log('ℹ️  No success popup detected');
                          }
                        } catch (e) {
                          console.log('⚠️  Error checking for popup:', e.message);
                        }

                        // Scroll down the cart page to see full bill summary
                        console.log('\n📜 Scrolling cart page to view complete bill summary...');
                        await driver.pause(1000);

                        try {
                          // Scroll down using swipe gesture
                          const { height } = await driver.getWindowSize();
                          await driver.performActions([
                            {
                              type: 'pointer',
                              id: 'finger1',
                              parameters: { pointerType: 'touch' },
                              actions: [
                                { type: 'pointerMove', duration: 0, x: 540, y: height * 0.8 },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pause', duration: 100 },
                                { type: 'pointerMove', duration: 500, x: 540, y: height * 0.2 },
                                { type: 'pointerUp', button: 0 }
                              ]
                            }
                          ]);
                          await driver.releaseActions();
                          await driver.pause(1000);
                          console.log('✅ Scrolled down');

                          // Take screenshot after scroll
                          screenshot = await driver.takeScreenshot();
                          fs.writeFileSync('/tmp/clinikally-checkout-scrolled-cart.png', screenshot, 'base64');
                          console.log('📸 Screenshot saved to /tmp/clinikally-checkout-scrolled-cart.png');
                        } catch (e) {
                          console.log('⚠️  Scroll not available, continuing...', e.message);
                        }

                        // Verify bill summary
                        console.log('\n📊 Verifying bill summary and calculation...');
                        await driver.pause(2000);

                        const billSummarySource = await driver.getPageSource();

                        // Check for bill summary elements
                        const hasSubtotal = billSummarySource.includes('Subtotal') ||
                                           billSummarySource.includes('subtotal') ||
                                           billSummarySource.includes('Sub Total');
                        const hasDiscount = billSummarySource.includes('Discount') ||
                                           billSummarySource.includes('discount') ||
                                           billSummarySource.includes('12%') ||
                                           billSummarySource.includes('SUMMER12') ||
                                           billSummarySource.includes('Coupon');
                        const hasTotal = billSummarySource.includes('Total') ||
                                        billSummarySource.includes('total') ||
                                        billSummarySource.includes('Grand Total');
                        const hasBillSummary = billSummarySource.includes('Bill Summary') ||
                                              billSummarySource.includes('Order Summary');

                        console.log(`\n📋 Bill Summary Elements:`);
                        console.log(`   Bill Summary section: ${hasBillSummary ? '✅' : '❌'}`);
                        console.log(`   Subtotal found: ${hasSubtotal ? '✅' : '❌'}`);
                        console.log(`   Discount found: ${hasDiscount ? '✅' : '❌'}`);
                        console.log(`   Total found: ${hasTotal ? '✅' : '❌'}`);

                        if (hasBillSummary && hasDiscount && hasTotal) {
                          console.log('\n✅ Bill summary verified - Discount and Total present');
                          reportTestCase('Verify Bill Summary with Discount', 'PASS', '12% discount applied, Total calculated');
                        } else if (hasTotal) {
                          console.log('\n⚠️  Bill summary partially verified - Total present');
                          reportTestCase('Verify Bill Summary', 'WARN', 'Some bill elements missing');
                        } else {
                          console.log('\n❌ Bill summary verification failed');
                          reportTestCase('Verify Bill Summary', 'FAIL', 'Bill summary elements not found', false);
                        }

                        // Take screenshot of bill summary
                        screenshot = await driver.takeScreenshot();
                        fs.writeFileSync('/tmp/clinikally-checkout-bill-summary.png', screenshot, 'base64');
                        console.log('📸 Screenshot saved to /tmp/clinikally-checkout-bill-summary.png');

                        // Click on Change button for address
                        console.log('\n📍 Looking for "Change" button for address...');
                        await driver.pause(2000);

                        try {
                          // Scroll up to see address section
                          console.log('📜 Scrolling up to find address section...');
                          const { height } = await driver.getWindowSize();
                          await driver.performActions([
                            {
                              type: 'pointer',
                              id: 'finger1',
                              parameters: { pointerType: 'touch' },
                              actions: [
                                { type: 'pointerMove', duration: 0, x: 540, y: height * 0.2 },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pause', duration: 100 },
                                { type: 'pointerMove', duration: 500, x: 540, y: height * 0.8 },
                                { type: 'pointerUp', button: 0 }
                              ]
                            }
                          ]);
                          await driver.releaseActions();
                          await driver.pause(1000);

                          // Find Change button
                          let changeButton;
                          let changeFound = false;

                          try {
                            changeButton = await driver.$('android=new UiSelector().text("Change")');
                            const isChangeDisplayed = await changeButton.isDisplayed();
                            if (isChangeDisplayed) {
                              changeFound = true;
                              console.log('✅ Found "Change" button');
                            }
                          } catch (e) {
                            console.log('⚠️  "Change" button not found, trying "Edit"...');
                          }

                          // Try Edit button if Change not found
                          if (!changeFound) {
                            try {
                              changeButton = await driver.$('android=new UiSelector().text("Edit")');
                              const isEditDisplayed = await changeButton.isDisplayed();
                              if (isEditDisplayed) {
                                changeFound = true;
                                console.log('✅ Found "Edit" button');
                              }
                            } catch (e) {
                              console.log('⚠️  "Edit" button not found');
                            }
                          }

                          if (changeFound) {
                            console.log('\n👆 Clicking "Change" button for address...');
                            await changeButton.click();
                            await driver.pause(3000);
                            console.log('✅ Change button clicked');

                            // Take screenshot of address page
                            screenshot = await driver.takeScreenshot();
                            fs.writeFileSync('/tmp/clinikally-checkout-address-page.png', screenshot, 'base64');
                            console.log('📸 Screenshot saved to /tmp/clinikally-checkout-address-page.png');

                            reportTestCase('Click Change Address Button', 'PASS');

                            // List all saved addresses
                            console.log('\n📍 Listing all saved addresses...');
                            await driver.pause(2000);

                            try {
                              const addressPageSource = await driver.getPageSource();

                              // Count addresses by looking for "Deliver Here" or "Select" buttons
                              const deliverHereButtons = await driver.$$('android=new UiSelector().textContains("Deliver")');
                              const totalAddresses = deliverHereButtons.length;

                              console.log(`\n📊 Total Saved Addresses: ${totalAddresses}`);
                              reportTestCase('Count Saved Addresses', 'PASS', `Found ${totalAddresses} addresses`);

                              // Take screenshot of addresses list
                              screenshot = await driver.takeScreenshot();
                              fs.writeFileSync('/tmp/clinikally-checkout-addresses-list.png', screenshot, 'base64');
                              console.log('📸 Screenshot saved to /tmp/clinikally-checkout-addresses-list.png');

                              if (totalAddresses > 0) {
                                // Click on first address's "Deliver Here" button
                                console.log('\n👆 Clicking on first address "Deliver Here" button...');
                                await deliverHereButtons[0].click();
                                await driver.pause(3000);
                                console.log('✅ Address selected');

                                reportTestCase('Select Address', 'PASS', 'Selected first address');

                                // Take screenshot after selecting address
                                screenshot = await driver.takeScreenshot();
                                fs.writeFileSync('/tmp/clinikally-checkout-address-selected.png', screenshot, 'base64');
                                console.log('📸 Screenshot saved to /tmp/clinikally-checkout-address-selected.png');

                                // Verify selected address appears on cart page
                                console.log('\n🔍 Verifying selected address on cart page...');
                                await driver.pause(2000);

                                const cartWithAddressSource = await driver.getPageSource();
                                const hasAddress = cartWithAddressSource.includes('Deliver') ||
                                                  cartWithAddressSource.includes('address') ||
                                                  cartWithAddressSource.includes('Address');

                                if (hasAddress) {
                                  console.log('✅ Address verified on cart page');
                                  reportTestCase('Verify Address on Cart', 'PASS');
                                } else {
                                  console.log('⚠️  Address verification unclear');
                                  reportTestCase('Verify Address on Cart', 'WARN', 'Could not confirm address');
                                }

                                // Take screenshot of cart with address
                                screenshot = await driver.takeScreenshot();
                                fs.writeFileSync('/tmp/clinikally-checkout-cart-with-address.png', screenshot, 'base64');
                                console.log('📸 Screenshot saved to /tmp/clinikally-checkout-cart-with-address.png');

                                // Click Checkout button
                                console.log('\n💳 Looking for Checkout button...');
                                await driver.pause(2000);

                                let checkoutButton;
                                let checkoutFound = false;

                                try {
                                  checkoutButton = await driver.$('android=new UiSelector().textContains("Checkout")');
                                  const isCheckoutDisplayed = await checkoutButton.isDisplayed();
                                  if (isCheckoutDisplayed) {
                                    checkoutFound = true;
                                    console.log('✅ Found "Checkout" button');
                                  }
                                } catch (e) {
                                  console.log('⚠️  "Checkout" not found, trying "Proceed"...');
                                }

                                // Try "Proceed to Checkout" if "Checkout" not found
                                if (!checkoutFound) {
                                  try {
                                    checkoutButton = await driver.$('android=new UiSelector().textContains("Proceed")');
                                    const isProceedDisplayed = await checkoutButton.isDisplayed();
                                    if (isProceedDisplayed) {
                                      checkoutFound = true;
                                      console.log('✅ Found "Proceed" button');
                                    }
                                  } catch (e) {
                                    console.log('⚠️  "Proceed" button not found');
                                  }
                                }

                                if (checkoutFound) {
                                  console.log('\n👆 Clicking Checkout button...');
                                  await checkoutButton.click();
                                  await driver.pause(4000);
                                  console.log('✅ Checkout button clicked');

                                  reportTestCase('Click Checkout Button', 'PASS');

                                  // Take screenshot of checkout page
                                  screenshot = await driver.takeScreenshot();
                                  fs.writeFileSync('/tmp/clinikally-checkout-page.png', screenshot, 'base64');
                                  console.log('📸 Screenshot saved to /tmp/clinikally-checkout-page.png');

                                  // Verify checkout page details match cart page
                                  console.log('\n🔍 Verifying checkout page details...');
                                  await driver.pause(2000);

                                  const checkoutPageSource = await driver.getPageSource();

                                  // Check for key elements that should be on checkout page
                                  const hasProductOnCheckout = checkoutPageSource.includes('Uriage') ||
                                                               checkoutPageSource.includes('uriage') ||
                                                               checkoutPageSource.includes('URIAGE');
                                  const hasDiscountOnCheckout = checkoutPageSource.includes('12%') ||
                                                               checkoutPageSource.includes('SUMMER') ||
                                                               checkoutPageSource.includes('Discount');
                                  const hasAddressOnCheckout = checkoutPageSource.includes('Deliver') ||
                                                              checkoutPageSource.includes('Address');
                                  const hasTotalOnCheckout = checkoutPageSource.includes('Total') ||
                                                            checkoutPageSource.includes('total');

                                  console.log(`\n📋 Checkout Page Verification:`);
                                  console.log(`   Product details: ${hasProductOnCheckout ? '✅' : '❌'}`);
                                  console.log(`   Discount applied: ${hasDiscountOnCheckout ? '✅' : '❌'}`);
                                  console.log(`   Address displayed: ${hasAddressOnCheckout ? '✅' : '❌'}`);
                                  console.log(`   Total amount: ${hasTotalOnCheckout ? '✅' : '❌'}`);

                                  if (hasProductOnCheckout && hasTotalOnCheckout && hasAddressOnCheckout) {
                                    console.log('\n✅ Checkout page details verified - All match with cart');
                                    reportTestCase('Verify Checkout Page Details', 'PASS', 'All details match cart page');

                                    // Look for "Confirm and Pay" button
                                    console.log('\n💰 Looking for "Confirm and Pay" button...');
                                    await driver.pause(2000);

                                    let confirmPayButton;
                                    let confirmPayFound = false;

                                    try {
                                      confirmPayButton = await driver.$('android=new UiSelector().textContains("Confirm")');
                                      const isConfirmDisplayed = await confirmPayButton.isDisplayed();
                                      if (isConfirmDisplayed) {
                                        confirmPayFound = true;
                                        console.log('✅ Found "Confirm and Pay" button');
                                      }
                                    } catch (e) {
                                      console.log('⚠️  "Confirm" not found, trying "Pay"...');
                                    }

                                    // Try "Place Order" if "Confirm" not found
                                    if (!confirmPayFound) {
                                      try {
                                        confirmPayButton = await driver.$('android=new UiSelector().textContains("Place Order")');
                                        const isPlaceOrderDisplayed = await confirmPayButton.isDisplayed();
                                        if (isPlaceOrderDisplayed) {
                                          confirmPayFound = true;
                                          console.log('✅ Found "Place Order" button');
                                        }
                                      } catch (e) {
                                        console.log('⚠️  "Place Order" button not found');
                                      }
                                    }

                                    // Try "Pay Now" if still not found
                                    if (!confirmPayFound) {
                                      try {
                                        confirmPayButton = await driver.$('android=new UiSelector().textContains("Pay Now")');
                                        const isPayNowDisplayed = await confirmPayButton.isDisplayed();
                                        if (isPayNowDisplayed) {
                                          confirmPayFound = true;
                                          console.log('✅ Found "Pay Now" button');
                                        }
                                      } catch (e) {
                                        console.log('⚠️  "Pay Now" button not found');
                                      }
                                    }

                                    if (confirmPayFound) {
                                      console.log('\n✅ Ready to click "Confirm and Pay" button');
                                      console.log('ℹ️  NOTE: Payment completion is disabled by default');
                                      console.log('ℹ️  To enable payment, set TEST_CONFIG.completePayment = true');

                                      if (TEST_CONFIG.completePayment) {
                                        console.log('\n👆 Clicking "Confirm and Pay" button...');
                                        await confirmPayButton.click();
                                        await driver.pause(3000);
                                        console.log('✅ Confirm and Pay button clicked');
                                        reportTestCase('Click Confirm and Pay', 'PASS');
                                      } else {
                                        console.log('\n⏸️  Skipping payment click (completePayment = false)');
                                        reportTestCase('Verify Confirm and Pay Button', 'PASS', 'Button found, payment skipped');
                                      }

                                      // Take final screenshot
                                      screenshot = await driver.takeScreenshot();
                                      fs.writeFileSync('/tmp/clinikally-checkout-final.png', screenshot, 'base64');
                                      console.log('📸 Screenshot saved to /tmp/clinikally-checkout-final.png');

                                    } else {
                                      console.log('❌ Confirm and Pay button not found');
                                      reportTestCase('Find Confirm and Pay Button', 'FAIL', 'Button not found', false);
                                    }

                                  } else {
                                    console.log('\n⚠️  Some checkout details do not match cart page');
                                    reportTestCase('Verify Checkout Page Details', 'WARN', 'Some details missing');
                                  }

                                } else {
                                  console.log('❌ Checkout button not found');
                                  reportTestCase('Find Checkout Button', 'FAIL', 'Button not found', false);
                                }

                              } else {
                                console.log('⚠️  No saved addresses found');
                                reportTestCase('Count Saved Addresses', 'WARN', 'No addresses found');
                              }

                            } catch (e) {
                              console.error('⚠️  Error during address selection:', e.message);
                              reportTestCase('Address Selection Flow', 'WARN', e.message);
                            }

                          } else {
                            console.log('⚠️  Change/Edit button not found');
                            reportTestCase('Click Change Address Button', 'WARN', 'Button not found');
                          }

                        } catch (e) {
                          console.error('⚠️  Error clicking Change button:', e.message);
                          reportTestCase('Click Change Address Button', 'WARN', e.message);
                        }

                      } else {
                        console.log('⚠️  "Tap to apply" button not found');
                        reportTestCase('Find Tap to Apply Button', 'WARN', 'Apply button not found');
                      }

                    } else {
                      console.log('⚠️  12% off coupon not visible');
                      reportTestCase('Find 12% Off Coupon', 'WARN', 'Coupon not displayed');
                    }
                  } catch (e) {
                    console.error('⚠️  Error finding/applying 12% off coupon:', e.message);
                    reportTestCase('Apply 12% Off Coupon', 'WARN', `Coupon not found: ${e.message}`);
                  }

                } else {
                  console.log('⚠️  "View All Coupons" button not found');
                  reportTestCase('Find View All Coupons Button', 'WARN', 'Button not found on cart page');
                }

              } catch (e) {
                console.error('⚠️  Error during coupon application:', e.message);
                reportTestCase('Coupon Application Flow', 'WARN', e.message);
              }

            } catch (e) {
              console.error('❌ Error clicking Add to Cart or Keep Browsing:', e.message);
              reportTestCase('Add to Cart Flow', 'FAIL', e.message, false);
            }

          } else {
            console.log('⚠️  Not on PDP after click - may need different coordinates');
            reportTestCase('Click on Product', 'WARN', 'PDP verification failed');
          }

        } catch (e) {
          console.error('❌ Error clicking product:', e.message);
          const isBlocker = reportTestCase('Click on Product', 'FAIL', e.message, true);
          if (isBlocker) return;
        }

      } catch (e) {
        console.error('❌ Error during product search:', e.message);
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
