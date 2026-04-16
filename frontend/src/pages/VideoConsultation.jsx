import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  PhoneOff,
  User,
  Settings,
  FileText,
  Download,
  Star,
  ChevronLeft } from
'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
import { GlassCard } from '../components/ui/GlassCard';
export function VideoConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const telemedicineApiBase = import.meta.env.VITE_TELEMEDICINE_API || 'http://localhost:8085';

  const defaultAppointmentId = searchParams.get('appointmentId') || '1001';
  const defaultDoctorId = searchParams.get('doctorId') || '1';
  const defaultPatientId = searchParams.get('patientId') || '1';

  const [callState, setCallState] = useState('lobby');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [duration, setDuration] = useState(0);
  const [rating, setRating] = useState(0);
  const [appointmentId, setAppointmentId] = useState(defaultAppointmentId);
  const [doctorId, setDoctorId] = useState(defaultDoctorId);
  const [patientId, setPatientId] = useState(defaultPatientId);
  const [provider, setProvider] = useState('jitsi');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');
  const [sessionData, setSessionData] = useState(null);

  const generateSession = async () => {
    setSessionMessage('');

    if (!appointmentId || !doctorId || !patientId) {
      setSessionMessage('Appointment ID, Doctor ID and Patient ID are required.');
      return null;
    }

    setIsCreatingSession(true);
    try {
      const response = await fetch(`${telemedicineApiBase}/telemedicine/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: String(appointmentId),
          doctorId: String(doctorId),
          patientId: String(patientId),
          provider
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Failed to generate session');
      }

      setSessionData(result.data);
      setSessionMessage(result.message || 'Session generated successfully.');
      return result.data;
    } catch (error) {
      setSessionMessage(error.message || 'Failed to generate session.');
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleJoinWebClient = async () => {
    const session = sessionData || await generateSession();
    if (!session?.meetingUrl) {
      return;
    }

    window.open(session.meetingUrl, '_blank', 'noopener,noreferrer');
    setCallState('active');
  };
  useEffect(() => {
    let interval;
    if (callState === 'active') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).
    toString().
    padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const renderLobby = () =>
  <motion.div
    initial={{
      opacity: 0,
      y: 20
    }}
    animate={{
      opacity: 1,
      y: 0
    }}
    exit={{
      opacity: 0,
      scale: 0.95
    }}
    className="flex-1 flex items-center justify-center p-6">
    
      <GlassCard className="max-w-2xl w-full p-8 flex flex-col items-center text-center">
        <div className="w-full aspect-video bg-[#1D1D1F] rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
          {isVideoOff ?
        <div className="w-24 h-24 rounded-full bg-[#333] flex items-center justify-center">
              <User className="w-12 h-12 text-white/50" />
            </div> :

        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-white/50 font-medium">Camera Preview</span>
            </div>
        }
          <div className="absolute bottom-4 flex gap-4">
            <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full backdrop-blur-md transition-colors ${isMuted ? 'bg-[#FF3B30] text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            
              {isMuted ?
            <MicOff className="w-6 h-6" /> :

            <Mic className="w-6 h-6" />
            }
            </button>
            <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full backdrop-blur-md transition-colors ${isVideoOff ? 'bg-[#FF3B30] text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            
              {isVideoOff ?
            <VideoOff className="w-6 h-6" /> :

            <Video className="w-6 h-6" />
            }
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-2">Ready to join?</h2>
        <p className="text-[#86868B] mb-8">
          Generate a meeting room, share the link with doctor + patient, then join via web client.
        </p>

        <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-left">
          <div>
            <label className="block text-xs font-medium text-[#86868B] mb-1">Appointment ID</label>
            <input
              type="number"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              className="w-full bg-[#F5F5F7] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#86868B] mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-[#F5F5F7] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]">
              <option value="jitsi">Jitsi Meet (recommended)</option>
              <option value="agora">Agora</option>
              <option value="twilio">Twilio</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#86868B] mb-1">Doctor ID</label>
            <input
              type="number"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full bg-[#F5F5F7] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#86868B] mb-1">Patient ID</label>
            <input
              type="number"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-[#F5F5F7] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]" />
          </div>
        </div>

        {sessionMessage &&
        <p className="text-sm text-[#0071E3] mb-3">{sessionMessage}</p>
        }

        {sessionData?.meetingUrl &&
        <div className="w-full max-w-xl bg-[#F5F5F7] rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-[#1D1D1F] mb-1">Meeting URL</p>
            <p className="text-xs break-all text-[#0071E3] mb-3">{sessionData.meetingUrl}</p>
            <p className="text-xs font-semibold text-[#1D1D1F] mb-1">Delivery Log</p>
            <ul className="space-y-1 text-xs text-[#86868B]">
              {(sessionData.deliveryLog || []).map((item, index) =>
              <li key={`${item.recipientType}-${index}`}>
                  {item.recipientType}: {item.status} via {item.channel}
                </li>
              )}
            </ul>
          </div>
        }

        <div className="flex gap-4 w-full max-w-md">
          <AppleButton
          variant="secondary"
          className="flex-1"
          onClick={generateSession}
          disabled={isCreatingSession}
          icon={<Settings className="w-4 h-4" />}>
            {isCreatingSession ? 'Generating...' : 'Generate Room'}
          </AppleButton>
          <AppleButton
          className="flex-1"
          onClick={handleJoinWebClient}>
            Join Web Client
          </AppleButton>
        </div>
      </GlassCard>
    </motion.div>;

  const renderActiveCall = () =>
  <motion.div
    initial={{
      opacity: 0
    }}
    animate={{
      opacity: 1
    }}
    exit={{
      opacity: 0
    }}
    className="fixed inset-0 bg-[#1D1D1F] z-50 flex flex-col">
    
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full pointer-events-auto border border-white/10">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#30D158]"></div>
            <div className="w-2 h-2 rounded-full bg-[#30D158]"></div>
            <div className="w-2 h-2 rounded-full bg-[#30D158]"></div>
          </div>
          <span className="text-white font-medium text-sm border-l border-white/20 pl-3 ml-1">
            {formatTime(duration)}
          </span>
          {sessionData?.provider &&
          <span className="text-white/80 text-xs border-l border-white/20 pl-3 ml-1 uppercase">
              {sessionData.provider}
            </span>
          }
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex">
        <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center relative">
          <User className="w-32 h-32 text-white/10" />
          <div className="absolute bottom-24 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <p className="text-white font-medium">Dr. Kumara Perera</p>
            <p className="text-white/60 text-sm">Cardiologist</p>
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {activePanel &&
        <motion.div
          initial={{
            width: 0,
            opacity: 0
          }}
          animate={{
            width: 380,
            opacity: 1
          }}
          exit={{
            width: 0,
            opacity: 0
          }}
          className="bg-white h-full flex flex-col overflow-hidden border-l border-white/10">
          
              <div className="p-4 border-b border-[#D2D2D7]/50 flex gap-2">
                {['chat', 'files', 'notes'].map((panel) =>
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${activePanel === panel ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#86868B] hover:bg-[#F5F5F7]/50'}`}>
              
                    {panel}
                  </button>
            )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-[#F5F5F7]/30">
                {activePanel === 'chat' &&
            <div className="space-y-4">
                    <div className="bg-[#F5F5F7] p-3 rounded-2xl rounded-tl-sm w-[85%]">
                      <p className="text-sm">
                        Hello Sarah, I'm reviewing your latest ECG report now.
                      </p>
                      <span className="text-[10px] text-[#86868B] mt-1 block">
                        10:02 AM
                      </span>
                    </div>
                    <div className="bg-[#0071E3] text-white p-3 rounded-2xl rounded-tr-sm w-[85%] ml-auto">
                      <p className="text-sm">
                        Thank you Doctor. I've been feeling much better since
                        starting the new medication.
                      </p>
                      <span className="text-[10px] text-white/70 mt-1 block text-right">
                        10:03 AM
                      </span>
                    </div>
                  </div>
            }
                {activePanel === 'files' &&
            <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl border border-[#D2D2D7]/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          ECG_Report_Mar2026.pdf
                        </p>
                        <p className="text-xs text-[#86868B]">
                          Shared by you • 2.4 MB
                        </p>
                      </div>
                    </div>
                  </div>
            }
                {activePanel === 'notes' &&
            <textarea
              className="w-full h-full bg-white border border-[#D2D2D7]/50 rounded-xl p-4 resize-none focus:ring-2 focus:ring-[#0071E3] outline-none text-sm"
              placeholder="Type your personal notes here..." />

            }
              </div>
              {activePanel === 'chat' &&
          <div className="p-4 border-t border-[#D2D2D7]/50 bg-white">
                  <div className="flex gap-2">
                    <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-[#F5F5F7] rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0071E3]/20" />
              
                  </div>
                </div>
          }
            </motion.div>
        }
        </AnimatePresence>
      </div>

      {/* PiP Self View */}
      <div className="absolute bottom-28 right-8 w-48 h-36 bg-gray-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl flex items-center justify-center z-20">
        {isVideoOff ?
      <User className="w-12 h-12 text-white/30" /> :

      <span className="text-white/50 text-sm">You</span>
      }
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-full flex items-center gap-4 z-20 shadow-2xl">
        <button
        onClick={() => setIsMuted(!isMuted)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-[#FF3B30] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        
          {isMuted ?
        <MicOff className="w-5 h-5" /> :

        <Mic className="w-5 h-5" />
        }
        </button>
        <button
        onClick={() => setIsVideoOff(!isVideoOff)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-[#FF3B30] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        
          {isVideoOff ?
        <VideoOff className="w-5 h-5" /> :

        <Video className="w-5 h-5" />
        }
        </button>
        <button className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors">
          <MonitorUp className="w-5 h-5" />
        </button>
        <button
        onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activePanel === 'chat' ? 'bg-[#0071E3] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        
          <MessageSquare className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-white/20 mx-2"></div>
        <button
        onClick={() => setCallState('ended')}
        className="w-14 h-14 rounded-full bg-[#FF3B30] text-white hover:bg-[#FF453A] flex items-center justify-center transition-colors shadow-lg shadow-[#FF3B30]/20">
        
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </motion.div>;

  const renderEnded = () =>
  <motion.div
    initial={{
      opacity: 0,
      scale: 0.95
    }}
    animate={{
      opacity: 1,
      scale: 1
    }}
    className="flex-1 flex items-center justify-center p-6">
    
      <GlassCard className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-[#30D158]/10 text-[#30D158] rounded-full flex items-center justify-center mx-auto mb-6">
          <PhoneOff className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Consultation Ended</h2>
        <p className="text-[#86868B] mb-6">Duration: {formatTime(duration)}</p>

        <div className="bg-[#F5F5F7] rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-[#86868B] mb-1">Consulted with</p>
          <p className="font-medium">Dr. Kumara Perera</p>
          <p className="text-sm text-[#86868B] mt-2 mb-1">Date & Time</p>
          <p className="font-medium">
            Today,{' '}
            {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium mb-3">Rate your consultation</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) =>
          <button
            key={star}
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110">
            
                <Star
              className={`w-8 h-8 ${rating >= star ? 'fill-[#FF9F0A] text-[#FF9F0A]' : 'text-[#D2D2D7]'}`} />
            
              </button>
          )}
          </div>
        </div>

        <div className="space-y-3">
          <AppleButton
          variant="secondary"
          className="w-full"
          icon={<Download className="w-4 h-4" />}>
          
            Download Summary
          </AppleButton>
          <AppleButton
          className="w-full"
          onClick={() => navigate('/dashboard')}>
          
            Back to Dashboard
          </AppleButton>
        </div>
      </GlassCard>
    </motion.div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] flex flex-col">
      {callState === 'lobby' &&
      <div className="p-6">
          <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">
          
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </button>
        </div>
      }
      <AnimatePresence mode="wait">
        {callState === 'lobby' &&
        <motion.div key="lobby" className="flex-1 flex">
            {renderLobby()}
          </motion.div>
        }
        {callState === 'active' &&
        <motion.div key="active">{renderActiveCall()}</motion.div>
        }
        {callState === 'ended' &&
        <motion.div key="ended" className="flex-1 flex">
            {renderEnded()}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}