import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String
  },
  analysis: {
    keyFindings: [{
      type: String
    }],
    abnormalValues: [{
      parameter: { type: String, required: true },
      value: { type: String, required: true },
      status: { type: String, required: true }
    }],
    suggestions: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
