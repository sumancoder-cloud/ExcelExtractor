const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const XLSX = require('xlsx');
const os = require('os');
const MLExtractor = require('./mlExtractor');

// Get Python executable path that works on both Windows and Linux
const getPythonExecutable = () => {
  const platformOS = os.platform();
  
  // On Linux/Mac: use python3 (Railway runs on Linux)
  if (platformOS !== 'win32') {
    console.log('🐧 Linux/Unix detected - using python3');
    return 'python3';
  }
  
  // On Windows: try multiple possible locations
  console.log('🪟 Windows detected - searching for Python...');
  
  // Try common Python installation paths on Windows
  const pythonPaths = [
    'python',  // If Python is in PATH
    'python3', // If Python3 is in PATH
    `${os.homedir()}\\AppData\\Local\\Programs\\Python\\Python313\\python.exe`,
    `${os.homedir()}\\AppData\\Local\\Programs\\Python\\Python312\\python.exe`,
    `${os.homedir()}\\AppData\\Local\\Programs\\Python\\Python311\\python.exe`,
    'C:\\Python313\\python.exe',
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe',
  ];
  
  // For Windows, try to find an available Python
  for (const pythonPath of pythonPaths) {
    if (fs.existsSync(pythonPath)) {
      console.log('✅ Found Python at:', pythonPath);
      return pythonPath;
    }
  }
  
  // Fallback to generic 'python' if no specific path found
  console.warn('⚠️ Could not find Python in standard locations, using generic "python"');
  return 'python';
};

// ✅ RESTORED TO TESSERACT-ONLY APPROACH
// User confirmed: Tesseract was extracting correctly
// Issue: parseTextToTable was mangling the columns

/**
 * Convert PDF to Excel using Tesseract OCR
 * For direct text PDFs: Extract text directly
 * For scanned PDFs: Convert to images, then OCR each page
 */
const convertPDFToExcel = async (pdfPath) => {
  try {
    console.log('📄 Converting PDF to Excel...');
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    // Try to extract text from PDF first
    let extractedText = data.text || '';
    let extractionMethod = 'PDF Text Extraction';
    let confidence = 0.85;
    
    // If very little text found, it's likely ascan ned PDF
    if (!extractedText || extractedText.trim().length < 100) {
      console.log('📸 Scanned PDF detected - Converting to images for OCR...');
      extractionMethod = 'Tesseract OCR (Scanned PDF)';
      confidence = 0.75;
      extractedText = await extractScannedPDFWithOCR(pdfPath);
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from PDF');
    }
    
    // Clean up and normalize text
    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line);
    const tableData = parseTextToTable(lines);
    
    // Create Excel file
    const excelPath = pdfPath.replace(path.extname(pdfPath), '.xlsx');
    await createExcelFile(tableData, excelPath);
    
    console.log('✅ PDF to Excel conversion completed');
    
    return {
      excelPath,
      extractedText: lines,
      tableData,
      extractionMethod,
      confidence
    };
  } catch (error) {
    console.error('❌ PDF conversion error:', error.message);
    throw new Error(`PDF conversion failed: ${error.message}`);
  }
};

/**
 * Convert Image to Excel using Tesseract OCR
 */
const convertImageToExcel = async (imagePath) => {
  try {
    console.log('🖼️ Converting image to Excel...');
    
    let extractedText = '';
    let extractionMethod = 'Tesseract OCR';
    let confidence = 0.8;
    
    console.log('🤖 Running Tesseract OCR...');
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: info => {
        if (Math.round(info.progress * 100) % 25 === 0) {
          console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
        }
      },
      config: '--psm 1 --oem 3'
    });
    
    extractedText = text;
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Tesseract returned no text');
    }
    
    console.log(`✅ OCR completed - Extracted ${extractedText.length} characters`);
    
    // Parse OCR text into structured data
    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line);
    const tableData = parseTextToTable(lines);
    
    // Create Excel file
    const excelPath = imagePath.replace(path.extname(imagePath), '.xlsx');
    await createExcelFile(tableData, excelPath);
    
    console.log('✅ Image to Excel conversion completed');
    
    return {
      excelPath,
      extractedText: lines,
      tableData,
      extractionMethod,
      confidence
    };
  } catch (error) {
    console.error('❌ Image conversion error:', error.message);
    throw new Error(`Image conversion failed: ${error.message}`);
  }
};

/**
 * Extract text from scanned PDF by converting pages to images
 * Then uses Tesseract OCR on each image
 */
const extractScannedPDFWithOCR = async (pdfPath) => {
  return new Promise((resolve, reject) => {
    try {
      const { spawn } = require('child_process');
      const tempDir = path.join(path.dirname(pdfPath), `pdf_temp_${Date.now()}`);
      
      console.log('🐍 Converting PDF pages to images...');
      
      // Python script to convert PDF to images using pdfplumber
      const pythonScript = `
import sys
import json
import os

pdf_path = r'${pdfPath}'
output_dir = r'${tempDir}'

try:
    import pdfplumber
    from PIL import Image
    
    os.makedirs(output_dir, exist_ok=True)
    image_paths = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f'Converting {len(pdf.pages)} PDF pages to images...', file=sys.stderr)
        
        for page_idx, page in enumerate(pdf.pages):
            try:
                # Render page at 150 DPI for better OCR accuracy
                pix = page.to_image(resolution=150)
                image_path = os.path.join(output_dir, f'page_{page_idx}.png')
                pix.save(image_path)
                image_paths.append(image_path)
                print(f'✓ Converted page {page_idx + 1}', file=sys.stderr)
            except Exception as e:
                print(f'✗ Error on page {page_idx + 1}: {str(e)}', file=sys.stderr)
    
    result = {
        "success": True,
        "total_pages": len(image_paths),
        "images": image_paths
    }
    print(json.dumps(result))
    
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;
      
      // Use getPythonExecutable() instead of hardcoded path
      const pythonExe = getPythonExecutable();
      console.log('🐍 Using Python executable:', pythonExe);
      
      const python = spawn(pythonExe, ['-c', pythonScript], {
        timeout: 180000,
        maxBuffer: 20 * 1024 * 1024,
        windowsHide: true
      });
      
      let output = '';
      let errorOutput = '';
      
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stdout.write(data);
      });
      
      const timeout = setTimeout(() => {
        python.kill();
        reject(new Error('PDF conversion timeout'));
      }, 180000);
      
      python.on('close', async (code) => {
        clearTimeout(timeout);
        
        if (code === 0 && output.trim()) {
          try {
            const result = JSON.parse(output.trim());
            
            if (!result.success) {
              return reject(new Error(`Conversion failed: ${result.error}`));
            }
            
            console.log(`✅ Converted ${result.total_pages} pages`);
            console.log('📖 Running OCR on each page...');
            
            let allText = [];
            
            for (let i = 0; i < result.images.length; i++) {
              const imagePath = result.images[i];
              console.log(`[${i + 1}/${result.total_pages}] OCRing page...`);
              
              try {
                const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
                  config: '--psm 1 --oem 3'
                });
                
                if (text && text.trim().length > 0) {
                  allText.push(`--- PAGE ${i + 1} ---\n${text}`);
                  console.log(`✓ Page ${i + 1}: ${text.length} characters`);
                }
              } catch (ocrError) {
                console.warn(`⚠️ OCR failed for page ${i + 1}: ${ocrError.message}`);
              }
            }
            
            // Cleanup temp files
            try {
              const fsPromises = fs.promises;
              for (const img of result.images) {
                await fsPromises.unlink(img).catch(() => {});
              }
              await fsPromises.rmdir(tempDir).catch(() => {});
            } catch (e) {
              console.warn('⚠️ Cleanup warning (non-critical):', e.message);
            }
            
            if (allText.length === 0) {
              reject(new Error('No text extracted from PDF'));
            } else {
              resolve(allText.join('\n\n'));
            }
            
          } catch (parseError) {
            reject(new Error(`Parse error: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Conversion failed: ${errorOutput || 'Unknown error'}`));
        }
      });
      
      python.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`Python execution failed: ${err.message}`));
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * FIXED: Smart text parsing that properly handles OCR output
 * Detects column structure using tabs, pipes, or multiple spaces
 * IMPORTANT: This was broken before - it was creating "totaldoctorclinichospita" repeated patterns
 */
const parseTextToTable = (lines) => {
  if (!lines || lines.length === 0) {
    return [['No data']];
  }
  
  const tableData = [];
  let maxCols = 1;
  
  // Parse each line and split by delimiters
  lines.forEach((line) => {
    if (!line || line.trim().length === 0) {
      return; // Skip empty lines
    }
    
    let cells = [];
    
    // Try delimiters in order of priority
    if (line.includes('\t')) {
      // Tab-delimited (most reliable)
      cells = line.split('\t').map(c => c.trim()).filter(c => c.length > 0);
    } else if (line.includes('|')) {
      // Pipe-delimited
      cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    } else if (/  {2,}/.test(line)) {
      // Multiple spaces (common in OCR output from scanned documents)
      cells = line.split(/  +/).map(c => c.trim()).filter(c => c.length > 0);
    } else if (line.includes(',')) {
      // CSV-style (comma-separated)
      cells = line.split(',').map(c => c.trim()).filter(c => c.length > 0);
    } else {
      // Single column - put entire line in one cell
      cells = [line.trim()];
    }
    
    if (cells.length > 0) {
      tableData.push(cells);
      maxCols = Math.max(maxCols, cells.length);
    }
  });
  
  // Normalize all rows to have the same columns
  const normalizedData = tableData.map((row) => {
    const normalized = [...row];
    
    // Pad with empty strings if row has fewer columns
    while (normalized.length < maxCols) {
      normalized.push('');
    }
    
    // Trim if row has more columns  than max
    return normalized.slice(0, maxCols);
  });
  
  return normalizedData.length > 0 ? normalizedData : [['No data']];
};

/**
 * Create properly formatted Excel file
 */
const createExcelFile = async (tableData, outputPath) => {
  try {
    console.log('📋 Creating Excel file...');
    
    if (!Array.isArray(tableData) || tableData.length === 0) {
      tableData = [['No data found']];
    }
    
    const EXCEL_CELL_LIMIT = 32767;
    
    // Clean and validate data
    const cleanedData = tableData.map((row) => {
      if (!Array.isArray(row)) {
        return [String(row).substring(0, EXCEL_CELL_LIMIT)];
      }
      return row.map((cell) => {
        if (cell === null || cell === undefined) {
          return '';
        }
        const cellStr = String(cell);
        if (cellStr.length > EXCEL_CELL_LIMIT) {
          console.warn(`⚠️ Cell truncated (${cellStr.length} → ${EXCEL_CELL_LIMIT} chars)`);
          return cellStr.substring(0, EXCEL_CELL_LIMIT - 3) + '...';
        }
        return cellStr;
      });
    });
    
    console.log(`📊 Table: ${cleanedData.length} rows × ${cleanedData[0]?.length || 0} columns`);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(cleanedData);
    
    // Auto-size columns based on content
    const colWidths = [];
    cleanedData.forEach((row) => {
      row.forEach((cell, idx) => {
        const width = Math.min(String(cell).length + 2, 50);
        colWidths[idx] = Math.max(colWidths[idx] || 10, width);
      });
    });
    ws['!cols'] = colWidths.map((w) => ({ wch: w }));
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Write file
    XLSX.writeFile(wb, outputPath);
    console.log(`✅ Excel file saved: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ Excel creation error:', error.message);
    throw new Error(`Failed to create Excel: ${error.message}`);
  }
};

module.exports = {
  convertPDFToExcel,
  convertImageToExcel,
};
