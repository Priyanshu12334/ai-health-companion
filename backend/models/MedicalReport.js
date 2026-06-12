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
    isMedicalReport: {
      type: Boolean,
      default: true
    },
    documentType: {
      type: String,
      default: 'Medical Report'
    },
    healthSummary: {
      detected: [{ type: String }],
      overallRisk: { type: String },
      recommendedAction: { type: String }
    },
    abnormalValues: [{
      parameter: { type: String, required: true },
      value: { type: String, required: true },
      status: { type: String, required: true },
      explanation: { type: String }
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
