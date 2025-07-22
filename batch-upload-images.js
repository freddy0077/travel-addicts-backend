const fs = require('fs');
const path = require('path');
const { MediaService } = require('./dist/services/mediaService.js');

// Batch upload script for African destination hero images
async function batchUploadImages() {
  console.log('🚀 Starting batch upload of African destination images...');
  
  const mediaService = new MediaService();
  const imagesFolder = './hero-images'; // Create this folder and put your images here
  
  // Recommended image mappings for destinations
  const imageDestinationMap = {
    'serengeti-migration.jpg': { folder: 'destination', destination: 'Serengeti National Park' },
    'kilimanjaro-sunrise.jpg': { folder: 'destination', destination: 'Mount Kilimanjaro' },
    'victoria-falls.jpg': { folder: 'destination', destination: 'Victoria Falls' },
    'sossusvlei-dunes.jpg': { folder: 'destination', destination: 'Sossusvlei' },
    'zanzibar-beach.jpg': { folder: 'destination', destination: 'Zanzibar' },
    'cape-coast-castle.jpg': { folder: 'destination', destination: 'Cape Coast Castle' },
    'kakum-canopy.jpg': { folder: 'destination', destination: 'Kakum National Park' },
    'masai-mara-balloon.jpg': { folder: 'destination', destination: 'Masai Mara' },
    'table-mountain.jpg': { folder: 'destination', destination: 'Table Mountain' },
    'sahara-desert.jpg': { folder: 'destination', destination: 'Sahara Desert' }
  };

  try {
    // Check if images folder exists
    if (!fs.existsSync(imagesFolder)) {
      console.log('📁 Creating hero-images folder...');
      fs.mkdirSync(imagesFolder);
      console.log('✅ Please add your downloaded hero images to the ./hero-images folder');
      console.log('📋 Recommended filenames:', Object.keys(imageDestinationMap).join(', '));
      return;
    }

    // Get all image files from the folder
    const files = fs.readdirSync(imagesFolder)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (files.length === 0) {
      console.log('❌ No image files found in ./hero-images folder');
      console.log('📋 Please add images with these recommended names:');
      Object.keys(imageDestinationMap).forEach(filename => {
        console.log(`   - ${filename} (${imageDestinationMap[filename].destination})`);
      });
      return;
    }

    console.log(`📸 Found ${files.length} images to upload`);

    const uploadResults = [];

    for (const filename of files) {
      try {
        console.log(`\n🔄 Uploading ${filename}...`);
        
        const filePath = path.join(imagesFolder, filename);
        const buffer = fs.readFileSync(filePath);
        const stats = fs.statSync(filePath);
        
        // Get content type
        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp'
        };
        const contentType = contentTypeMap[ext] || 'image/jpeg';

        // Get destination info
        const destInfo = imageDestinationMap[filename] || { folder: 'destination', destination: 'Unknown' };
        
        // Validate file size
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (stats.size > maxSize) {
          console.log(`❌ ${filename} is too large (${(stats.size / 1024 / 1024).toFixed(2)}MB). Please optimize to under 10MB.`);
          continue;
        }

        // Upload to S3
        const uploadResult = await mediaService.uploadFile(
          buffer,
          filename,
          contentType,
          destInfo.folder
        );

        console.log(`✅ ${filename} uploaded successfully!`);
        console.log(`   📍 Destination: ${destInfo.destination}`);
        console.log(`   🔗 URL: ${uploadResult.url}`);
        console.log(`   📏 Size: ${(stats.size / 1024).toFixed(2)}KB`);

        uploadResults.push({
          filename,
          destination: destInfo.destination,
          url: uploadResult.url,
          key: uploadResult.key,
          size: stats.size
        });

      } catch (error) {
        console.error(`❌ Failed to upload ${filename}:`, error.message);
      }
    }

    // Generate summary
    console.log('\n🎉 Batch upload completed!');
    console.log(`✅ Successfully uploaded: ${uploadResults.length}/${files.length} images`);
    
    if (uploadResults.length > 0) {
      console.log('\n📋 Upload Summary:');
      uploadResults.forEach(result => {
        console.log(`   ${result.filename} → ${result.destination}`);
        console.log(`   ${result.url}`);
      });

      // Save results to JSON file
      const resultsFile = './upload-results.json';
      fs.writeFileSync(resultsFile, JSON.stringify(uploadResults, null, 2));
      console.log(`\n💾 Results saved to ${resultsFile}`);
      console.log('🔧 You can now use these URLs in your admin panel to update destination images!');
    }

  } catch (error) {
    console.error('💥 Batch upload failed:', error);
  }
}

// Instructions
console.log('📖 African Hero Images Batch Upload Tool');
console.log('');
console.log('Instructions:');
console.log('1. Create a folder called "hero-images" in this directory');
console.log('2. Download high-quality African destination images (1920x1080+)');
console.log('3. Name them according to the guide (e.g., serengeti-migration.jpg)');
console.log('4. Run this script to upload all images to S3');
console.log('');

// Load environment variables
require('dotenv').config();

batchUploadImages()
  .then(() => {
    console.log('🏁 Batch upload process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Batch upload failed:', error);
    process.exit(1);
  });
