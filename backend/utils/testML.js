const MLExtractor = require('./mlExtractor');

// Test the ML extraction functionality
async function testMLExtraction() {
  console.log('🧪 Testing ML Extraction...');

  const extractor = new MLExtractor();

  // Test with a simple text image (you can replace with actual image path)
  const testImagePath = './test-image.png'; // You'll need to add a test image

  try {
    // Test Hugging Face TrOCR
    console.log('Testing TrOCR...');
    const trocrResult = await extractor.extractWithTrOCR(testImagePath);
    console.log('TrOCR Result:', trocrResult ? 'Success' : 'Failed');

    // Test Google Vision
    console.log('Testing Google Vision...');
    const visionResult = await extractor.extractWithGoogleVision(testImagePath);
    console.log('Google Vision Result:', visionResult ? 'Success' : 'Failed');

    console.log('✅ ML Extraction test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMLExtraction();
}

module.exports = testMLExtraction;