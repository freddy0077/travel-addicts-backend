const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Test S3 connection and presigned URL generation
async function testS3Connection() {
  console.log('🧪 Testing S3 Connection...');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const bucket = process.env.AWS_S3_BUCKET || 'chapelstack-bucket';
  const key = `test/${Date.now()}-test-upload.txt`;

  try {
    // Test presigned URL generation
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: 'text/plain',
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    console.log('✅ S3 Connection successful!');
    console.log('📦 Bucket:', bucket);
    console.log('🌍 Region:', process.env.AWS_REGION);
    console.log('🔗 Generated presigned URL:', uploadUrl.substring(0, 100) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ S3 Connection failed:', error.message);
    return false;
  }
}

// Load environment variables
require('dotenv').config();

testS3Connection()
  .then(success => {
    if (success) {
      console.log('🎉 S3 Media Upload Service is ready!');
    } else {
      console.log('💥 S3 Media Upload Service has issues. Check your AWS credentials.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
