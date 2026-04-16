const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  reportTitle: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
