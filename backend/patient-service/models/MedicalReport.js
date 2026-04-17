const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    reportTitle: { type: String, required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String },
    fileSize: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
