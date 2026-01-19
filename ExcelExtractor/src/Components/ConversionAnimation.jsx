import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faDownload, faRedo, faStar, faImage, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

const ConversionAnimation = ({ fileType, fileName, convertedFileUrl, convertedFileName, onRetry, onComplete, allConvertedFiles = [], allUploadedFiles = [], totalFiles = 1, currentFileIndex = 0, progress = 0 }) => {
  const [particles, setParticles] = useState([]);
  const [sprinkles, setSprinkles] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [suggestions, setSuggestions] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Display progress for all files
  const isAllComplete = allConvertedFiles.length === allUploadedFiles.length && allConvertedFiles.length > 0;
  const displayProgress = isAllComplete ? 100 : progress;

  useEffect(() => {
    // Create flowing particles
    const particleInterval = setInterval(() => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: 10, // Start from left
        y: Math.random() * 100, // Random vertical position
        speed: 2 + Math.random() * 3, // Random speed
      };
      setParticles(prev => [...prev, newParticle]);
    }, 300);

    return () => clearInterval(particleInterval);
  }, []);

  useEffect(() => {
    // Move particles across screen
    const moveInterval = setInterval(() => {
      setParticles(prev =>
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.speed,
        })).filter(particle => particle.x < 90) // Remove when reaching right side
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, []);

  useEffect(() => {
    // Create sprinkles animation
    const sprinkleInterval = setInterval(() => {
      const newSprinkle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: -10,
        speed: 1 + Math.random() * 2,
        rotation: Math.random() * 360,
      };
      setSprinkles(prev => [...prev, newSprinkle]);
    }, 200);

    return () => clearInterval(sprinkleInterval);
  }, []);

  useEffect(() => {
    // Move sprinkles
    const moveSprinkleInterval = setInterval(() => {
      setSprinkles(prev =>
        prev.map(sprinkle => ({
          ...sprinkle,
          y: sprinkle.y + sprinkle.speed,
          rotation: sprinkle.rotation + 5,
        })).filter(sprinkle => sprinkle.y < 110)
      );
    }, 50);

    return () => clearInterval(moveSprinkleInterval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.account-menu')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFeedbackSubmit = async () => {
    try {
      const response = await fetch('/api/convert/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating, suggestions }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-y-auto z-50">
      {/* Header */}
      <div className="flex bg-orange-500 w-full h-[80px] justify-between items-center shadow-lg top-0 left-0 fixed z-50">
        <div className="flex justify-between text-white text-3xl font-semibold items-center m-5">
          <h1 className="text-white font-new">ExcelExtractor</h1>
        </div>
        <div className="flex justify-center items-center mr-5">
          <div className="relative account-menu">
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="bg-white text-orange-500 px-4 py-1 rounded-lg hover:bg-gray-200"
            >
              My Account
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    Welcome!
                  </div>
                  <button 
                    onClick={() => {
                      setShowAccountMenu(false);
                      // Handle My Account click
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Account
                  </button>
                  <button 
                    onClick={() => {
                      setShowAccountMenu(false);
                      // Handle logout - perhaps redirect to login
                      window.location.href = '/login';
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 pt-20 pb-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isAllComplete ? "Conversion Complete!" : "Converting Your Files"}
          </h2>
          <p className="text-gray-600">
            {isAllComplete 
              ? `All ${allConvertedFiles.length} files converted successfully!`
              : `Processing ${currentFileIndex + 1} of ${totalFiles}: ${fileName}`
            }
          </p>
        </div>

        {/* Progress Bar for Multiple Files */}
        {!isAllComplete && (
          <div className="mb-8 w-full max-w-2xl px-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{currentFileIndex + 1} of {totalFiles}</span>
              <span>{Math.round(displayProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${displayProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Animation Area */}
        {!isAllComplete && (
          <div className="relative w-full max-w-4xl h-96 flex items-center justify-between px-8 mb-8">
            {/* Left Side - Source File */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FontAwesomeIcon 
                  icon={fileType && fileType.startsWith('image/') ? faImage : faFilePdf} 
                  className="text-white text-3xl" 
                />
              </div>
              <p className="text-gray-800 mt-2 font-semibold">Source</p>
            </div>

            {/* Center - Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={displayProgress === 100 ? "#10b981" : "#ff6b35"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - displayProgress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-800">{Math.round(displayProgress)}%</span>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{displayProgress === 100 ? "Converted!" : "Converting..."}</p>
            </div>

            {/* Right Side - Target Excel */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FontAwesomeIcon icon={faFileExcel} className="text-white text-3xl" />
              </div>
              <p className="text-gray-800 mt-2 font-semibold">Excel</p>
            </div>

            {/* Flowing Particles */}
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 bg-orange-400 rounded-full shadow-lg animate-pulse"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Sprinkles Animation */}
            {sprinkles.map(sprinkle => (
              <div
                key={sprinkle.id}
                className={`absolute w-2 h-2 rounded-full shadow-lg ${displayProgress === 100 ? 'bg-green-400' : 'bg-orange-400'}`}
                style={{
                  left: `${sprinkle.x}%`,
                  top: `${sprinkle.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sprinkle.rotation}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* All Converted Files Display */}
        {allConvertedFiles.length > 0 && (
          <div className="w-full max-w-4xl px-4 mb-8">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ✓ Converted Files ({allConvertedFiles.length}/{totalFiles})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allConvertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-4 rounded border border-green-200 hover:shadow-md transition">
                    <div className="flex items-center gap-3 flex-1">
                      <FontAwesomeIcon icon={faFileExcel} className="text-green-600 text-2xl" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">From: {file.originalName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewFile(index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.url;
                          link.setAttribute('download', file.name);
                          document.body.appendChild(link);
                          link.click();
                          link.parentNode.removeChild(link);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewFile !== null && allConvertedFiles[previewFile] && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Preview: {allConvertedFiles[previewFile].originalName}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                {allConvertedFiles[previewFile].extractedText && allConvertedFiles[previewFile].extractedText.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                      <span>🎯 Method: {allConvertedFiles[previewFile].extractionMethod || 'Basic'}</span>
                      <span>📊 Confidence: {allConvertedFiles[previewFile].confidence ? (allConvertedFiles[previewFile].confidence * 100).toFixed(0) + '%' : 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <ul className="space-y-2">
                        {allConvertedFiles[previewFile].extractedText.map((line, lineIndex) => (
                          <li key={lineIndex} className="flex items-start text-gray-800">
                            <span className="text-blue-500 mr-3">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No extracted text available for preview.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isAllComplete && (
          <div className="flex gap-4 mt-8 flex-wrap justify-center">
            <button
              onClick={onRetry}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faRedo} />
              Convert More Files
            </button>
          </div>
        )}

        {/* Feedback Form */}
        {isAllComplete && !feedbackSubmitted && (
          <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Share Your Feedback</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating:</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Suggestions:</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Tell us how we can improve..."
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleFeedbackSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        )}

        {/* Thank You Message */}
        {isAllComplete && feedbackSubmitted && (
          <div className="mt-8 bg-green-100 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">Thank You!</h3>
            <p className="text-green-700">Your feedback has been submitted successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionAnimation;