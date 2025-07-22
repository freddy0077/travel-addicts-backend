# S3 CORS Configuration Guide

## Issue
The S3 upload is failing due to CORS policy restrictions. The current AWS credentials don't have `s3:PutBucketCORS` permissions to configure CORS programmatically.

## Solution 1: Manual CORS Configuration (Recommended)

### Step 1: Access AWS S3 Console
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Navigate to your bucket: `chapelstack-bucket`
3. Go to the **Permissions** tab
4. Scroll down to **Cross-origin resource sharing (CORS)**

### Step 2: Apply CORS Configuration
Click **Edit** and paste this CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 3: Save Changes
Click **Save changes** to apply the CORS configuration.

## Solution 2: Server-Side Upload (Alternative)

If you prefer not to configure CORS or want a more secure approach, we can implement server-side uploads where:

1. Frontend sends file to backend
2. Backend uploads to S3
3. Backend returns the public URL

This approach:
- ✅ Doesn't require CORS configuration
- ✅ More secure (credentials stay on server)
- ✅ Better control over uploads
- ❌ Uses more server bandwidth
- ❌ Slightly slower for large files

## Testing After CORS Configuration

After applying the CORS configuration manually:

1. Wait 1-2 minutes for changes to propagate
2. Try uploading a file through the admin media page
3. The upload should work without CORS errors

## Production Considerations

For production:
- Replace `http://localhost:3000` with your actual domain
- Consider using CloudFront CDN for better performance
- Implement proper IAM policies for bucket management
