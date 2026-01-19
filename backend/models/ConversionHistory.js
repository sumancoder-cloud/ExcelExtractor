const mongoose = require('mongoose');

const conversionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  convertedFileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  originalFileSize: {
    type: Number,
  },
  downloadUrl: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  extractedText: [String],
  tableData: mongoose.Schema.Types.Mixed,
  extractionMethod: {
    type: String,
    default: 'Basic',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  conversionTime: {
    type: Number, // milliseconds
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
  },
  errorMessage: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: { expireAfterSeconds: 0 }, // TTL index for auto-deletion
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ConversionHistory', conversionHistorySchema);
