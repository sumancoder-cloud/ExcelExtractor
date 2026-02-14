import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaHamburger, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { faUpload, faFilePdf, faFileExcel, faCalendarCheck, faImage, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { uploadFile, logout } from '../api';
import ConversionAnimation from '../Components/ConversionAnimation';
import { useSecurity } from '../utils/security';

const MainPage = () => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const [showMenu, setShowMenu] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [convertedFiles, setConvertedFiles] = useState([]);
    const [uploadType, setUploadType] = useState('pdf'); // 'pdf' or 'image'
    const [showAnimation, setShowAnimation] = useState(false);
    const [currentConvertingFile, setCurrentConvertingFile] = useState(null);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { secureLogout, checkSecurity } = useSecurity();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.account-menu')) {
                setShowAccountMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check security on component mount and route changes
    useEffect(() => {
        checkSecurity();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            secureLogout();
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API call fails, perform secure logout
            secureLogout();
        }
    };

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

        try {
            const converted = [];
            const totalFiles = uploadedFiles.length;

            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                console.log(`Converting file ${i + 1}/${totalFiles}:`, file.name);
                
                // Show animation for current file
                setCurrentConvertingFile({
                    type: file.type,
                    name: file.name,
                    url: null,
                    convertedName: null
                });
                setShowAnimation(true);
                
                const formData = new FormData();
                formData.append('file', file);
                // ML is used by default for images, Tesseract for PDFs - no option needed

                try {
                    const response = await uploadFile(formData, (percentCompleted) => {
                        const overallProgress = ((i / totalFiles) * 100) + ((percentCompleted / totalFiles));
                        setProgress(Math.min(overallProgress, 99));
                    });

                    console.log('Conversion successful for:', file.name);

                    // Handle new response format with extracted text
                    const responseData = response.data;

                    converted.push({
                        url: responseData.downloadUrl,
                        name: responseData.fileName,
                        originalName: file.name,
                        extractedText: responseData.extractedText,
                        tableData: responseData.tableData,
                        extractionMethod: responseData.extractionMethod,
                        confidence: responseData.confidence
                    });

                    // Update animation with conversion success
                    setProgress(100);
                    setCurrentConvertingFile(prev => ({
                        ...prev,
                        url: responseData.downloadUrl,
                        convertedName: responseData.fileName
                    }));
                    
                    // Keep animation visible for user to interact with
                    // Don't hide it automatically
                } catch (error) {
                    console.error(`Error converting ${file.name}:`, error);
                    console.error('Error details:', {
                        message: error.message,
                        code: error.code,
                        status: error.response?.status,
                        responseData: error.response?.data,
                        responseMessage: error.response?.data?.message,
                        isNetwork: error.message?.includes('Network') || error.code === 'ERR_NETWORK',
                        isTimeout: error.code === 'ECONNABORTED' || error.message?.includes('timeout'),
                    });
                    
                    let errorMsg = error.response?.data?.message || error.message;
                    
                    // Provide helpful error messages
                    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                        errorMsg = 'Upload timeout - file is too large or network is slow. Please try again or try a smaller file.';
                    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
                        errorMsg = 'Network error - please check your connection and ensure the backend is running.';
                    }
                    
                    alert(`Failed to convert ${file.name}: ${errorMsg}`);
                    setShowAnimation(false);
                }
            }

            setConvertedFiles(converted);
        } catch (error) {
            console.error('Conversion error:', error);
            setShowAnimation(false);
            alert('Error during conversion. Please try again.');
        } finally {
            setConverting(false);
        }
    };

    const handleDownload = async (index) => {
        if (!convertedFiles[index]) return;
        
        try {
            const convertedFile = convertedFiles[index];
            
            // If URL is a Cloudinary URL, download directly (simpler approach)
            if (convertedFile.url.includes('cloudinary')) {
                const link = document.createElement('a');
                link.href = convertedFile.url;
                link.setAttribute('download', convertedFile.name);
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                return;
            }
            
            // Fallback for local/backend URLs
            const token = localStorage.getItem('token');
            const response = await fetch(convertedFile.url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                alert('Download failed. Please try again.');
                return;
            }
            
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', convertedFile.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        }
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
                allConvertedFiles={convertedFiles}
                allUploadedFiles={uploadedFiles}
                totalFiles={uploadedFiles.length}
                currentFileIndex={uploadedFiles.findIndex(f => f.name === currentConvertingFile.name)}
                progress={progress}
            />
        )}

        {/* Main Upload Section - Hidden during animation */}
        {!showAnimation && (
        <>
        
        <div className="flex bg-orange-500 w-full h-[80px] justify-between items-center shadow-lg top-0 left-0 fixed z-50 px-6">
            {/* Logo Section */}
            <div className="flex items-center">
                <h1 className="text-white font-bold text-2xl md:text-3xl font-new">ExcelExtractor</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
                <nav className="flex items-center space-x-6">
                    <button className="text-white hover:text-orange-200 font-medium transition-colors duration-200">
                        Features
                    </button>
                    <select
                        value={uploadType}
                        onChange={handleChange}
                        className="bg-white text-orange-600 border-2 border-white rounded-lg px-4 py-2 font-medium hover:bg-orange-50 transition-colors duration-200 cursor-pointer"
                    >
                        <option value="pdf" className="text-gray-800">PDF to Excel</option>
                        <option value="image" className="text-gray-800">Image to Excel</option>
                    </select>
                    
                    <button className="text-white hover:text-orange-200 font-medium transition-colors duration-200">
                        Contact Us
                    </button>
                </nav>

                {/* Account Menu */}
                <div className="relative account-menu">
                    <button
                        onClick={() => setShowAccountMenu(!showAccountMenu)}
                        className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <span>My Account</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showAccountMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                            <div className="py-2">
                                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                    <div className="font-medium">Welcome, {user?.fullName}!</div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAccountMenu(false);
                                        navigate('/profile');
                                    }}
                                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    My Account
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAccountMenu(false);
                                        navigate('/history');
                                    }}
                                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Conversion History
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAccountMenu(false);
                                        handleLogout();
                                    }}
                                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-white hover:text-orange-200 transition-colors duration-200 p-2"
                >
                    <FaHamburger className="text-2xl" />
                </button>
            </div>
        </div>

        {/* Mobile Menu Card */}
        {showMenu && (
            <div className="fixed top-20 right-4 bg-white w-[280px] rounded-xl shadow-2xl z-50 md:hidden border border-gray-200">
                <div className="p-6">
                    {/* User Welcome */}
                    <div className="text-center mb-4 pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600">Welcome back,</div>
                        <div className="font-semibold text-gray-800">{user?.fullName}!</div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-2">
                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 font-medium">
                            Features
                        </button>

                        <div className="px-4 py-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Type</label>
                            <select
                                value={uploadType}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="pdf">PDF to Excel</option>
                                <option value="image">Image to Excel</option>
                            </select>
                        </div>

                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 font-medium">
                            Contact Us
                        </button>
                    </nav>

                    {/* Account Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                navigate('/profile');
                            }}
                            className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
                        >
                            My Account
                        </button>
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                navigate('/history');
                            }}
                            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
                        >
                            Conversion History
                        </button>
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                handleLogout();
                            }}
                            className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-center mt-[100px]">
            <h1 className="font-bold text-2xl md:text-4xl">
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
<div className="flex m-10 justify-center items-center gap-30">
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
            alt={uploadType === 'pdf' ? "scanned documents" : "image data extraction"}
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
                : 'Extract data from photos, screenshots, and scanned images using advanced OCR technology. Convert tables, charts, and text from any image format into fully editable Excel spreadsheets.'
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
            alt={uploadType === 'pdf' ? "quick conversion" : "image conversion"}
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
        {uploadType === 'pdf' 
            ? 'Convert PDF files to Excel instantly without delays or extra steps.'
            : 'Convert image files to Excel instantly using advanced OCR technology.'
        }
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
        {uploadType === 'pdf' ? 'Secure Files' : 'High Accuracy'}
      </h3>
      <p className="text-gray-600 text-sm">
        {uploadType === 'pdf' 
            ? 'Your documents are processed securely and deleted automatically.'
            : 'Advanced OCR technology ensures high accuracy in text and data extraction.'
        }
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
            src={uploadType === 'pdf' ? "/assets/img1.svg" : "/assets/image-to-excel-sample.svg"} 
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

export default MainPage;
