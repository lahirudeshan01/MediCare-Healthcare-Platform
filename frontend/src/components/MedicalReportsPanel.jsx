import React, { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  Eye,
  Upload,
  RefreshCcw,
  AlertTriangle,
  Calendar,
  Paperclip,
} from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { AppleButton } from "./ui/AppleButton";
import { PATIENT_ROUTES, API_GATEWAY } from "../config/api";

const formatFileSize = (size) => {
  if (!size && size !== 0) return "Unknown size";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatReportDate = (value) => {
  if (!value) return "Recently uploaded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently uploaded";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function MedicalReportsPanel({ patientId, title = "Medical Reports" }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState("");
  const [reportToDelete, setReportToDelete] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReports = async () => {
    if (!patientId) {
      setReports([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(PATIENT_ROUTES.reports(patientId));
      if (!response.ok) {
        throw new Error("Failed to load reports");
      }

      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setReports([]);
      setError(fetchError.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [patientId]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!patientId) {
      setError("Patient id is required to upload reports.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("reportFile", selectedFile);
    formData.append("title", reportTitle.trim() || selectedFile.name);

    setUploading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(PATIENT_ROUTES.uploadReport(patientId), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Failed to upload report");
      }

      setMessage("Report uploaded successfully.");
      setReportTitle("");
      setSelectedFile(null);
      event.target.reset();
      await loadReports();
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const requestDeleteReport = (report) => {
    setReportToDelete(report);
  };

  const handleCloseDeletePopup = () => {
    if (deletingReportId) return;
    setReportToDelete(null);
  };

  const handleDelete = async () => {
    const reportId = reportToDelete?._id;
    if (!patientId || !reportId) return;

    setDeletingReportId(reportId);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        PATIENT_ROUTES.deleteReport(patientId, reportId),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Failed to delete report");
      }

      setMessage("Report deleted successfully.");
      setReportToDelete(null);
      await loadReports();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete report");
    } finally {
      setDeletingReportId("");
    }
  };

  const openReport = (report) => {
    if (!report?.filePath) return;
    window.open(
      `${API_GATEWAY}${report.filePath}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F]">{title}</h3>
            <p className="text-sm text-[#86868B] mt-1">
              Upload PDFs, images, or scans and keep them tied to this patient
              record.
            </p>
          </div>
          <button
            type="button"
            onClick={loadReports}
            className="text-[#0071E3] text-sm font-medium hover:underline inline-flex items-center gap-1"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#86868B] mb-2">
                Report title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(event) => setReportTitle(event.target.value)}
                placeholder="Blood test report"
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#86868B] mb-2">
                File
              </label>
              <label className="flex items-center gap-3 w-full bg-[#F5F5F7] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#EDEDF2] transition-colors">
                <Paperclip className="w-4 h-4 text-[#86868B]" />
                <span className="text-sm text-[#1D1D1F] truncate flex-1">
                  {selectedFile ? selectedFile.name : "Choose a report file"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AppleButton
              type="submit"
              loading={uploading}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload Report
            </AppleButton>
            <span className="text-sm text-[#86868B]">
              Supported formats: PDF, JPG, PNG, WEBP
            </span>
          </div>
        </form>

        {(message || error) && (
          <div
            className={`mt-5 rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${error ? "bg-[#FF3B30]/10 text-[#B42318]" : "bg-[#30D158]/10 text-[#16784D]"}`}
          >
            {error ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            ) : null}
            <span>{error || message}</span>
          </div>
        )}
      </GlassCard>

      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">
          Uploaded Reports
        </h3>
        {loading ? (
          <GlassCard className="p-6 text-center text-[#86868B]">
            Loading reports...
          </GlassCard>
        ) : reports.length === 0 ? (
          <GlassCard className="p-8 text-center text-[#86868B]">
            <FileText className="w-10 h-10 mx-auto mb-3 text-[#D2D2D7]" />
            No reports uploaded yet.
          </GlassCard>
        ) : (
          <div className="bg-white rounded-2xl border border-[#D2D2D7]/50 overflow-hidden divide-y divide-[#D2D2D7]/50">
            {reports.map((report) => {
              const reportUrl = report.filePath
                ? `${API_GATEWAY}${report.filePath}`
                : "";
              return (
                <div
                  key={report._id}
                  className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between hover:bg-[#F5F5F7] transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#1D1D1F] truncate">
                        {report.reportTitle ||
                          report.originalName ||
                          "Medical Report"}
                      </p>
                      <p className="text-sm text-[#86868B] flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatReportDate(report.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(report.fileSize)}</span>
                        <span>•</span>
                        <span className="truncate">{report.originalName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <AppleButton
                      variant="ghost"
                      size="sm"
                      onClick={() => openReport(report)}
                      disabled={!reportUrl}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      View
                    </AppleButton>
                    {/* <a
                      href={reportUrl}
                      download
                      className="inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] focus:ring-[#1D1D1F] px-4 py-2 text-sm"
                    >
                      Download
                    </a> */}
                    <AppleButton
                      variant="danger"
                      size="sm"
                      loading={deletingReportId === report._id}
                      onClick={() => requestDeleteReport(report)}
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </AppleButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#D2D2D7]/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#1D1D1F]">
                  Delete Report?
                </h4>
                <p className="text-sm text-[#4C4C50] mt-1 break-words">
                  {reportToDelete.reportTitle ||
                    reportToDelete.originalName ||
                    "This medical report"}
                </p>
                <p className="text-sm text-[#86868B] mt-2">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <AppleButton
                variant="secondary"
                size="sm"
                onClick={handleCloseDeletePopup}
                disabled={Boolean(deletingReportId)}
              >
                Cancel
              </AppleButton>
              <AppleButton
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={Boolean(deletingReportId)}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Confirm Delete
              </AppleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
