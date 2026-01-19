import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload, faEye, faTrash, faFileExcel, faFilePdf, faImage, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ConversionHistoryPage = () => {
  const navigate = useNavigate();
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchConversions();
  }, [page]);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/convert/history?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setConversions(data.conversions);
        setPagination(data.pagination);
      } else {
        setError('Failed to load conversion history');
      }
    } catch (err) {
      setError('Error loading conversion history');
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/convert/download-history/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('File no longer available');
      }
    } catch (err) {
      alert('Download failed');
      console.error('Download error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversion record?')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`http://localhost:5000/api/convert/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchConversions();
      } else {
        alert('Failed to delete conversion');
      }
    } catch (err) {
      alert('Error deleting conversion');
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />;
      case 'image':
        return <FontAwesomeIcon icon={faImage} className="text-blue-500" />;
      default:
        return <FontAwesomeIcon icon={faFileExcel} className="text-green-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Conversion History</h1>
          <button
            onClick={() => navigate('/main')}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading conversion history...</p>
          </div>
        ) : conversions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FontAwesomeIcon icon={faFileExcel} className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Conversions Yet</h2>
            <p className="text-gray-500 mb-6">Start by uploading a file to see your conversion history here.</p>
            <button
              onClick={() => navigate('/main')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Go to Converter
            </button>
          </div>
        ) : (
          <>
            {/* Conversions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Original File</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Confidence</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {conversions.map((conversion) => (
                      <tr key={conversion._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <div className="flex items-center gap-3">
                            {getFileIcon(conversion.fileType)}
                            <div className="truncate max-w-xs" title={conversion.originalFileName}>
                              {conversion.originalFileName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {conversion.fileType}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(conversion.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {conversion.extractionMethod}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {conversion.confidence ? (conversion.confidence * 100).toFixed(0) + '%' : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setPreviewFile(conversion)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition text-xs"
                              title="Preview"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              onClick={() => handleDownload(conversion._id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition text-xs"
                              title="Download"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                            <button
                              onClick={() => handleDelete(conversion._id)}
                              disabled={deleting === conversion._id}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition text-xs disabled:bg-gray-400"
                              title="Delete"
                            >
                              {deleting === conversion._id ? (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                              ) : (
                                <FontAwesomeIcon icon={faTrash} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-gray-600 font-medium">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Preview: {previewFile.originalFileName}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <span>🎯 Method: {previewFile.extractionMethod}</span>
                  <span>📊 Confidence: {previewFile.confidence ? (previewFile.confidence * 100).toFixed(0) + '%' : 'N/A'}</span>
                </div>
                {previewFile.extractedText && previewFile.extractedText.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <ul className="space-y-2">
                      {previewFile.extractedText.map((line, idx) => (
                        <li key={idx} className="flex items-start text-gray-800">
                          <span className="text-blue-500 mr-3">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-600">No extracted text available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionHistoryPage;
