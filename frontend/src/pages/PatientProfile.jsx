import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  FileText,
  Pill,
  UploadCloud,
  Settings,
  Download,
  Activity,
  Calendar } from
'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
const TABS = [
{
  id: 'records',
  label: 'Medical Records',
  icon: FileText
},
{
  id: 'prescriptions',
  label: 'Prescriptions',
  icon: Pill
},
{
  id: 'labs',
  label: 'Lab Reports',
  icon: Activity
},
{
  id: 'settings',
  label: 'Settings',
  icon: Settings
}];

export function PatientProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Patient';
  const userEmail = user.email || '';
  const userInitials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  // Profile data stored per-user in localStorage
  const profileKey = `patientProfile_${user.id || user.email}`;
  const loadProfile = () => {
    try { return JSON.parse(localStorage.getItem(profileKey) || '{}'); } catch { return {}; }
  };
  const [profile, setProfile] = useState(() => loadProfile());
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    localStorage.setItem(profileKey, JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const displayAge = () => {
    if (!profile.dob) return null;
    const diff = new Date() - new Date(profile.dob);
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] pb-20">
      {/* Navigation */}
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-3xl font-semibold shadow-md">
            {userInitials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
              {userName}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {displayAge() !== null &&
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
                  Age {displayAge()}
                </span>
              }
              {profile.bloodType &&
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
                  Blood Type {profile.bloodType}
                </span>
              }
              {profile.gender &&
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
                  {profile.gender}
                </span>
              }
              {profile.allergies &&
                <span className="px-3 py-1 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full text-sm font-medium">
                  Allergies: {profile.allergies}
                </span>
              }
            </div>
          </div>
          <AppleButton variant="secondary" onClick={() => setActiveTab('settings')}>Edit Profile</AppleButton>
        </div>

        {/* Tabs */}
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
                {isActive &&
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3]"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }} />

                }
              </button>);

          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.3
          }}>
          
          {activeTab === 'records' &&
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#D2D2D7] before:to-transparent">
              {[
            {
              date: 'Mar 5, 2026',
              doc: 'Dr. Kumara Perera',
              title: 'Annual Cardiac Checkup',
              notes: 'All vitals normal. Continue current medication.',
              color: 'bg-[#0071E3]'
            },
            {
              date: 'Feb 18, 2026',
              doc: 'Dr. Nishani Fernando',
              title: 'Skin Consultation',
              notes: 'Mild eczema on forearms. Prescribed topical cream.',
              color: 'bg-[#30D158]'
            },
            {
              date: 'Jan 10, 2026',
              doc: 'Dr. Tharuka Bandara',
              title: 'General Checkup',
              notes: 'Seasonal flu. Rest and hydration recommended.',
              color: 'bg-[#FF9F0A]'
            },
            {
              date: 'Dec 2, 2025',
              doc: 'Dr. Rajith Silva',
              title: 'Neurology Follow-up',
              notes:
              'Migraine management review. Adjusted medication dosage.',
              color: 'bg-[#AF52DE]'
            }].
            map((record, idx) =>
            <div
              key={idx}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
                  <div
                className={`flex items-center justify-center w-4 h-4 rounded-full border-4 border-white ${record.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-4 md:ml-0 z-10`}>
              </div>
                  <GlassCard
                className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 border-l-4"
                style={{
                  borderLeftColor: record.color.
                  replace('bg-[', '').
                  replace(']', '')
                }}>
                
                    <div className="flex items-center gap-2 text-sm text-[#86868B] mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{record.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">
                      {record.title}
                    </h3>
                    <p className="text-sm font-medium text-[#0071E3] mb-3">
                      {record.doc}
                    </p>
                    <p className="text-[#86868B] text-sm">{record.notes}</p>
                  </GlassCard>
                </div>
            )}
            </div>
          }

          {activeTab === 'prescriptions' &&
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
            {
              name: 'Amoxicillin 500mg',
              dosage: '1 capsule, 3 times a day',
              doc: 'Dr. Tharuka Bandara',
              date: 'Jan 10, 2026',
              valid: 'Jan 17, 2026',
              status: 'expired'
            },
            {
              name: 'Hydrocortisone Cream 1%',
              dosage: 'Apply twice daily',
              doc: 'Dr. Nishani Fernando',
              date: 'Feb 18, 2026',
              valid: 'Mar 18, 2026',
              status: 'active'
            },
            {
              name: 'Atorvastatin 20mg',
              dosage: '1 tablet daily at night',
              doc: 'Dr. Kumara Perera',
              date: 'Mar 5, 2026',
              valid: 'Sep 5, 2026',
              status: 'active'
            }].
            map((rx, idx) =>
            <GlassCard key={idx} className="p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1D1D1F]">
                        {rx.name}
                      </h3>
                      <p className="text-[#86868B] text-sm mt-1">{rx.dosage}</p>
                    </div>
                    <StatusBadge
                  status={rx.status === 'active' ? 'confirmed' : 'offline'} />
                
                  </div>
                  <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6 flex-1">
                    <p className="text-sm text-[#86868B] mb-1">Prescribed by</p>
                    <p className="font-medium text-sm mb-3">{rx.doc}</p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-[#86868B]">Issued</p>
                        <p className="font-medium">{rx.date}</p>
                      </div>
                      <div>
                        <p className="text-[#86868B]">Valid until</p>
                        <p className="font-medium">{rx.valid}</p>
                      </div>
                    </div>
                  </div>
                  <AppleButton
                variant="secondary"
                className="w-full"
                icon={<Download className="w-4 h-4" />}>
                
                    Download PDF
                  </AppleButton>
                </GlassCard>
            )}
            </div>
          }

          {activeTab === 'labs' &&
          <div className="space-y-6">
              <div className="border-2 border-dashed border-[#D2D2D7] rounded-2xl p-10 text-center bg-white hover:bg-[#F5F5F7]/50 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-[#0071E3]/10 text-[#0071E3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Drag and drop or click to upload
                </h3>
                <p className="text-[#86868B] text-sm">
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">
                Uploaded Reports
              </h3>
              <div className="bg-white rounded-2xl border border-[#D2D2D7]/50 overflow-hidden">
                {[
              {
                name: 'Blood Test Results.pdf',
                date: 'Mar 4, 2026',
                size: '1.2 MB'
              },
              {
                name: 'ECG Report.pdf',
                date: 'Mar 4, 2026',
                size: '2.4 MB'
              },
              {
                name: 'X-Ray Chest.pdf',
                date: 'Dec 1, 2025',
                size: '5.1 MB'
              }].
              map((file, idx) =>
              <div
                key={idx}
                className="flex items-center justify-between p-4 border-b border-[#D2D2D7]/50 last:border-0 hover:bg-[#F5F5F7] transition-colors">
                
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1D1D1F]">
                          {file.name}
                        </p>
                        <p className="text-sm text-[#86868B]">
                          {file.date} • {file.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <AppleButton variant="ghost" size="sm">
                        View
                      </AppleButton>
                      <AppleButton
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}>
                    
                        Download
                      </AppleButton>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {activeTab === 'settings' &&
          <div className="max-w-3xl space-y-8">
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Full Name</label>
                    <input type="text" value={userName} readOnly
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none text-[#86868B] cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Email</label>
                    <input type="email" value={userEmail} readOnly
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none text-[#86868B] cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Phone</label>
                    <input type="tel" value={profile.phone || ''} onChange={(e) => handleProfileChange('phone', e.target.value)} placeholder="+94 77 000 0000"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Date of Birth</label>
                    <input type="date" value={profile.dob || ''} onChange={(e) => handleProfileChange('dob', e.target.value)}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Gender</label>
                    <select value={profile.gender || ''} onChange={(e) => handleProfileChange('gender', e.target.value)}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Blood Type</label>
                    <select value={profile.bloodType || ''} onChange={(e) => handleProfileChange('bloodType', e.target.value)}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]">
                      <option value="">Select blood type</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Address</label>
                    <input type="text" value={profile.address || ''} onChange={(e) => handleProfileChange('address', e.target.value)} placeholder="Your address"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Allergies <span className="text-xs font-normal">(comma-separated)</span></label>
                    <input type="text" value={profile.allergies || ''} onChange={(e) => handleProfileChange('allergies', e.target.value)} placeholder="e.g. Penicillin, Pollen"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold mb-6">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Name</label>
                    <input type="text" value={profile.emergencyName || ''} onChange={(e) => handleProfileChange('emergencyName', e.target.value)} placeholder="Emergency contact name"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Relationship</label>
                    <input type="text" value={profile.emergencyRelationship || ''} onChange={(e) => handleProfileChange('emergencyRelationship', e.target.value)} placeholder="e.g. Spouse, Parent"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-2">Phone</label>
                    <input type="tel" value={profile.emergencyPhone || ''} onChange={(e) => handleProfileChange('emergencyPhone', e.target.value)} placeholder="+94 71 000 0000"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                  </div>
                </div>
              </GlassCard>

              <div className="flex justify-end items-center gap-4 pt-4">
                {profileSaved && <span className="text-[#30D158] text-sm font-medium">Profile saved!</span>}
                <AppleButton size="lg" onClick={handleSaveProfile}>Save Changes</AppleButton>
              </div>
            </div>
          }
        </motion.div>
      </main>
    </div>);

}