const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const XLSX = require('xlsx');
const MLExtractor = require('./mlExtractor');

/**
 * Convert PDF to Excel using PDF parser with Tesseract OCR fallback for scanned PDFs
 */
const convertPDFToExcel = async (pdfPath) => {
  try {
    console.log('📄 Converting PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    let extractedText = data.text || '';
    let extractionMethod = 'PDF Parser';
    
    // If PDF text extraction yields too little text (scanned PDF), we'd need image conversion
    // For now, just use what we have
    if (!extractedText || extractedText.trim().length === 0) {
      console.log('⚠️ PDF appears to be scanned (no text extracted)');
      extractedText = 'Scanned PDF - Text extraction not available';
      extractionMethod = 'Scanned PDF (Requires OCR)';
    } else {
      console.log('✅ PDF text extracted successfully');
    }
    
    // Parse text into structured data
    const lines = extractedText.split('\n').filter(line => line.trim());
    const tableData = parseTextToTable(lines);
    
    // Create Excel file
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Save to file
    const excelPath = pdfPath.replace(path.extname(pdfPath), '.xlsx');
    XLSX.writeFile(wb, excelPath);
    
    return {
      excelPath,
      extractedText: lines,
      tableData,
      extractionMethod,
      confidence: extractionMethod === 'PDF Parser' ? 0.9 : 0.5
    };
  } catch (error) {
    throw new Error(`PDF conversion failed: ${error.message}`);
  }
};

/**
 * Convert Image to Excel using ML Model (default) with Tesseract fallback
 */
const convertImageToExcel = async (imagePath, useML = true) => {
  try {
    let extractedText = '';
    let extractionMethod = 'ML Model';
    let confidence = 0.8;

    // Use ML by default for images
    if (useML) {
      console.log('🤖 Using ML-powered extraction (default)...');
      try {
        const mlResult = await MLExtractor.smartExtract(imagePath);
        if (mlResult.text) {
          extractedText = mlResult.text;
          extractionMethod = mlResult.method || 'ML Model';
          confidence = mlResult.confidence || 0.8;
          console.log(`✅ ML extraction successful with ${extractionMethod}`);
        }
      } catch (error) {
        console.log('⚠️ ML extraction failed, falling back to Tesseract:', error.message);
      }
    }

    // Fallback to Tesseract if ML failed or not requested
    if (!extractedText) {
      console.log('📝 Using Tesseract OCR fallback...');
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: info => console.log(info),
      });
      extractedText = text;
      extractionMethod = 'Tesseract OCR';
      confidence = 0.7;
      console.log('✅ Tesseract OCR completed');
    }

    // Parse OCR text into structured data
    const lines = extractedText.split('\n').filter(line => line.trim());
    const tableData = parseTextToTable(lines);

    // Create Excel file
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Save to file
    const excelPath = imagePath.replace(path.extname(imagePath), '.xlsx');
    XLSX.writeFile(wb, excelPath);

    // Return both extracted text and excel path
    return {
      excelPath,
      extractedText: lines,
      tableData,
      extractionMethod,
      confidence
    };
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
};

/**
 * Parse text lines into table structure
 * This is a simple implementation - can be enhanced based on specific formats
 */
const parseTextToTable = (lines) => {
  const tableData = [];
  
  // Detect if line contains potential table data (has multiple words/numbers)
  lines.forEach(line => {
    // Split by multiple spaces, tabs, or common delimiters
    const cells = line
      .split(/\s{2,}|\t|\|/)
      .map(cell => cell.trim())
      .filter(cell => cell);
    
    if (cells.length > 0) {
      tableData.push(cells);
    }
  });
  
  // If no structured data found, put each line as a single cell
  if (tableData.length === 0) {
    lines.forEach(line => {
      tableData.push([line]);
    });
  }
  
  return tableData;
};

/**
 * Enhanced parser for invoice/bill formats
 * Detects key-value pairs common in invoices
 */
const parseInvoiceData = (text) => {
  const data = [];
  const lines = text.split('\n');
  
  // Common invoice fields
  const patterns = {
    'Invoice Number': /invoice\s*#?\s*:?\s*(\S+)/i,
    'Date': /date\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    'Total': /total\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
    'Amount': /amount\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
  };
  
  // Extract key information
  data.push(['Field', 'Value']);
  
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      data.push([key, match[1]]);
    }
  });
  
  // Add all lines as items
  data.push(['', '']);
  data.push(['Raw Data', '']);
  lines.forEach(line => {
    if (line.trim()) {
      data.push([line.trim()]);
    }
  });
  
  return data;
};

module.exports = {
  convertPDFToExcel,
  convertImageToExcel,
};
