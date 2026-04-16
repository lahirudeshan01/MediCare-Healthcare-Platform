const mongoose = require('mongoose');

const prescriptionReferenceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicationName: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String },
  dateIssued: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PrescriptionReference', prescriptionReferenceSchema);
