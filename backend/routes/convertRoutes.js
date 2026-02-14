const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { convertPDFToExcel, convertImageToExcel } = require('../utils/converter');
const { uploadExcelToCloud } = require('../utils/uploadToCloud');
const MLExtractor = require('../utils/mlExtractor');
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
    console.log('\n=== File Upload Request ===');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size / 1024 / 1024; // in MB

    console.log('File received:', req.file.originalname);
    console.log('File type:', fileType);
    console.log('File path:', filePath);
    console.log('File size:', fileSize.toFixed(2), 'MB');

    // Warn if PDF is large
    if (fileType === 'application/pdf' && fileSize > 20) {
      console.warn('⚠️ Large PDF detected:', fileSize.toFixed(2), 'MB - processing may take a while');
    }

    let result;
    const startConversion = Date.now();

    // Convert based on file type
    try {
      if (fileType === 'application/pdf') {
        console.log('📄 Converting PDF to Excel using Tesseract OCR...');
        result = await convertPDFToExcel(filePath);
      } else if (fileType.startsWith('image/')) {
        console.log('🖼️ Converting Image to Excel using ML Model...');
        result = await convertImageToExcel(filePath, true);
      } else {
        throw new Error('Unsupported file type');
      }
      
      const conversionTime = Date.now() - startConversion;
      console.log(`✅ Conversion completed in ${Math.round(conversionTime / 1000)} seconds`);
    } catch (conversionError) {
      console.error('❌ Conversion failed:', conversionError.message);
      
      // Clean up
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      let errorMsg = conversionError.message || 'Conversion failed';
      if (errorMsg.includes('timeout')) {
        errorMsg = 'Conversion took too long. Please try a smaller PDF.';
      } else if (errorMsg.includes('corrupted')) {
        errorMsg = 'PDF appears to be corrupted. Please try another file.';
      }
      
      return res.status(500).json({ 
        success: false, 
        message: errorMsg
      });
    }

    console.log('✅ Conversion successful!');
    console.log('   File:', result.excelPath);
    console.log('   Method:', result.extractionMethod);
    console.log('   Confidence:', result.confidence);

    // Upload to Cloudinary with simple retry logic
    let cloudUpload = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`\n📤 Cloudinary upload [Attempt ${attempt}/2]...`);
        cloudUpload = await uploadExcelToCloud(result.excelPath, 'converted.xlsx');
        console.log('✅ Upload successful');
        break;
      } catch (uploadError) {
        console.error(`Upload attempt ${attempt} failed:`, uploadError.message);
        if (attempt < 2) {
          console.log('⏳ Retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('⚠️ Using local fallback');
          cloudUpload = { url: `/api/convert/download/converted.xlsx` };
        }
      }
    }

    // Save to database with simple retry logic
    let conversionRecord = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`\n📝 Saving to database [Attempt ${attempt}/2]...`);
        conversionRecord = new ConversionHistory({
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
        console.log('✅ Database save successful');
        break;
      } catch (dbError) {
        console.error(`Database attempt ${attempt} failed:`, dbError.message);
        if (attempt < 2) {
          console.log('⏳ Retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.warn('⚠️ Database save skipped, proceeding with response');
        }
      }
    }

    // Return response
    console.log('\n✅ Sending response to client...');
    res.json({
      success: true,
      extractedText: result.extractedText,
      tableData: result.tableData,
      downloadUrl: cloudUpload.url,
      fileName: 'converted.xlsx',
      extractionMethod: result.extractionMethod,
      confidence: result.confidence,
      historyId: conversionRecord?._id,
      conversionTime: Date.now() - req.startTime
    });

  } catch (error) {
    console.error('\n❌ === UNEXPECTED ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Clean up
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('Could not delete file:', e.message);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred. Please try again.'
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

// @route   POST /api/convert/medical-bill
// @desc    Extract data from handwritten medical bills/invoices
// @access  Private
router.post('/medical-bill', protect, upload.single('file'), async (req, res) => {
  try {
    req.startTime = Date.now();
    console.log('🏥 === Medical Bill Extraction Request ===');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    console.log('File received:', req.file.originalname);
    console.log('File type:', fileType);

    let billData = null;

    // Extract medical bill data using enhanced handwritten support
    if (fileType.startsWith('image/')) {
      console.log('🤖 Processing handwritten/printed medical bill image...');
      billData = await MLExtractor.extractMedicalBill(filePath);
    } else if (fileType === 'application/pdf') {
      console.log('📄 Processing PDF medical bill...');
      // For PDF, we'd need to convert to image first or extract text
      const { convertPDFToExcel } = require('../utils/converter');
      const pdfResult = await convertPDFToExcel(filePath);
      billData = {
        text: pdfResult.extractedText.join('\n'),
        method: pdfResult.extractionMethod,
        confidence: pdfResult.confidence,
        isHandwritten: false
      };
    } else {
      throw new Error('Unsupported file type for medical bill extraction');
    }

    if (!billData || !billData.text) {
      throw new Error('Could not extract data from medical bill');
    }

    console.log('✅ Medical bill extraction successful');
    console.log('Extraction method:', billData.method);
    console.log('Confidence:', billData.confidence);
    console.log('Handwritten:', billData.isHandwritten);

    // If structured fields were extracted, create Excel from them
    let excelPath = null;
    if (billData.medicalFields && Object.keys(billData.medicalFields).length > 0) {
      const XLSX = require('xlsx');
      
      // Prepare data for Excel
      const excelData = [
        ['Field', 'Value'],
        ...Object.entries(billData.medicalFields || {})
          .map(([key, value]) => [key, value])
      ];

      if (billData.lineItems && billData.lineItems.length > 0) {
        excelData.push(['', '']);
        excelData.push(['Line Items', 'Amount']);
        billData.lineItems.forEach(item => {
          excelData.push([item.description, item.amount]);
        });
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Medical Bill');

      excelPath = filePath.replace(path.extname(filePath), '_medical_bill.xlsx');
      XLSX.writeFile(wb, excelPath);
    }

    // Save to conversion history
    const conversionRecord = new ConversionHistory({
      userId: req.user.id,
      originalFileName: req.file.originalname,
      convertedFileName: 'medical_bill.xlsx',
      fileType: fileType.startsWith('image/') ? 'image' : 'pdf',
      mimeType: fileType,
      originalFileSize: req.file.size,
      downloadUrl: excelPath || 'N/A',
      filePath: excelPath || filePath,
      extractedText: billData.text.split('\n'),
      extractionMethod: billData.method,
      confidence: billData.confidence,
      conversionTime: Date.now() - req.startTime,
      status: 'success',
      documentType: 'medical_bill',
      isHandwritten: billData.isHandwritten
    });

    await conversionRecord.save();

    res.json({
      success: true,
      billData: billData.medicalFields || {},
      lineItems: billData.lineItems || [],
      rawText: billData.text,
      extractionMethod: billData.method,
      confidence: billData.confidence,
      isHandwritten: billData.isHandwritten,
      excelPath: excelPath,
      historyId: conversionRecord._id,
      message: 'Medical bill data extracted successfully'
    });

  } catch (error) {
    console.error('🏥 Medical Bill Extraction Error:', error.message);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Medical bill extraction failed: ' + error.message
    });
  }
});

module.exports = router;
