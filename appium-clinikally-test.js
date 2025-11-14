const { remote } = require('webdriverio');

(async () => {
  console.log('🤖 Starting Appium test for Clinikally app...\n');

  // Appium capabilities
  const capabilities = {
    platformName: 'Android',
    'appium:deviceName': 'DQ899HON5HPFJFFY',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.clinikally.app',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true, // Don't reset app state
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

    console.log('📊 Verifying page data...\n');

    // Get current activity
    const currentActivity = await driver.getCurrentActivity();
    console.log('Current Activity:', currentActivity);

    // Get current package
    const currentPackage = await driver.getCurrentPackage();
    console.log('Current Package:', currentPackage);

    // Get page source
    const pageSource = await driver.getPageSource();
    console.log('\n📄 Page Source Length:', pageSource.length, 'characters');

    // Try to find some elements on the page
    console.log('\n🔍 Searching for UI elements...\n');

    try {
      // Find all visible text elements
      const textElements = await driver.$$('android.widget.TextView');
      console.log('Found', textElements.length, 'TextView elements');

      // Print first few text values
      console.log('\n📝 Visible text elements:');
      for (let i = 0; i < Math.min(10, textElements.length); i++) {
        try {
          const text = await textElements[i].getText();
          if (text && text.trim().length > 0) {
            console.log(`  ${i + 1}. "${text}"`);
          }
        } catch (e) {
          // Skip elements that can't be read
        }
      }

      // Find buttons
      const buttons = await driver.$$('android.widget.Button');
      console.log('\nFound', buttons.length, 'Button elements');

      // Find images
      const images = await driver.$$('android.widget.ImageView');
      console.log('Found', images.length, 'ImageView elements');

      // Find edit text fields
      const editTexts = await driver.$$('android.widget.EditText');
      console.log('Found', editTexts.length, 'EditText fields');

    } catch (e) {
      console.log('Error finding elements:', e.message);
    }

    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    const fs = require('fs');
    fs.writeFileSync('/tmp/clinikally-app-screenshot.png', screenshot, 'base64');
    console.log('\n📸 Screenshot saved to /tmp/clinikally-app-screenshot.png');

    // Get device info
    console.log('\n📱 Device Information:');
    const platformVersion = await driver.getCapabilities();
    console.log('Platform Version:', platformVersion.platformVersion);
    console.log('Device UDID:', platformVersion['appium:udid']);

    console.log('\n✅ Page verification complete!');
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
  }
})();
