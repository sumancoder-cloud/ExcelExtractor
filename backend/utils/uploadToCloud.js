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

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: 'excel-extractor/conversions',
      public_id: `${Date.now()}-${fileName.replace('.xlsx', '')}`,
      overwrite: false,
    });

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
    // Fallback to local storage if cloud fails
    console.log('Falling back to local storage');
    return { url: `/api/convert/download/${fileName}` };
  }
};

module.exports = { uploadExcelToCloud };
