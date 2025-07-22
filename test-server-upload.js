const { MediaService } = require('./dist/services/mediaService.js');

// Test server-side upload functionality
async function testServerUpload() {
  console.log('🧪 Testing Server-Side Upload...');
  
  try {
    // Create a test buffer (small image data)
    const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    console.log('📝 Test buffer created, size:', testBuffer.length);
    
    const mediaService = new MediaService();
    
    const result = await mediaService.uploadFile(
      testBuffer,
      'test-image.png',
      'image/png',
      'test'
    );
    
    console.log('✅ Server upload successful!');
    console.log('📋 Upload result:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Server upload failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Load environment variables
require('dotenv').config();

testServerUpload()
  .then(success => {
    if (success) {
      console.log('🎉 Server-side upload is working!');
    } else {
      console.log('💥 Server-side upload has issues.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
