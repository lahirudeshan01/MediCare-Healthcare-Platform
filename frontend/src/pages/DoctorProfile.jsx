import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Video,
  MapPin,
  CheckCircle } from
'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AppleButton } from '../components/ui/AppleButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { API_GATEWAY } from '../config/api';
const TIME_SLOTS = [
'9:00 AM',
'9:30 AM',
'10:00 AM',
'10:30 AM',
'11:00 AM',
'2:00 PM',
'2:30 PM',
'3:00 PM',
'3:30 PM',
'4:00 PM'];

const buildNextSevenDays = () => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-US', { day: '2-digit' }),
      isoDate: date.toISOString().slice(0, 10),
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });
};

export function DoctorProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const doctor = state?.doctor || {};
  const days = buildNextSevenDays();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = id || doctor._id || '';
  const patientId = currentUser.id || currentUser._id || 'guest';
  const token = localStorage.getItem('token') || '';
  const authHeader = { Authorization: `Bearer ${token}` };
  const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
  const [selectedTime, setSelectedTime] = useState('3:00 PM');
  const [consultType, setConsultType] = useState('video');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const selectedDateDetails = days.find((d) => d.isoDate === selectedDate) || days[0];

  const doctorName = doctor.name || 'Doctor';
  const doctorSpecialty = doctor.specialization || '';
  const consultationFee = doctor.consultationFee || 2500;
  const videoFee = consultationFee;
  const inPersonFee = Math.round(consultationFee * 1.2);

  const handleBook = async () => {
    setBookingMessage('');
    setIsBooking(true);
    try {
      const response = await fetch(`${API_GATEWAY}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          doctorId,
          patientId,
          specialty: doctorSpecialty,
          date: selectedDate,
          timeSlot: selectedTime,
          consultType
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to book appointment');
      }

      setShowModal(true);
    } catch (error) {
      setBookingMessage(error.message || 'Failed to send request. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] text-[#1D1D1F] pb-32 md:pb-8">
      {/* Header Nav */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/doctors')}
            className="p-2 -ml-2 rounded-full hover:bg-[#F5F5F7] transition-colors">
            
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight">
            Doctor Profile
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Doctor Header */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl shrink-0 shadow-sm">
              {doctorName.split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {doctorName}
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <StatusBadge status="online" />
                  <span className="inline-flex items-center text-[#0071E3] text-sm font-medium bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verified Doctor
                  </span>
                </div>
              </div>
              <p className="text-lg text-[#86868B] mb-4">
                {doctorSpecialty}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
                <div>
                  <p className="text-sm text-[#86868B] mb-1">Consultation Fee</p>
                  <p className="font-semibold text-lg">Rs. {consultationFee.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* About Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <GlassCard className="p-6">
            <p className="text-[#1D1D1F] leading-relaxed mb-6">
              Dr. Kumara Perera is a board-certified cardiologist with over 15
              years of experience in diagnosing and treating cardiovascular
              diseases. He specializes in preventive cardiology,
              echocardiography, and heart failure management.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                  Qualifications
                </h3>
                <p className="font-medium">
                  MBBS (University of Colombo), MD Cardiology (University of
                  Kelaniya), MRCP (UK)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                  Languages
                </h3>
                <p className="font-medium">Sinhala, Tamil, English</p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Availability & Booking */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Availability</h2>
          <GlassCard className="p-6">
            {/* Date Selector */}
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar mb-6">
              {days.map((d) =>
              <button
                key={d.isoDate}
                onClick={() => setSelectedDate(d.isoDate)}
                className={`flex flex-col items-center justify-center min-w-[4rem] py-3 rounded-2xl transition-colors border ${selectedDate === d.isoDate ? 'bg-[#0071E3] text-white border-[#0071E3]' : 'bg-white text-[#1D1D1F] border-[#D2D2D7]/50 hover:border-[#0071E3]'}`}>
                
                  <span
                  className={`text-xs font-medium mb-1 ${selectedDate === d.isoDate ? 'text-white/80' : 'text-[#86868B]'}`}>
                  
                    {d.day}
                  </span>
                  <span className="text-lg font-semibold">{d.dateLabel}</span>
                </button>
              )}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
              {TIME_SLOTS.map((time, i) => {
                const isUnavailable = i === 2 || i === 5; // Mock unavailable slots
                return (
                  <button
                    key={time}
                    disabled={isUnavailable}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${isUnavailable ? 'bg-[#F5F5F7] text-[#86868B] border-transparent opacity-50 cursor-not-allowed' : selectedTime === time ? 'bg-[#0071E3] text-white border-[#0071E3]' : 'bg-white text-[#1D1D1F] border-[#D2D2D7]/50 hover:border-[#0071E3]'}`}>
                    
                    {time}
                  </button>);

              })}
            </div>

            {/* Consultation Type */}
            <h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              Consultation Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setConsultType('video')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${consultType === 'video' ? 'border-[#0071E3] bg-[#0071E3]/5' : 'border-[#D2D2D7]/50 bg-white hover:border-[#0071E3]/50'}`}>
                
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${consultType === 'video' ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#86868B]'}`}>
                  
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Video Consult</p>
                  <p className="text-sm text-[#86868B]">Rs. {videoFee.toLocaleString()}</p>
                </div>
              </button>
              <button
                onClick={() => setConsultType('in-person')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${consultType === 'in-person' ? 'border-[#0071E3] bg-[#0071E3]/5' : 'border-[#D2D2D7]/50 bg-white hover:border-[#0071E3]/50'}`}>
                
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${consultType === 'in-person' ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#86868B]'}`}>
                  
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">
                    In-Person Visit
                  </p>
                  <p className="text-sm text-[#86868B]">Rs. {inPersonFee.toLocaleString()}</p>
                </div>
              </button>
            </div>


          </GlassCard>
        </section>

        {/* Reviews */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Patient Reviews</h2>
            <button className="text-[#0071E3] text-sm font-medium hover:underline">
              See All (248)
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) =>
            <GlassCard key={i} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] font-medium">
                      A{i}
                    </div>
                    <div>
                      <p className="font-medium">Anonymous Patient</p>
                      <p className="text-xs text-[#86868B]">
                        Oct {20 - i}, 2023
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) =>
                  <Star
                    key={star}
                    className="w-4 h-4 text-[#FF9F0A] fill-[#FF9F0A]" />

                  )}
                  </div>
                </div>
                <p className="text-[#1D1D1F] text-sm leading-relaxed mt-3">
                  Very professional and attentive. Dr. Perera took the time to
                  explain my condition clearly and answered all my questions.
                  Highly recommended!
                </p>
              </GlassCard>
            )}
          </div>
        </section>
      </main>

      {/* Sticky Booking CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#D2D2D7]/50 p-4 pb-safe z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <p className="text-sm text-[#86868B] mb-0.5">
              {selectedDateDetails.displayDate}, {selectedTime} •{' '}
              {consultType === 'video' ? 'Video' : 'In-Person'}
            </p>
            <p className="font-semibold text-lg">
              Total: Rs. {(consultType === 'video' ? videoFee : inPersonFee).toLocaleString()}
            </p>
          </div>
          <AppleButton
            size="lg"
            className="w-full sm:w-auto px-12"
            disabled={isBooking}
            onClick={handleBook}>
            {isBooking ? 'Sending Request...' : 'Confirm Booking'}
          </AppleButton>
        </div>
        {bookingMessage &&
        <p className="max-w-4xl mx-auto mt-3 text-sm text-[#0071E3] px-1">{bookingMessage}</p>
        }
      </div>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showModal &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)} />
          
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
            
              <motion.div
              initial={{
                scale: 0
              }}
              animate={{
                scale: 1
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.1
              }}
              className="w-20 h-20 rounded-full bg-[#30D158]/10 text-[#30D158] flex items-center justify-center mx-auto mb-6">
              
                <CheckCircle className="w-10 h-10" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">
                Appointment Confirmed!
              </h2>
              <p className="text-[#86868B] mb-8">
                You'll receive a confirmation via SMS and email shortly.
              </p>

              <div className="bg-[#F5F5F7] rounded-2xl p-4 mb-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Doctor</span>
                  <span className="font-medium">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Date & Time</span>
                  <span className="font-medium">
                    {selectedDateDetails.displayDate}, {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Type</span>
                  <span className="font-medium capitalize">{consultType}</span>
                </div>
                <div className="pt-3 border-t border-[#D2D2D7]/50 flex justify-between">
                  <span className="text-[#86868B]">Amount Paid</span>
                  <span className="font-bold">
                    Rs. {(consultType === 'video' ? videoFee : inPersonFee).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <AppleButton
                className="w-full"
                onClick={() => navigate('/dashboard')}>
                
                  View Appointment
                </AppleButton>
                <AppleButton
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/')}>
                
                  Back to Home
                </AppleButton>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}