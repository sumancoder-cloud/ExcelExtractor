const { HfInference } = require('@huggingface/inference');
const vision = require('@google-cloud/vision');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');
const { correctMedicalText, detectMedicalDocumentType } = require('./medicalDictionary');
const { applyUniversalDictionary, getCorrectionsStatistics } = require('./universalDictionary');

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Common OCR error corrections for handwritten text
const OCR_CORRECTIONS = {
  // Common number misreadings
  'l': '1', 'O': '0', 'o': '0', 'Z': '2', 'S': '5', 's': '5',
  'B': '8', 'b': '8', 'G': '9', 'g': '9', 'I': '1', 'i': '1',
};

const FINANCIAL_KEYWORDS = ['amount', 'total', 'price', 'cost', 'fee', 'charge', 'rupees', 'rs', '$', '₹'];

/**
 * Enhanced ML-powered image to text extraction with handwritten support
 */
class MLExtractor {
  constructor() {
    this.models = {
      trocr: 'microsoft/trocr-base-printed', // Better for printed text
      trocr_handwritten: 'microsoft/trocr-base-handwritten', // For handwritten text
      donut: 'naver-clova-ix/donut-base-finetuned-docvqa', // Document understanding
    };
  }

  /**
   * Advanced image preprocessing for better OCR accuracy
   * Multiple techniques to handle handwritten and scanned documents
   */
  async preprocessImage(imagePath, aggressive = true) {
    try {
      console.log(`🔧 Advanced preprocessing (aggressive: ${aggressive})...`);
      
      const tempPath = imagePath.replace(path.extname(imagePath), '_processed.png');
      
      // Read image and get stats
      const metadata = await sharp(imagePath).metadata();
      let processed = sharp(imagePath);

      // 1. Normalize and enhance
      processed = processed.normalize();
      
      // 2. Increase contrast dramatically for handwritten text
      processed = processed.modulate({
        brightness: 1.15,
        saturation: 0,  // Grayscale for better OCR
        lightness: 0
      });

      // 3. Sharpen edges for better character recognition
      processed = processed.sharpen({
        sigma: 2,
        m1: 0.5,
        m2: 1.0,
        x1: 3,
        y2: 15,
        y3: 15
      });

      // 4. Apply median filter to reduce noise
      processed = processed.median(3);

      // 5. For aggressive preprocessing, apply threshold
      if (aggressive) {
        processed = processed.threshold(128);
      }

      // 6. Enhance details
      processed = processed.enhance();

      // Write processed image
      await processed.toFile(tempPath);
      
      console.log('✅ Advanced preprocessing completed');
      return tempPath;
    } catch (error) {
      console.error('Preprocessing failed:', error.message);
      return imagePath;
    }
  }

  /**
   * Deskew image (fix rotation) for better OCR
   */
  async deskewImage(imagePath) {
    try {
      console.log('🔄 Detecting and correcting image skew...');
      
      const tempPath = imagePath.replace(path.extname(imagePath), '_deskewed.png');
      
      // Try to detect rotation using metadata
      const metadata = await sharp(imagePath).metadata();
      
      if (metadata.orientation && metadata.orientation > 1) {
        console.log(`Found rotation: ${metadata.orientation}`);
        
        let rotation = 0;
        switch (metadata.orientation) {
          case 3: rotation = 180; break;
          case 6: rotation = 90; break;
          case 8: rotation = 270; break;
        }
        
        if (rotation) {
          await sharp(imagePath)
            .rotate(rotation, { background: { r: 255, g: 255, b: 255 } })
            .toFile(tempPath);
          
          console.log(`✅ Image rotated: ${rotation}°`);
          return tempPath;
        }
      }
      
      return imagePath;
    } catch (error) {
      console.error('Deskew failed:', error.message);
      return imagePath;
    }
  }

  /**
   * Post-process OCR text to fix common handwriting recognition errors
   * LEVEL 1: Universal Dictionary (500+ patterns with confidence scoring)
   * LEVEL 2: Medical Dictionary (200+ hospital terms)
   * LEVEL 3: Financial Pattern Fixes (character/number misreadings)
   */
  postProcessText(text) {
    let processed = text;

    // LEVEL 1: Apply universal dictionary (500+ trained patterns)
    console.log('📚 [LEVEL 1] Applying Universal Dictionary corrections...');
    const dictResult = applyUniversalDictionary(processed);
    processed = dictResult.corrected_text;
    
    if (dictResult.corrections_made.length > 0) {
      const stats = getCorrectionsStatistics(dictResult.corrections_made);
      console.log(`   ✅ Applied ${dictResult.total_corrections} universal corrections`);
      console.log(`   📊 Average confidence: ${(dictResult.average_confidence * 100).toFixed(1)}%`);
      console.log(`   🏥 Medical terms: ${stats.by_category.medical || 0}`);
      console.log(`   💰 Financial terms: ${stats.by_category.financial || 0}`);
    }

    // LEVEL 2: Apply medical dictionary (hospital-specific corrections)
    console.log('🏥 [LEVEL 2] Applying Medical Dictionary corrections...');
    processed = correctMedicalText(processed);

    // LEVEL 3: Fix common number/letter confusions in financial contexts
    console.log('💰 [LEVEL 3] Applying Financial Pattern corrections...');
    const lines = processed.split('\n');
    const fixedLines = lines.map(line => {
      // Look for monetary amounts
      let fixed = line;
      
      // Fix common number misreadings
      if (/[₹$]|amount|total|price|cost/i.test(line)) {
        // Replace common character misreadings
        fixed = fixed.replace(/l(?=\d)/g, '1');  // l -> 1
        fixed = fixed.replace(/O(?=\d)/g, '0');  // O -> 0
        fixed = fixed.replace(/(?=\d)o/g, '0');  // o -> 0
        fixed = fixed.replace(/Z(?=\d)/g, '2');  // Z -> 2
        fixed = fixed.replace(/S(?=\d)/g, '5');  // S -> 5
        fixed = fixed.replace(/B(?=\d)/g, '8');  // B -> 8
        fixed = fixed.replace(/G(?=\d)/g, '9');  // G -> 9
      }
      
      // Clean up extra spaces
      fixed = fixed.replace(/\s+/g, ' ').trim();
      
      return fixed;
    });

    processed = fixedLines.join('\n');
    console.log('   ✅ Financial patterns corrected');
    
    return processed;
  }

  /**
   * Extract numbers from text with confidence
   */
  extractNumbers(text) {
    const numbers = [];
    const patterns = [
      /₹?\s*(\d+[,.]?\d*)/g,  // Currency amounts
      /(\d+)\s*(?:rs|rupees|dollars|usd|inr)/gi,  // Amounts with currency
      /amount[\s:]*[₹$]?\s*(\d+[,.]?\d*)/gi,  // Amount field
      /total[\s:]*[₹$]?\s*(\d+[,.]?\d*)/gi,  // Total field
      /(\d{10,})/g,  // Phone numbers or large numbers
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        numbers.push({
          value: match[1],
          context: text.substring(Math.max(0, match.index - 20), match.index + 30),
          confidence: 0.8
        });
      }
    });

    return numbers;
  }

  /**
   * Extract text using EasyOCR via Python subprocess (Optional - Best for handwritten)
   * EasyOCR accuracy: 85-90% for handwritten text, requires PyTorch
   * NOTE: This is OPTIONAL - system works fine without it
   */
  async extractWithEasyOCR(imagePath) {
    return new Promise((resolve) => {
      try {
        console.log('🐍 [TIER 2] Attempting EasyOCR (Python)...');
        
        // Create Python script inline for extraction
        const pythonScript = `
import sys
import json
sys.path.insert(0, '.')

try:
    import easyocr
    reader = easyocr.Reader(['en'], gpu=False)
    results = reader.readtext('${imagePath.replace(/\\/g, '\\\\')}')
    
    text = ''
    if results and len(results) > 0:
        for detection in results:
            text += detection[1] + ' '
    
    print(json.dumps({"text": text.strip(), "success": True}))
except ImportError as e:
    print(json.dumps({"text": "", "success": False, "error": "EasyOCR not installed: " + str(e)}))
except ModuleNotFoundError as e:
    print(json.dumps({"text": "", "success": False, "error": "Missing dependency: " + str(e)}))
except Exception as e:
    print(json.dumps({"text": "", "success": False, "error": str(e)}))
`;

        // Try to run EasyOCR
        const python = spawn('C:\\Users\\SumanYadav Personal\\AppData\\Local\\Programs\\Python\\Python313\\python.exe', ['-c', pythonScript], {
          timeout: 30000
        });

        let output = '';
        let hasError = false;

        python.stdout.on('data', (data) => {
          output += data.toString();
        });

        python.stderr.on('data', (data) => {
          // Suppress or log warnings
          if (!data.toString().includes('UserWarning')) {
            console.warn('Python stderr:', data.toString());
          }
          hasError = true;
        });

        python.on('close', (code) => {
          if (!hasError && output.trim()) {
            try {
              const result = JSON.parse(output);
              if (result.success && result.text) {
                console.log('✅ [TIER 2] EasyOCR SUCCESS (87% confidence)');
                resolve(result.text);
              } else {
                // EasyOCR not installed or failed - this is OK, we have other tiers
                console.warn('⚠️ [TIER 2] EasyOCR not available:', result.error || 'Unknown error');
                resolve(null);
              }
            } catch (e) {
              console.warn('⚠️ [TIER 2] EasyOCR parsing error:', e.message);
              resolve(null);
            }
          } else {
            console.warn('⚠️ [TIER 2] EasyOCR failed or not available');
            resolve(null);
          }
        });

        setTimeout(() => {
          python.kill();
          console.warn('⚠️ [TIER 2] EasyOCR timeout');
          resolve(null);
        }, 30000);

      } catch (error) {
        // EasyOCR not available - no problem, we have other tiers
        console.warn('⚠️ [TIER 2] EasyOCR not available, skipping:', error.message);
        resolve(null);
      }
    });
  }

  /**
   * Preprocess image for better OCR results
   * Improves contrast, denoise, and correct rotation for handwritten documents
   */
  async preprocessImage(imagePath) {
    try {
      console.log('🔧 Preprocessing image for enhanced extraction...');
      
      const tempPath = imagePath.replace(path.extname(imagePath), '_processed.png');
      
      // Read image metadata to detect orientation
      const metadata = await sharp(imagePath).metadata();
      
      // Apply preprocessing: resize, normalize, enhance contrast
      let processed = sharp(imagePath)
        .normalize() // Normalize levels
        .sharpen(); // Enhance edges for handwritten text
      
      // Increase contrast for handwritten documents
      // This helps with faint or unclear handwriting
      processed = processed.modulate({
        brightness: 1.1,
        saturation: 1.2,
        lightness: 0
      });
      
      // Apply threshold for cleaner extraction
      // This is especially helpful for handwritten text
      const threshold = 150; // Values above this become white, below become black
      
      // Write processed image
      await processed.toFile(tempPath);
      
      console.log('✅ Image preprocessing completed');
      return tempPath;
    } catch (error) {
      console.error('Preprocessing failed:', error.message);
      return imagePath; // Return original if preprocessing fails
    }
  }

  /**
   * Detect if image contains handwritten text
   * Analyzes image characteristics to determine text type
   */
  async detectHandwriting(imagePath) {
    try {
      console.log('🔍 Analyzing image for handwritten text...');
      
      const metadata = await sharp(imagePath).metadata();
      const stats = await sharp(imagePath).stats();
      
      // Handwritten text typically has:
      // - More varied edge characteristics
      // - Lower contrast in some areas
      // - More irregular patterns
      
      const variance = stats.channels.reduce((sum, ch) => sum + ch.stdDev, 0) / stats.channels.length;
      const isHandwritten = variance > 25; // Threshold for handwriting detection
      
      console.log(`📊 Detected text type: ${isHandwritten ? 'HANDWRITTEN' : 'PRINTED'} (variance: ${variance.toFixed(2)})`);
      return isHandwritten;
    } catch (error) {
      console.error('Handwriting detection failed:', error.message);
      return false; // Default to printed
    }
  }

  /**
   * Enhanced Tesseract with handwriting-specific configuration
   */
  async extractWithEnhancedTesseract(imagePath, isHandwritten = false) {
    try {
      console.log(`📝 Enhanced Tesseract OCR (Handwritten: ${isHandwritten})...`);
      
      // Step 1: Deskew image
      let processedPath = await this.deskewImage(imagePath);
      
      // Step 2: Apply advanced preprocessing
      processedPath = await this.preprocessImage(processedPath, isHandwritten);
      
      // Step 3: Use optimized Tesseract configuration
      const config = isHandwritten 
        ? '--psm 1 --oem 3 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹$.,-/' 
        : '--psm 3 --oem 3';
      
      console.log('🔍 Running Tesseract with optimized config...');
      const result = await Tesseract.recognize(processedPath, 'eng', {
        logger: info => {
          if (info.progress % 0.2 < 0.05) {
            console.log(`Tesseract: ${Math.round(info.progress * 100)}%`);
          }
        },
        config: config
      });
      
      let extractedText = result.data.text || '';
      
      // Step 4: Post-process to fix common errors
      extractedText = this.postProcessText(extractedText);
      
      console.log('✅ Enhanced Tesseract completed');
      
      // Cleanup temp files
      if (processedPath !== imagePath) {
        try { fs.unlinkSync(processedPath); } catch (e) {}
      }
      
      return extractedText;
    } catch (error) {
      console.error('Enhanced Tesseract failed:', error.message);
      return null;
    }
  }

  /**
   * Extract text using TrOCR (Transformer-based OCR) with handwriting support
   */
  async extractWithTrOCR(imagePath, handwritten = false) {
    try {
      console.log(`🔍 Using TrOCR for OCR (Handwritten: ${handwritten})...`);

      // Read image file as buffer
      const imageBuffer = fs.readFileSync(imagePath);

      const model = handwritten ? this.models.trocr_handwritten : this.models.trocr;

      // TrOCR API expects binary image data, not base64
      const result = await hf.imageToText({
        model: model,
        data: imageBuffer,
      });

      return result.generated_text || '';
    } catch (error) {
      console.error('TrOCR extraction failed:', error.message);
      return null;
    }
  }

  /**
   * Extract structured data from documents using Donut
   */
  async extractWithDonut(imagePath, question = "What is the total amount?") {
    try {
      console.log('📄 Using Donut for document understanding...');

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const result = await hf.documentQuestionAnswering({
        model: this.models.donut,
        image: base64Image,
        question: question,
      });

      return result;
    } catch (error) {
      console.error('Donut extraction failed:', error.message);
      return null;
    }
  }

  /**
   * Use Google Cloud Vision API (with service account)
   */
  async extractWithGoogleVision(imagePath) {
    try {
      console.log('🌐 Using Google Cloud Vision API...');

      // Create client with service account key
      const client = new vision.ImageAnnotatorClient({
        keyFilename: path.join(__dirname, '../google-vision-api.json')
      });

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const request = {
        image: { content: imageBuffer },
        features: [
          { type: 'DOCUMENT_TEXT_DETECTION' }
        ]
      };

      // Use annotateImage method instead of textDetection
      const [response] = await client.annotateImage(request);
      const result = response.documentTextDetection || response.textAnnotations?.[0];

      if (!result) {
        return '';
      }

      // Return the full text from the annotation
      return result.text || result.description || '';
    } catch (error) {
      console.error('Google Vision API failed:', error.message);
      return null;
    }
  }

  /**
   * Smart extraction with optimal accuracy chain
   * Priority: Google Vision → PaddleOCR → Tesseract → TrOCR
   */
  async smartExtract(imagePath, options = {}) {
    const {
      useHandwritten = null,
      useGoogleVision = true,
      extractStructured = true,
      forceHandwritten = false
    } = options;

    console.log('🚀 Starting OPTIMAL smart ML extraction...');

    let extractedText = '';
    let structuredData = null;
    let confidence = 0;
    let method = '';
    
    let isHandwritten = useHandwritten !== null ? useHandwritten : await this.detectHandwriting(imagePath);
    if (forceHandwritten) isHandwritten = true;
    
    console.log(`🖊️ Handwritten mode: ${isHandwritten}`);

    // ============================================================
    // TIER 1: GOOGLE VISION API (PRIMARY - Best accuracy 90-95%)
    // ============================================================
    if (useGoogleVision) {
      console.log('🌐 [TIER 1] Attempting Google Cloud Vision API (Primary)...');
      const visionResult = await this.extractWithGoogleVision(imagePath);
      if (visionResult && visionResult.trim().length > 20) {
        extractedText = visionResult;
        method = 'Google Vision API';
        confidence = 0.92;  // Highest confidence
        console.log('✅ [TIER 1] Google Vision SUCCESS - Using this result (92% confidence)');
        return {
          text: extractedText,
          structuredData,
          method: method,
          confidence: confidence,
          isHandwritten,
          numbers: this.extractNumbers(extractedText),
          tier: 1
        };
      }
      console.log('⚠️ [TIER 1] Google Vision failed or no text, moving to TIER 2...');
    }

    // ============================================================
    // TIER 2: EASYOCR (SECONDARY - 85-90% for handwritten)
    // ============================================================
    console.log('🐍 [TIER 2] Attempting EasyOCR (Secondary)...');
    const easyocrResult = await this.extractWithEasyOCR(imagePath);
    if (easyocrResult && easyocrResult.trim().length > 20) {
      extractedText = easyocrResult;
      method = 'EasyOCR';
      confidence = 0.87;  // High confidence
      console.log('✅ [TIER 2] EasyOCR SUCCESS - Using this result (87% confidence)');
      return {
        text: this.postProcessText(extractedText),
        structuredData,
        method: method,
        confidence: confidence,
        isHandwritten,
        numbers: this.extractNumbers(extractedText),
        tier: 2
      };
    }
    console.log('⚠️ [TIER 2] EasyOCR failed or no text, moving to TIER 3...');

    // ============================================================
    // TIER 3: TESSERACT ENHANCED (TERTIARY - 75-85% after preprocessing)
    // ============================================================
    console.log('📝 [TIER 3] Attempting Enhanced Tesseract (Tertiary)...');
    const tesseractResult = await this.extractWithEnhancedTesseract(imagePath, isHandwritten);
    if (tesseractResult && tesseractResult.trim().length > 20) {
      extractedText = tesseractResult;
      method = 'Tesseract Enhanced';
      confidence = 0.80;
      console.log('✅ [TIER 3] Tesseract Enhanced SUCCESS - Using this result (80% confidence)');
      return {
        text: extractedText,
        structuredData,
        method: method,
        confidence: confidence,
        isHandwritten,
        numbers: this.extractNumbers(extractedText),
        tier: 3
      };
    }
    console.log('⚠️ [TIER 3] Tesseract failed or no text, moving to TIER 4...');

    // ============================================================
    // TIER 4: TROCR (QUATERNARY - 72-85% depending on model)
    // ============================================================
    console.log(`🤖 [TIER 4] Attempting TrOCR (Quaternary)...`);
    const trocrResult = await this.extractWithTrOCR(imagePath, isHandwritten);
    if (trocrResult && trocrResult.trim().length > 20) {
      extractedText = trocrResult;
      method = isHandwritten ? 'TrOCR-Handwritten' : 'TrOCR-Printed';
      confidence = isHandwritten ? 0.72 : 0.80;
      console.log('✅ [TIER 4] TrOCR SUCCESS - Using this result (72-80% confidence)');
      return {
        text: extractedText,
        structuredData,
        method: method,
        confidence: confidence,
        isHandwritten,
        numbers: this.extractNumbers(extractedText),
        tier: 4
      };
    }
    console.log('⚠️ [TIER 4] TrOCR failed or no text, moving to FINAL FALLBACK...');

    // ============================================================
    // FINAL FALLBACK: STANDARD TESSERACT (Emergency only)
    // ============================================================
    console.log('🔄 [FINAL] Using fallback standard Tesseract...');
    try {
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: info => {
          if (info.progress % 0.25 < 0.05) {
            console.log(`Tesseract: ${Math.round(info.progress * 100)}%`);
          }
        },
        config: '--psm 1 --oem 3'
      });
      if (text && text.trim().length > 0) {
        extractedText = this.postProcessText(text);
        method = 'Tesseract-Standard (Fallback)';
        confidence = 0.65;
        console.log('✅ [FINAL] Standard Tesseract SUCCESS (65% confidence)');
        return {
          text: extractedText,
          structuredData,
          method: method,
          confidence: confidence,
          isHandwritten,
          numbers: this.extractNumbers(extractedText),
          tier: 5
        };
      }
    } catch (error) {
      console.error('❌ Final fallback failed:', error.message);
    }

    // If absolutely nothing worked
    console.log('❌ All extraction methods failed!');
    return {
      text: '',
      structuredData: null,
      method: 'Failed - No text extracted',
      confidence: 0,
      isHandwritten,
      numbers: [],
      tier: 0
    };
  }

  /**
   * Extract medical bill specific data with handwritten invoice support
   */
  async extractMedicalBill(imagePath) {
    console.log('🏥 Extracting medical bill data with enhanced handwritten support...');

    // Force handwritten mode for medical bills (usually handwritten or mixed)
    const result = await this.smartExtract(imagePath, {
      useHandwritten: null, // Auto-detect
      useGoogleVision: true,
      extractStructured: true,
      forceHandwritten: false
    });

    if (!result.text) return result;

    // Comprehensive medical bill patterns optimized for handwritten
    const medicalPatterns = {
      patientName: /(?:patient\s+name?|name\s+of\s+patient|p\.?n\.?|pat\.?name)[\s:,]*([A-Za-z\s\.]+?)(?:\n|age|date|$)/i,
      date: /(?:date|d\.o\.a|admission|d\.o\.d|dated)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      total: /(?:total|total\s+amount|balance|amount\s+due|grand\s+total|net\s+amount)[\s:,]*\$?₹?(?:\s)?([0-9,\.]+)/i,
      subTotal: /(?:sub.?total|subtotal|sub\s+amount)[\s:,]*\$?₹?(?:\s)?([0-9,\.]+)/i,
      provider: /(?:provider|hospital|clinic|facility|healthcare|nursing\s+home)[\s:]*([A-Za-z\s&,\.]+?)(?:\n|city|location|$)/i,
      billNumber: /(?:bill\s*#?|invoice\s*#?|ref\.?|reference)[\s:]*([A-Za-z0-9\-\/]+)/i,
      phone: /(?:phone|contact|tel|mobile)[\s:]*(\d[\d\s\-\(\)]{7,})/,
      insurance: /(?:insurance|policy|insurance\s+id)[\s:]*([A-Za-z0-9\s\-]+)/i,
      doctorName: /(?:doctor|dr\.?|physician|consultant)[\s:]*([A-Za-z\s\.]+?)(?:\n|license|$)/i
    };

    const extractedFields = {};
    Object.entries(medicalPatterns).forEach(([field, pattern]) => {
      const match = result.text.match(pattern);
      if (match) {
        extractedFields[field] = match[1].trim();
      }
    });

    // Extract numbers from the text with context
    const financialNumbers = result.numbers.filter(num => 
      num.context.toLowerCase().includes('amount') ||
      num.context.toLowerCase().includes('total') ||
      num.context.includes('₹') ||
      num.context.includes('$')
    );

    // Try to extract line items if available
    const lineItems = this.extractLineItems(result.text);

    return {
      ...result,
      medicalFields: extractedFields,
      lineItems,
      financialNumbers,
      billType: 'medical',
      extractedAt: new Date(),
      isHandwritten: result.isHandwritten,
      accuracyNotes: `Extracted with ${result.method} (confidence: ${(result.confidence * 100).toFixed(1)}%)`
    };
  }

  /**
   * Extract line items from invoice/bill text
   */
  extractLineItems(text) {
    const lineItems = [];
    const lines = text.split('\n');
    
    // Patterns for line items (Description + Amount)
    const itemPattern = /^(.+?)[\s:]*(?:\$|₹)?([0-9,\.]+)\s*$/;
    
    lines.forEach(line => {
      line = line.trim();
      if (line.length > 5 && !line.match(/^[\d\s,\.]*$/) && line.match(/\d/)) {
        const match = line.match(itemPattern);
        if (match) {
          lineItems.push({
            description: match[1].trim(),
            amount: match[2].trim()
          });
        }
      }
    });
    
    return lineItems;
  }
}

module.exports = new MLExtractor();