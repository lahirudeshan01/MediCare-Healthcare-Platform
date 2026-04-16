import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  User,
  FileText,
  Pill,
  UploadCloud,
  Settings,
  Download,
  Activity,
  Calendar
} from 'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';

const TABS = [
  { id: 'records', label: 'Medical Records', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'labs', label: 'Lab Reports', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function PatientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const patientId = id || '60c72b2f9b1e8a3a9482f04b'; // Dummy ID to prevent null exceptions

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/patients/${patientId}/history`);
      setPatientData(res.data);
    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('reportFile', file);
      formData.append('title', file.name);

      await axios.post(`http://localhost:5000/api/patients/${patientId}/upload-report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchPatientData();
      alert('Report uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: e.target.name.value,
        contactNumber: e.target.phone.value,
        address: e.target.address.value,
        age: e.target.age.value,
      };
      await axios.put(`http://localhost:5000/api/patients/${patientId}`, data);
      await fetchPatientData();
      alert('Profile saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <p className="text-lg text-[#86868B]">Loading patient details...</p>
      </div>
    );
  }

  // Fallback if patientData is null
  const profile = patientData?.patientDetails || {};
  const reports = patientData?.reports || [];
  const prescriptions = patientData?.prescriptions || [];

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] pb-20">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">
            <ChevronLeft className="w-5 h-5 mr-1" /> Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-3xl font-semibold shadow-md">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
              {profile.name || 'Unknown Patient'}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.age && (
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
                  Age {profile.age}
                </span>
              )}
              {profile.gender && (
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
                  {profile.gender}
                </span>
              )}
              {profile.medicalHistoryNotes && (
                <span className="px-3 py-1 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full text-sm font-medium">
                  Notes: {profile.medicalHistoryNotes}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar border-b border-[#D2D2D7]/50 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'text-[#0071E3]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'records' && (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#D2D2D7] before:to-transparent">
              {reports.map((record, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-4 md:ml-0 z-10 bg-[#0071E3]`}>
                  </div>
                  <GlassCard className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 border-l-4" style={{ borderLeftColor: '#0071E3' }}>
                    <div className="flex items-center gap-2 text-sm text-[#86868B] mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">
                      {record.reportTitle}
                    </h3>
                  </GlassCard>
                </div>
              ))}
              {reports.length === 0 && (
                <p className="text-center text-[#86868B] mt-10">No medical records found.</p>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prescriptions.map((rx, idx) => (
                <GlassCard key={idx} className="p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1D1D1F]">{rx.medicationName}</h3>
                      <p className="text-[#86868B] text-sm mt-1">{rx.dosage}</p>
                    </div>
                    <StatusBadge status="confirmed" />
                  </div>
                  <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6 flex-1">
                    <p className="text-sm border-b border-[#D2D2D7] pb-2 mb-2">{rx.instructions}</p>
                    <div className="flex justify-between text-sm mt-3">
                      <div>
                        <p className="text-[#86868B]">Issued</p>
                        <p className="font-medium">{new Date(rx.dateIssued).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <AppleButton variant="secondary" className="w-full" icon={<Download className="w-4 h-4" />}>
                    Download PDF
                  </AppleButton>
                </GlassCard>
              ))}
              {prescriptions.length === 0 && (
                 <p className="col-span-full text-center text-[#86868B] py-10">No prescriptions found.</p>
              )}
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="space-y-6">
              <label htmlFor="file-upload" className="block border-2 border-dashed border-[#D2D2D7] rounded-2xl p-10 text-center bg-white hover:bg-[#F5F5F7]/50 transition-colors cursor-pointer relative">
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <div className="w-16 h-16 bg-[#0071E3]/10 text-[#0071E3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {uploading ? 'Uploading...' : 'Drag and drop or click to upload'}
                </h3>
                <p className="text-[#86868B] text-sm">
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </label>

              <h3 className="text-lg font-semibold mt-8 mb-4">Uploaded Reports</h3>
              <div className="bg-white rounded-2xl border border-[#D2D2D7]/50 overflow-hidden">
                {reports.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-b border-[#D2D2D7]/50 last:border-0 hover:bg-[#F5F5F7] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1D1D1F]">{file.reportTitle}</p>
                        <p className="text-sm text-[#86868B]">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`http://localhost:5000${file.filePath}`} target="_blank" rel="noreferrer">
                        <AppleButton variant="ghost" size="sm" type="button">
                          View
                        </AppleButton>
                      </a>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                   <p className="p-6 text-center text-[#86868B]">No lab reports uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleUpdateSettings} className="max-w-3xl space-y-8">
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={profile.name || ''}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      defaultValue={profile.age || ''}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={profile.contactNumber || ''}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={profile.address || ''}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" 
                    />
                  </div>
                </div>
              </GlassCard>

              <div className="flex justify-end pt-4">
                <AppleButton size="lg" type="submit">Save Changes</AppleButton>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}