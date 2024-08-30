const mongoose = require('mongoose');

const csvSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileData: {
    type: Buffer,  
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CsvFile = mongoose.model('CsvFile', csvSchema);

module.exports = CsvFile;
