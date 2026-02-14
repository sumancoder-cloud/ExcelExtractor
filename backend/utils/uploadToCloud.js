const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadExcelToCloud = async (filePath, fileName) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary not configured. Using local storage.');
      return { url: `/api/convert/download/${fileName}` };
    }

    console.log('Starting Cloudinary upload for:', filePath);
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓ set' : '✗ missing',
      api_key: process.env.CLOUDINARY_API_KEY ? '✓ set' : '✗ missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ set' : '✗ missing',
    });

    // Verify file exists and is readable
    if (!fs.existsSync(filePath)) {
      console.warn('File does not exist at:', filePath);
      return { url: `/api/convert/download/${fileName}` };
    }

    const fileStats = fs.statSync(filePath);
    console.log(`File size: ${(fileStats.size / 1024).toFixed(2)} KB`);

    // Upload file to Cloudinary with timeout and retries
    const uploadPromise = cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: 'excel-extractor/conversions',
      public_id: `${Date.now()}-${fileName.replace('.xlsx', '')}`,
      overwrite: false,
      timeout: 120000, // 120 second timeout
      max_retries: 2, // Retry up to 2 times
    });

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cloudinary upload timeout after 60s')), 60000)
    );

    const result = await Promise.race([uploadPromise, timeoutPromise]);

    console.log('✓ File uploaded to Cloudinary:', result.secure_url);

    // Delete local file after cloud upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✓ Local file deleted:', filePath);
    }

    return {
      url: result.secure_url,
      cloudinaryId: result.public_id,
    };
  } catch (error) {
    console.error('✗ Cloudinary upload error:', error.message);
    console.error('Error details:', error);
    console.log('⚠️ Falling back to local storage instead of cloud');
    
    // Still keep the file locally if cloud upload fails
    return { 
      url: `/api/convert/download/${fileName}`,
      method: 'local_fallback',
      error: error.message
    };
  }
};

module.exports = { uploadExcelToCloud };
