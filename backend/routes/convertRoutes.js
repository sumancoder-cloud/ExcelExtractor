const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { convertPDFToExcel, convertImageToExcel } = require('../utils/converter');
const { uploadExcelToCloud } = require('../utils/uploadToCloud');
const Feedback = require('../models/Feedback');
const ConversionHistory = require('../models/ConversionHistory');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// @route   POST /api/convert/upload
// @desc    Upload and convert file to Excel
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    req.startTime = Date.now();
    console.log('=== File Upload Request ===');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    console.log('File received:', req.file.originalname);
    console.log('File type:', fileType);
    console.log('File path:', filePath);

    let result;

    // Convert based on file type
    if (fileType === 'application/pdf') {
      console.log('Converting PDF to Excel using Tesseract OCR...');
      result = await convertPDFToExcel(filePath);
    } else if (fileType.startsWith('image/')) {
      console.log('Converting Image to Excel using ML Model (default)...');
      // ML is used by default for images
      result = await convertImageToExcel(filePath, true);
    } else {
      throw new Error('Unsupported file type');
    }

    console.log('Conversion successful! Excel file:', result.excelPath);
    console.log('Extraction method:', result.extractionMethod);
    console.log('Confidence:', result.confidence);

    // Upload Excel file to Cloudinary (persistent cloud storage)
    const cloudUpload = await uploadExcelToCloud(result.excelPath, 'converted.xlsx');

    // Save conversion to history
    const conversionRecord = new ConversionHistory({
      userId: req.user.id,
      originalFileName: req.file.originalname,
      convertedFileName: 'converted.xlsx',
      fileType: fileType.startsWith('image/') ? 'image' : 'pdf',
      mimeType: fileType,
      originalFileSize: req.file.size,
      downloadUrl: cloudUpload.url,
      filePath: result.excelPath,
      extractedText: result.extractedText || [],
      tableData: result.tableData || null,
      extractionMethod: result.extractionMethod,
      confidence: result.confidence,
      conversionTime: Date.now() - req.startTime,
      status: 'success'
    });

    await conversionRecord.save();

    // Return both extracted text and download info
    res.json({
      success: true,
      extractedText: result.extractedText,
      tableData: result.tableData,
      downloadUrl: cloudUpload.url,
      fileName: 'converted.xlsx',
      extractionMethod: result.extractionMethod,
      confidence: result.confidence,
      historyId: conversionRecord._id
    });

  } catch (error) {
    console.error('=== Conversion Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Provide helpful error messages
    let errorMessage = error.message || 'File conversion failed';
    if (error.message.includes('Unexpected end of file')) {
      errorMessage = 'The PDF file appears to be corrupted. Please try another file.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

// @route   GET /api/convert/download/:fileName
// @desc    Download converted Excel file (redirects to Cloudinary)
// @access  Private
router.get('/download/:fileName', protect, (req, res) => {
  try {
    // Files are now stored on Cloudinary, frontend will download directly
    // This endpoint kept for backward compatibility - just returns success
    res.json({ success: true, message: 'Download URL is provided in the conversion response' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Download failed' });
  }
});

router.post('/feedback', protect, async (req, res) => {
  try {
    const { rating, suggestions } = req.body;
    const userId = req.user.id;

    const feedback = new Feedback({
      userId,
      rating,
      suggestions,
    });

    await feedback.save();

    res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

// @route   GET /api/convert/history
// @desc    Get user's conversion history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const conversions = await ConversionHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ConversionHistory.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      conversions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversion history' });
  }
});

// @route   GET /api/convert/history/:id
// @desc    Get specific conversion details
// @access  Private
router.get('/history/:id', protect, async (req, res) => {
  try {
    const conversion = await ConversionHistory.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    res.status(200).json({
      success: true,
      conversion
    });
  } catch (error) {
    console.error('Fetch conversion error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversion' });
  }
});

// @route   GET /api/convert/download-history/:id
// @desc    Download file from conversion history
// @access  Private
router.get('/download-history/:id', protect, async (req, res) => {
  try {
    const conversion = await ConversionHistory.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    if (!fs.existsSync(conversion.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File no longer available'
      });
    }

    res.download(conversion.filePath, conversion.convertedFileName);
  } catch (error) {
    console.error('Download history file error:', error);
    res.status(500).json({ success: false, message: 'Download failed' });
  }
});

// @route   DELETE /api/convert/history/:id
// @desc    Delete conversion history record
// @access  Private
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const conversion = await ConversionHistory.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    // Delete file if exists
    if (fs.existsSync(conversion.filePath)) {
      fs.unlinkSync(conversion.filePath);
    }

    await ConversionHistory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Conversion deleted successfully'
    });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete conversion' });
  }
});

module.exports = router;
