const { HfInference } = require('@huggingface/inference');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Enhanced ML-powered image to text extraction
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
   * Extract text using TrOCR (Transformer-based OCR)
   */
  async extractWithTrOCR(imagePath, handwritten = false) {
    try {
      console.log('🔍 Using TrOCR for enhanced OCR...');

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const model = handwritten ? this.models.trocr_handwritten : this.models.trocr;

      const result = await hf.imageToText({
        model: model,
        data: base64Image,
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
          { type: 'TEXT_DETECTION' },
          { type: 'DOCUMENT_TEXT_DETECTION' }
        ]
      };

      // Perform text detection
      const [result] = await client.textDetection(request);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        return '';
      }

      // Return the full text from the first annotation
      return detections[0].description || '';
    } catch (error) {
      console.error('Google Vision API failed:', error.message);
      return null;
    }
  }

  /**
   * Smart extraction with fallback strategy
   */
  async smartExtract(imagePath, options = {}) {
    const {
      useHandwritten = false,
      useGoogleVision = false,
      extractStructured = true
    } = options;

    console.log('🚀 Starting smart ML extraction...');

    let extractedText = '';
    let structuredData = null;

    // Try TrOCR first (best for general OCR)
    const trocrResult = await this.extractWithTrOCR(imagePath, useHandwritten);
    if (trocrResult) {
      extractedText = trocrResult;
      console.log('✅ TrOCR extraction successful');
    }

    // Try Google Vision if available and requested
    if (useGoogleVision && !extractedText) {
      const visionResult = await this.extractWithGoogleVision(imagePath);
      if (visionResult) {
        extractedText = visionResult;
        console.log('✅ Google Vision extraction successful');
      }
    }

    // Try Donut for structured extraction
    if (extractStructured && extractedText) {
      try {
        const donutResult = await this.extractWithDonut(imagePath);
        if (donutResult) {
          structuredData = donutResult;
          console.log('✅ Donut structured extraction successful');
        }
      } catch (error) {
        console.log('⚠️ Donut extraction skipped');
      }
    }

    return {
      text: extractedText,
      structuredData,
      method: trocrResult ? 'TrOCR' : (visionResult ? 'Google Vision' : 'Fallback'),
      confidence: structuredData ? 0.9 : 0.7 // Estimated confidence
    };
  }

  /**
   * Extract medical bill specific data
   */
  async extractMedicalBill(imagePath) {
    console.log('🏥 Extracting medical bill data...');

    const result = await this.smartExtract(imagePath, {
      useHandwritten: false,
      useGoogleVision: true,
      extractStructured: true
    });

    if (!result.text) return result;

    // Medical bill specific patterns
    const medicalPatterns = {
      patientName: /(?:patient|name)[\s:]+([A-Za-z\s]+)/i,
      date: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      total: /(?:total|amount|balance)[\s:]*\$?([\d,]+\.?\d*)/i,
      provider: /(?:provider|hospital|clinic)[\s:]+([A-Za-z\s]+)/i,
      insurance: /(?:insurance)[\s:]+([A-Za-z\s\d]+)/i
    };

    const extractedFields = {};
    Object.entries(medicalPatterns).forEach(([field, pattern]) => {
      const match = result.text.match(pattern);
      if (match) {
        extractedFields[field] = match[1].trim();
      }
    });

    return {
      ...result,
      medicalFields: extractedFields,
      billType: 'medical'
    };
  }
}

module.exports = new MLExtractor();