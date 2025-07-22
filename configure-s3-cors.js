const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');

// Configure S3 CORS for frontend uploads
async function configureS3CORS() {
  console.log('🔧 Configuring S3 CORS Policy...');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const bucket = process.env.AWS_S3_BUCKET || 'chapelstack-bucket';

  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'https://your-production-domain.com' // Add your production domain here
        ],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  };

  try {
    // Apply CORS configuration
    const putCorsCommand = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(putCorsCommand);
    console.log('✅ CORS configuration applied successfully!');

    // Verify CORS configuration
    const getCorsCommand = new GetBucketCorsCommand({ Bucket: bucket });
    const corsResult = await s3Client.send(getCorsCommand);
    
    console.log('📋 Current CORS Configuration:');
    console.log(JSON.stringify(corsResult.CORSRules, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Failed to configure CORS:', error.message);
    
    if (error.name === 'AccessDenied') {
      console.log('💡 Make sure your AWS credentials have s3:PutBucketCors and s3:GetBucketCors permissions');
    }
    
    return false;
  }
}

// Load environment variables
require('dotenv').config();

configureS3CORS()
  .then(success => {
    if (success) {
      console.log('🎉 S3 CORS configuration complete! Frontend uploads should now work.');
    } else {
      console.log('💥 CORS configuration failed. Check your AWS permissions.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Configuration failed:', error);
    process.exit(1);
  });
