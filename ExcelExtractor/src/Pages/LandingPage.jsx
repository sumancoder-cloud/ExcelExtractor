import React from 'react';
import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { FaHamburger, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import {faUpload, faFilePdf,faFileExcel,faCalendarCheck, faImage, faSpinner}  from '@fortawesome/free-solid-svg-icons';
import {Link} from "react-router-dom"
import { uploadFile } from '../api';
import ConversionAnimation from '../Components/ConversionAnimation';
const LandingPage=()=>{
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const MAX_UPLOADS = 3; // Limit for non-logged in users
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [convertedFiles, setConvertedFiles] = useState([]);
    const [uploadType, setUploadType] = useState('pdf'); // 'pdf' or 'image'
    const [showAnimation, setShowAnimation] = useState(false);
    const [currentConvertingFile, setCurrentConvertingFile] = useState(null);
    const [showMenu,setShowMenu]=useState(false);

const showCard=()=>{
    setShowMenu(!showMenu);
}

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleChange = (e) => {
        // Check if it's the dropdown change or file upload
        if (e.target.type === 'select-one') {
            setUploadType(e.target.value);
            // Reset uploaded files when changing type
            setUploadedFiles([]);
            setConvertedFiles([]);
            return;
        }

        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let validFiles = [];

        // Validate each file
        for (let file of files) {
            // Check upload limit
            if (uploadedFiles.length + validFiles.length >= MAX_UPLOADS) {
                alert(`You can only upload up to ${MAX_UPLOADS} files without logging in. Please login for unlimited uploads.`);
                break;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" exceeds 50MB limit. Skipping.`);
                continue;
            }

            // Validate file type based on selected upload type
            let allowedTypes = [];
            if (uploadType === 'pdf') {
                allowedTypes = ['application/pdf'];
            } else if (uploadType === 'image') {
                allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            }

            if (!allowedTypes.includes(file.type)) {
                const typeText = uploadType === 'pdf' ? 'PDF' : 'Image (JPG, PNG, WEBP)';
                alert(`File "${file.name}" is not a valid ${typeText} file. Skipping.`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) {
            e.target.value = "";
            return;
        }

        // Show processing state
        setIsProcessing(true);
        
        // Simulate processing delay
        setTimeout(() => {
            setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
            setIsProcessing(false);
        }, 1000);

        e.target.value = "";
    };

    const handleConvert = async () => {
        if (uploadedFiles.length === 0) return;

        console.log('Starting conversion for', uploadedFiles.length, 'files...');

        setConverting(true);
        setProgress(0);
        setConvertedFiles([]);
        setShowAnimation(true);

        try {
            // Process all files in parallel
            const conversionPromises = uploadedFiles.map(async (file, index) => {
                console.log(`Converting file ${index + 1}/${uploadedFiles.length}:`, file.name);

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await uploadFile(formData, (percentCompleted) => {
                        // Update progress for this specific file
                        const fileProgress = (percentCompleted / uploadedFiles.length);
                        setProgress(prev => Math.min(prev + fileProgress, 99));
                    });

                    console.log('Conversion successful for:', file.name);

                    const blob = new Blob([response.data]);
                    const url = window.URL.createObjectURL(blob);
                    const convertedName = file.name.replace(/\.[^/.]+$/, '') + '.xlsx';

                    return {
                        url: url,
                        name: convertedName,
                        originalName: file.name,
                        success: true
                    };
                } catch (error) {
                    console.error(`Error converting ${file.name}:`, error);
                    return {
                        originalName: file.name,
                        success: false,
                        error: error.response?.data?.message || error.message
                    };
                }
            });

            // Wait for all conversions to complete
            const results = await Promise.all(conversionPromises);

            // Separate successful conversions from failures
            const successful = results.filter(result => result.success);
            const failed = results.filter(result => !result.success);

            // Show results
            if (successful.length > 0) {
                setConvertedFiles(successful);
                setProgress(100);
            }

            // Show error messages for failed conversions
            if (failed.length > 0) {
                const errorMessages = failed.map(f => `${f.originalName}: ${f.error}`).join('\n');
                alert(`Some files failed to convert:\n${errorMessages}`);
            }

        } catch (error) {
            console.error('Conversion error:', error);
            alert('Error during conversion. Please try again.');
        } finally {
            setConverting(false);
            setShowAnimation(false);
            setCurrentConvertingFile(null);
        }
    };

    const handleDownload = (index) => {
        if (!convertedFiles[index]) return;
        
        const convertedFile = convertedFiles[index];
        const link = document.createElement('a');
        link.href = convertedFile.url;
        link.setAttribute('download', convertedFile.name);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveAllFiles = () => {
        setUploadedFiles([]);
        setConvertedFiles([]);
    };

    const handleRetryConversion = () => {
        // Clear animation and reset to upload state
        setShowAnimation(false);
        setCurrentConvertingFile(null);
        setProgress(0);
        setConverting(false);
        // Optionally scroll to upload section
        setTimeout(() => {
            const uploadSection = document.querySelector('[data-upload-section]');
            if (uploadSection) {
                uploadSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };
    return ( 
        <>
        {/* Conversion Animation Full Page */}
        {showAnimation && currentConvertingFile && (
            <ConversionAnimation 
                fileType={currentConvertingFile.type}
                fileName={currentConvertingFile.name}
                convertedFileUrl={currentConvertingFile.url}
                convertedFileName={currentConvertingFile.convertedName}
                onRetry={handleRetryConversion}
                onComplete={() => setShowAnimation(false)}
            />
        )}

        {/* Main Content - Hidden during animation */}
        {!showAnimation && (
        <>
        
        <div className=" flex bg-orange-500 w-full h-[80px] justify-between items-center shadow-lg top-0 left-0 fixed z-50">
            <div  className="flex justify-between text-white text-3xl font-semibold items-center m-5">
                <h1 className="text-white font-new">ExcelExtractor</h1>
                
            </div>
            <div className="flex justify-center items-center">
                <ul className="hidden md:flex gap-5 font-semibold text-white ">
                <li className="cursor-pointer">Features</li>
                    <select className="cursor-pointer bg-white text-orange-600 border-2 border-white rounded-lg px-4 py-2 font-medium hover:bg-orange-50 transition-colors duration-200" value={uploadType} onChange={handleChange}>
                        <option value="pdf" className="text-gray-800">PDF To Excel</option>
                        <option value="image" className="text-gray-800">Image To Excel</option>
                    </select>
                    <li className="cursor-pointer">Contact Us</li>
                </ul>
            </div>
            <div className="flex justify-between gap-10 m-10">
                <button className=" hidden md:flex  bg-white px-5 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"><Link to='/login'>Login</Link></button>
        <div>
            <button className="md:hidden text-white w-[30px] text-2xl cursor-pointer hover:text-gray-300 "onClick={()=>setShowMenu(!showMenu)}><FaHamburger /></button>
        </div>
            </div>

        </div>

        {/* Mobile Menu Card */}
{showMenu && (
  <div className="fixed top-20 right-4 bg-white w-[200px] h-[350px] rounded-lg shadow-lg z-50 md:hidden p-5">
    <div className="flex flex-col gap-5 ">
        <ul className="flex flex-col gap-5 justify-center items-center">
            <li className="cursor-pointer border-2 w-full px-5 py-2">Features</li>
            <div className="px-4 py-2 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Type</label>
                <select value={uploadType} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="pdf">PDF to Excel</option>
                    <option value="image">Image to Excel</option>
                </select>
            </div>
           <button className="bg-orange-500 w-full px-5 py-2 text-white hover:bg-orange-200 cursor-pointer "><Link to='/login'>Login</Link></button>
        </ul>
    </div>
  </div>
)}

        

        <div className="flex justify-center mt-[100px]">
            <h1 className="font-bold max-text-4xl md:text-4xl">
                {uploadType === 'pdf' ? 'PDF TO EXCEL CONVERTER' : 'IMAGE TO EXCEL CONVERTER'}
            </h1>
        </div>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
            <div className="flex justify-center px-4 mt-6" data-upload-section>
                <div className="bg-white border-2 border-gray-300 rounded-lg p-6 w-full max-w-[800px] shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Uploaded Files ({uploadedFiles.length})</h3>
                        <button
                            onClick={handleRemoveAllFiles}
                            disabled={converting}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Clear All
                        </button>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <FaFileAlt className="text-gray-600 text-2xl" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    disabled={converting}
                                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-all disabled:bg-gray-200 disabled:cursor-not-allowed"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleConvert}
                            disabled={converting}
                            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {converting ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                    Converting... {Math.round(progress)}%
                                </>
                            ) : (
                                `Convert ${uploadedFiles.length} File${uploadedFiles.length > 1 ? 's' : ''}`
                            )}
                        </button>
                    </div>

                    {convertedFiles.length > 0 && (
                        <div className="mt-4">
                            <p className="w-full text-center text-green-600 font-semibold py-2">
                                ✓ {convertedFiles.length}/{uploadedFiles.length} files converted!
                            </p>
                        </div>
                    )}

                    {converting && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Converted Files Display */}
        {convertedFiles.length > 0 && (
            <div className="flex justify-center px-4 mt-6">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 w-full max-w-[800px] shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ready for Download ({convertedFiles.length})</h3>
                    <div className="space-y-2">
                        {convertedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-green-200">
                                <div className="flex items-center gap-3 flex-1">
                                    <FaFileAlt className="text-green-600 text-2xl" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                                        <p className="text-xs text-gray-500">From: {file.originalName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(index)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all text-sm"
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-center px-4 mt-10">
            <div className="flex justify-center items-center bg-orange-500 w-full max-w-[800px] h-[250px] md:h-[350px] border-dashed border-white border-10 outline outline-orange rounded-4xl">
                <div className="flex flex-col bg-white w-full max-w-md py-8 sm:px-6 sm:py-4 justify-center">
                    <div className="flex justify-center mb-2 gap-2">
                        <FontAwesomeIcon 
                            icon={uploadType === 'pdf' ? faFilePdf : faImage} 
                            className={`text-3xl ${uploadType === 'pdf' ? 'text-red-400' : 'text-blue-400'}`}
                        />
                        <span className="text-2xl">to</span>
                        <FontAwesomeIcon 
                            icon={faFileExcel} 
                            className="text-3xl text-green-400"
                        />
                    </div>
                    <p className="text-center mb-2 text-sm font-semibold text-gray-700">
                        {uploadType === 'pdf' ? 'PDF' : 'Image'} to Excel Converter
                    </p>

                    {isProcessing && (
                        <div className="mb-4 px-4">
                            <div className="flex flex-col items-center">
                                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-orange-500 animate-spin mb-2" />
                                <p className="text-center text-sm font-semibold">Processing your file...</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center items-center">
                        <label className="
                            flex flex-col justify-center items-center
                            w-[280px] h-[100px]
                            border-2 border-gray-400
                            rounded-lg
                            cursor-pointer
                            hover:bg-gray-100
                            hover:border-orange-500
                            transition-all duration-300">
                            <span className="text-sm font-semibold text-gray-600">
                                {uploadedFiles.length > 0 ? 'Add More Files' : `Drag & drop ${uploadType === 'pdf' ? 'PDFs' : 'Images'}`}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {uploadType === 'pdf' ? '(PDF - Max 50MB each)' : '(JPG, PNG, WEBP - Max 50MB each)'}
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept={uploadType === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.webp'}
                                onChange={handleChange}
                                multiple
                                disabled={isProcessing || converting}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
<div className="flex m-10 justify-center items-center  gap-30">
    <div>
    <p>
        {uploadType === 'pdf' 
            ? 'Easily convert your PDFs into editable Excel files online for free. Extract data and make it easy to edit in a spreadsheet—no signups or downloads necessary.'
            : 'Easily convert your images into editable Excel files online for free. Extract data from photos, screenshots, and scanned documents—no signups or downloads necessary.'
        }
    </p>
    </div>
    <div className="flex flex-col justify-center items-center ">
        <ul >
            <li className=""><FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500"/>
                {uploadType === 'pdf' 
                    ? 'Convert PDFs to Excel instantly'
                    : 'Convert Images to Excel instantly'
                }
            </li>
            <li className=""><FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500"/>
                {uploadType === 'pdf' 
                    ? 'Easily extract text from scanned PDFs using optical character recognition (OCR)'
                    : 'Extract data from photos, screenshots, and scanned images using OCR'
                }
            </li>
            <li className=""><FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500"/>No Necessary Downloads or SignUps ,Preview Directly here itself</li>

            
        </ul>
    </div>
</div>
<div className="flex flex-col justify-center m-30 items-center">
    <h1 className="text-4xl flex justify-center font-semibold ">
        {uploadType === 'pdf' 
            ? 'Convert PDF to Excel in Seconds'
            : 'Convert Images to Excel in Seconds'
        }
    </h1>
    <div className="m-5">
    <p>
        {uploadType === 'pdf' 
            ? 'Need to turn your PDFs into fully editable Excel spreadsheets? Maybe you have a scanned receipt you want to add to an Excel document? No need to copy and paste. Our tool accurately extracts tables, numbers, and formatting, making it easy to edit however you want.'
            : 'Need to turn your images into fully editable Excel spreadsheets? Have photos of receipts, charts, or tables you want to convert to Excel? No need to manually type everything. Our tool uses OCR to accurately extract data from images, making it easy to edit however you want.'
        }
    </p>
    </div>
</div>

<div className="flex flex-col justify-center items-center m-30 ">
    <div className="flex flex-col justify-center items-center">
        <img 
            src={uploadType === 'pdf' ? "/assets/img3.webp" : "https://i.ytimg.com/vi/40h4_Ca9ZY4/hqdefault.jpg"} 
            className=" h-[300px] text-orange-400" 
            alt={uploadType === 'pdf' ? "scanned documents" : "table extraction"}
        />
        <h1 className="text-4xl font-semibold mb-6">
            {uploadType === 'pdf' 
                ? 'Work With Scanned Documents'
                : 'Extract Data from Any Image'
            }
        </h1>
        <p>
            {uploadType === 'pdf' 
                ? 'Easily extract text from scanned PDFs using optical character recognition (OCR). Snap a photo of receipts, invoices, or other documents, convert them to PDFs, and transform them into editable Excel files.'
                : 'Extract data from photos, screenshots, and scanned images using OCR. Convert images of tables, charts, and documents into fully editable Excel spreadsheets.'
            }
        </p>
    </div>
</div>
<div className="flex flex-col justify-center items-center m-30">
    <div className="flex flex-col justify-center items-center">
        <img 
            src={uploadType === 'pdf' ? "/assets/img4.svg" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ8CCLeKuvWlFp-zQqKIHj2nvILtpc7jQXCQ&s"} 
            className=" h-[300px] text-orange-400" 
            alt={uploadType === 'pdf' ? "teamwork" : "data visualization"}
        />
        <h1 className="text-4xl font-semibold mb-6">
            {uploadType === 'pdf' 
                ? 'Teamwork Made Easy'
                : 'Perfect for Data Analysis'
            }
        </h1>
        <p>
            {uploadType === 'pdf' 
                ? 'After converting, easily share your Excel files with teammates. Generate a shareable link, email it directly, or save it to cloud storage like Google Drive, Dropbox, or Smallpdf.'
                : 'Convert charts, graphs, and data visualizations from images into Excel format. Perfect for data analysis, reporting, and creating interactive spreadsheets from visual data.'
            }
        </p>
        
    </div>
</div>
<div className="flex flex-col justify-center items-center m-30">
    <div className="flex flex-col justify-center items-center">
        <img 
            src={uploadType === 'pdf' ? "/assets/img1.svg" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn3YiIZv6rBjkEaSGu0CUvRL7wGnLYo1ekTw&s"} 
            className=" h-[300px] text-orange-400" 
            alt={uploadType === 'pdf' ? "quick conversion" : "image recognition"}
        />
        <h1 className="text-4xl font-semibold mb-6">
            {uploadType === 'pdf' 
                ? 'Quick and Effortless Conversion'
                : 'Smart Image Recognition'
            }
        </h1>
        <p>
            {uploadType === 'pdf' 
                ? 'Skip the downloads and registrations. Simply upload your PDF, convert it to Excel in seconds, and continue your work.'
                : 'Our AI-powered OCR recognizes tables, columns, and data structures in images. Convert complex tabular data from photos into properly formatted Excel spreadsheets.'
            }
        </p>
        
    </div>
</div>
<div className="max-w-6xl mx-auto px-4 py-12">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">
        Fast Conversion
      </h3>
      <p className="text-gray-600 text-sm">
        Convert PDF files to Excel instantly without delays or extra steps.
      </p>
    </div>

 
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">
        No Installation
      </h3>
      <p className="text-gray-600 text-sm">
        No software downloads or sign-ups required. Everything works online.
      </p>
    </div>

  
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">
        Secure Files
      </h3>
      <p className="text-gray-600 text-sm">
        Your documents are processed securely and deleted automatically.
      </p>
    </div>

  </div>
</div>
<div className="flex flex-col justify-center items-center">
    <div className="flex flex-col bg-gray-300 w-max-auto h-max-auto w-100 h-150 px-5 rounded-lg py-10 ">
          <h1 className="text-3xl font-semibold">
            {uploadType === 'pdf' 
                ? 'How To Convert PDF to Excel for Free'
                : 'How To Convert Images to Excel for Free'
            }
          </h1><br></br>
          <div className="text-lg">
            <ol type="1">
                <li>
                    {uploadType === 'pdf' 
                        ? '1. Import or drag & drop your PDF file to our converter.'
                        : '1. Import or drag & drop your image file to our converter.'
                    }
                </li><br></br>
                <li>
                    {uploadType === 'pdf' 
                        ? '2. Apply OCR to PDFs without editable text.'
                        : '2. Our AI automatically recognizes and extracts data from your image.'
                    }
                </li><br></br>
                <li>3. Click "Convert" and wait just a few seconds.</li><br></br>
                <li>4. Download or share your converted XLSX file—easy!</li>
            </ol>
          </div>
          <img 
            src={uploadType === 'pdf' ? "/assets/img1.svg" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn3YiIZv6rBjkEaSGu0CUvRL7wGnLYo1ekTw&s"} 
            alt={uploadType === 'pdf' ? "conversion workflow" : "image conversion workflow"}
          />
    </div>

</div>
<footer className="bg-orange-500 w-full mt-40">
  <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center text-white">

   
    <ul className="flex flex-col md:flex-row gap-6 md:gap-10 cursor-pointer mb-6 md:mb-0">
      <li><a href="/">Privacy Notice</a></li>
      <li><a href="/">Terms and Conditions</a></li>
      <li><a href="/">Imprint</a></li>
      <li><a href="/">Contact Us</a></li>
    </ul>

    
    <p className="text-sm text-center">
      &copy; 2026 ExcelExtractor. All rights reserved.
    </p>

  </div>
</footer>

        </>
        )}
        </>
    )
}

export default LandingPage;
