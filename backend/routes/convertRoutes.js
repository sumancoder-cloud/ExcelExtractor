const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { convertPDFToExcel, convertImageToExcel } = require('../utils/converter');
const Feedback = require('../models/Feedback');

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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   POST /api/convert/upload
// @desc    Upload and convert file to Excel
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
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

    // Return both extracted text and download info
    res.json({
      success: true,
      extractedText: result.extractedText,
      tableData: result.tableData,
      downloadUrl: `/api/convert/download/${path.basename(result.excelPath)}`,
      fileName: 'converted.xlsx',
      extractionMethod: result.extractionMethod,
      confidence: result.confidence
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
// @desc    Download converted Excel file
// @access  Private
router.get('/download/:fileName', protect, (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../uploads/', fileName);

    // Security check: ensure file is in uploads directory
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(__dirname, '../uploads/');
    
    if (!resolvedPath.startsWith(uploadsDir)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.download(filePath, 'converted.xlsx', (err) => {
      if (err) {
        console.error('Download error:', err);
      } else {
        console.log('File downloaded:', fileName);
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File cleaned up:', fileName);
          }
        }, 1000);
      }
    });
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

module.exports = router;
