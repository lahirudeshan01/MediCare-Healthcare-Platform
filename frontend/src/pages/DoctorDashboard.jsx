import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  Clock,
  Banknote,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Video } from
'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
export function DoctorDashboard() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([
  {
    id: 1,
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  }]
  );
  const addMedication = () => {
    setMedications([
    ...medications,
    {
      id: Date.now(),
      name: '',
      dosage: '',
      frequency: '',
      duration: ''
    }]
    );
  };
  const removeMedication = (id) => {
    if (medications.length > 1) {
      setMedications(medications.filter((m) => m.id !== id));
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D2D2D7]/50 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Provider Portal
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {[
          {
            icon: LayoutDashboard,
            label: 'Dashboard',
            active: true
          },
          {
            icon: Calendar,
            label: 'My Schedule'
          },
          {
            icon: Users,
            label: 'Patients'
          },
          {
            icon: Pill,
            label: 'Prescriptions'
          },
          {
            icon: Clock,
            label: 'Availability'
          },
          {
            icon: Banknote,
            label: 'Earnings'
          }].
          map((item, idx) =>
          <a
            key={idx}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'}`}>
            
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          )}
        </nav>

        <div className="p-4 border-t border-[#D2D2D7]/50 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors">
            
            <Settings className="w-5 h-5" /> Settings
          </a>
          <a
            href="#"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors">
            
            <LogOut className="w-5 h-5" /> Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">
              Welcome back, Dr. Perera
            </h1>
            <p className="text-[#86868B]">
              Today is{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-lg font-semibold shadow-sm">
            KP
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
          {
            label: 'Patients Today',
            value: '8',
            icon: Users,
            color: 'text-[#0071E3]',
            bg: 'bg-[#0071E3]/10'
          },
          {
            label: 'Pending Requests',
            value: '3',
            icon: Clock,
            color: 'text-[#FF9F0A]',
            bg: 'bg-[#FF9F0A]/10'
          },
          {
            label: 'Completed Today',
            value: '5',
            icon: CheckCircle,
            color: 'text-[#30D158]',
            bg: 'bg-[#30D158]/10'
          },
          {
            label: "Today's Revenue",
            value: 'Rs. 22,500',
            icon: Banknote,
            color: 'text-[#AF52DE]',
            bg: 'bg-[#AF52DE]/10'
          }].
          map((stat, idx) =>
          <GlassCard key={idx} className="p-6 flex items-center gap-4">
              <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[#86868B] font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-[#1D1D1F]">
                  {stat.value}
                </p>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Schedule & Requests */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
              <GlassCard className="p-6">
                <div className="space-y-6">
                  {[
                  {
                    time: '9:00 AM',
                    name: 'Amal Dissanayake',
                    type: 'Follow-up',
                    status: 'confirmed',
                    action: 'Join'
                  },
                  {
                    time: '9:30 AM',
                    name: 'Priya Mendis',
                    type: 'New Patient',
                    status: 'confirmed',
                    action: null
                  },
                  {
                    time: '10:00 AM',
                    name: 'Ruwan Jayasekara',
                    type: 'Video Consultation',
                    status: 'pending',
                    action: 'Join'
                  },
                  {
                    time: '10:30 AM',
                    name: 'Dilini Weerasinghe',
                    type: 'Lab Review',
                    status: 'confirmed',
                    action: null
                  },
                  {
                    time: '2:00 PM',
                    name: 'Kasun Rathnayake',
                    type: 'Cardiac Checkup',
                    status: 'pending',
                    action: null
                  }].
                  map((apt, idx) =>
                  <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-20 text-sm font-medium text-[#86868B] text-right shrink-0">
                        {apt.time}
                      </div>
                      <div className="w-3 h-3 rounded-full bg-[#D2D2D7] group-hover:bg-[#0071E3] transition-colors relative z-10"></div>
                      <div className="flex-1 bg-[#F5F5F7] rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1D1D1F]">
                            {apt.name}
                          </p>
                          <p className="text-sm text-[#86868B]">{apt.type}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={apt.status} />
                          {apt.action === 'Join' &&
                        <AppleButton
                          size="sm"
                          onClick={() => navigate('/consultation')}
                          icon={<Video className="w-4 h-4" />}>
                          
                              Join
                            </AppleButton>
                        }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Pending Appointment Requests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                {
                  name: 'Nimal Perera',
                  time: 'Tomorrow, 10:00 AM',
                  reason: 'Chest pain consultation'
                },
                {
                  name: 'Samanthi Silva',
                  time: 'Tomorrow, 2:30 PM',
                  reason: 'Routine checkup'
                }].
                map((req, idx) =>
                <GlassCard key={idx} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-medium">
                        {req.name.
                      split(' ').
                      map((n) => n[0]).
                      join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{req.name}</p>
                        <p className="text-sm text-[#86868B]">{req.time}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#1D1D1F] mb-4">
                      Reason: {req.reason}
                    </p>
                    <div className="flex gap-2">
                      <AppleButton
                      className="flex-1 bg-[#30D158] hover:bg-[#28B44C] focus:ring-[#30D158]"
                      size="sm"
                      icon={<CheckCircle className="w-4 h-4" />}>
                      
                        Accept
                      </AppleButton>
                      <AppleButton
                      variant="danger"
                      className="flex-1"
                      size="sm"
                      icon={<XCircle className="w-4 h-4" />}>
                      
                        Reject
                      </AppleButton>
                    </div>
                  </GlassCard>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Prescription Writer & Availability */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Digital Prescription Writer
              </h2>
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-1">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      placeholder="Search patient..."
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                    
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-1">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Hypertension"
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                    
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-[#86868B]">
                        Medications
                      </label>
                      <button
                        onClick={addMedication}
                        className="text-xs font-medium text-[#0071E3] flex items-center hover:underline">
                        
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {medications.map((med, index) =>
                      <div
                        key={med.id}
                        className="bg-[#F5F5F7] p-3 rounded-xl relative group">
                        
                          <input
                          type="text"
                          placeholder="Medication name"
                          className="w-full bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3] mb-2" />
                        
                          <div className="grid grid-cols-3 gap-2">
                            <input
                            type="text"
                            placeholder="Dosage"
                            className="bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />
                          
                            <input
                            type="text"
                            placeholder="Frequency"
                            className="bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />
                          
                            <input
                            type="text"
                            placeholder="Duration"
                            className="bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />
                          
                          </div>
                          {medications.length > 1 &&
                        <button
                          onClick={() => removeMedication(med.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF3B30] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                          
                              <Trash2 className="w-3 h-3" />
                            </button>
                        }
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      rows={2}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#0071E3] resize-none" />
                    
                  </div>

                  <AppleButton className="w-full mt-4">
                    Sign & Send Prescription
                  </AppleButton>
                </div>
              </GlassCard>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Availability Management
              </h2>
              <GlassCard className="p-6">
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) =>
                  <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 text-sm font-medium text-[#86868B]">
                        {day}
                      </span>
                      <div className="flex-1 flex gap-1">
                        <div
                        className="h-8 flex-1 bg-[#0071E3] rounded-md opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
                        title="9:00 AM - 12:00 PM">
                      </div>
                        <div className="h-8 flex-1 bg-[#F5F5F7] rounded-md cursor-pointer hover:bg-[#D2D2D7] transition-colors"></div>
                        <div
                        className="h-8 flex-1 bg-[#0071E3] rounded-md opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
                        title="2:00 PM - 5:00 PM">
                      </div>
                      </div>
                    </div>
                  )}
                </div>
                <AppleButton
                  variant="secondary"
                  size="sm"
                  className="w-full mt-6">
                  
                  Edit Schedule
                </AppleButton>
              </GlassCard>
            </section>
          </div>
        </div>
      </main>
    </div>);

}