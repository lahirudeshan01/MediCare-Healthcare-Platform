import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Video,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { AppleButton } from "../components/ui/AppleButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { APPOINTMENT_ROUTES, PAYMENT_ROUTES } from "../config/api";
const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

const toLocalIsoDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalIsoDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toTimeSlotDate = (isoDate, timeSlot) => {
  const [timePart, meridian] = timeSlot.split(" ");
  const [rawHour, minute] = timePart.split(":").map(Number);
  let hour = rawHour;

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  const slotDate = parseLocalIsoDate(isoDate);
  slotDate.setHours(hour, minute, 0, 0);
  return slotDate;
};

const buildNextSevenDays = () => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateLabel: date.toLocaleDateString("en-US", { day: "2-digit" }),
      isoDate: toLocalIsoDate(date),
      displayDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });
};

const DOCTOR_DIRECTORY = {
  1: {
    id: "1",
    name: "Dr. Kumara Perera",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 248,
    experience: "15 yrs",
    initials: "KP",
  },
  2: {
    id: "2",
    name: "Dr. Nishani Fernando",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 186,
    experience: "10 yrs",
    initials: "NF",
  },
  3: {
    id: "3",
    name: "Dr. Rajith Silva",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 312,
    experience: "20 yrs",
    initials: "RS",
  },
  4: {
    id: "4",
    name: "Dr. Amaya Jayawardena",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 420,
    experience: "8 yrs",
    initials: "AJ",
  },
  5: {
    id: "5",
    name: "Dr. Dinesh Wickramasinghe",
    specialty: "Orthopedic",
    rating: 4.6,
    reviews: 156,
    experience: "18 yrs",
    initials: "DW",
  },
  6: {
    id: "6",
    name: "Dr. Sachini Ratnayake",
    specialty: "Psychiatrist",
    rating: 4.8,
    reviews: 204,
    experience: "12 yrs",
    initials: "SR",
  },
  7: {
    id: "7",
    name: "Dr. Tharuka Bandara",
    specialty: "General Physician",
    rating: 4.5,
    reviews: 89,
    experience: "6 yrs",
    initials: "TB",
  },
  8: {
    id: "8",
    name: "Dr. Malini Gunawardena",
    specialty: "ENT",
    rating: 4.7,
    reviews: 178,
    experience: "14 yrs",
    initials: "MG",
  },
};

export function DoctorProfile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const days = buildNextSevenDays();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedDoctor =
    location.state?.doctor || DOCTOR_DIRECTORY[id] || DOCTOR_DIRECTORY["1"];
  const doctorId = selectedDoctor.id;
  const patientId = loggedInUser.id || "";
  const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [consultType, setConsultType] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("prompt");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bankSlipFile, setBankSlipFile] = useState(null);
  const [bankSlipMessage, setBankSlipMessage] = useState("");
  const [now, setNow] = useState(new Date());
  const selectedDateDetails =
    days.find((d) => d.isoDate === selectedDate) || days[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isDateInPast = (isoDate) => parseLocalIsoDate(isoDate) < todayStart;

  const isSlotDisabled = (isoDate, timeSlot, index) => {
    const manuallyUnavailable = index === 2 || index === 5;
    if (manuallyUnavailable) return true;
    if (isDateInPast(isoDate)) return true;
    return toTimeSlotDate(isoDate, timeSlot) <= now;
  };

  const consultTypeLabel =
    consultType === "video"
      ? "Video Consult"
      : consultType === "in-person"
        ? "In-Person Visit"
        : "Select Consultation Type";

  const consultFee =
    consultType === "video"
      ? "2,500"
      : consultType === "in-person"
        ? "3,000"
        : "-";

  const buildAppointmentPayload = () => ({
    doctorId,
    patientId,
    specialty: selectedDoctor.specialty,
    date: selectedDate,
    timeSlot: selectedTime,
    consultType,
    reason: appointmentReason.trim(),
  });

  const finalizeAppointment = async (extraPayload = {}, options = {}) => {
    const { showSuccessModal = true } = options;
    setIsBooking(true);
    setBookingMessage("");

    try {
      const response = await fetch(APPOINTMENT_ROUTES.base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...buildAppointmentPayload(),
          ...extraPayload,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create appointment";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.message || errorMessage;
        } catch (_parseError) {
          // Ignore parse errors and keep default message.
        }
        throw new Error(errorMessage);
      }

      const appointment = await response.json();

      if (showSuccessModal) {
        setShowPaymentModal(false);
        setPaymentStep("prompt");
        setBankSlipFile(null);
        setBankSlipMessage("");
        setShowModal(true);
        setAppointmentReason("");
      }

      return appointment;
    } catch (error) {
      const errorMessage =
        error?.message || "Failed to book appointment. Please try again.";
      setBookingMessage(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleProceedLater = async () => {
    await finalizeAppointment({ paymentMode: "later" });
  };

  const handleProceedYes = () => {
    setBankSlipMessage("");
    setBankSlipFile(null);
    setPaymentStep("payment");
    setShowPaymentModal(true);
  };

  const handleBankSlipUpload = async () => {
    if (!bankSlipFile) {
      setBankSlipMessage("Please upload your bank slip before continuing.");
      return;
    }

    setBankSlipMessage("");
    setIsProcessingPayment(true);

    try {
      const appointment = await finalizeAppointment(
        {
          paymentMode: "bank-slip",
          paymentReference: bankSlipFile.name,
        },
        { showSuccessModal: false },
      );

      const formData = new FormData();
      formData.append("appointmentId", appointment._id);
      formData.append("patientId", patientId);
      formData.append("doctorId", doctorId);
      formData.append("amount", consultFee.replace(/,/g, ""));
      formData.append("currency", "LKR");
      formData.append("slip", bankSlipFile);

      const paymentResponse = await fetch(PAYMENT_ROUTES.slips, {
        method: "POST",
        body: formData,
      });

      if (!paymentResponse.ok) {
        let errorMessage = "Failed to upload payment slip";
        try {
          const errorBody = await paymentResponse.json();
          errorMessage = errorBody?.error || errorBody?.message || errorMessage;
        } catch (_parseError) {
          // Ignore parse errors and keep default message.
        }
        throw new Error(errorMessage);
      }

      setShowPaymentModal(false);
      setPaymentStep("prompt");
      setBankSlipFile(null);
      setBankSlipMessage("");
      setShowModal(true);
      setAppointmentReason("");
    } catch (error) {
      setBankSlipMessage(
        error?.message || "Payment upload failed. Please try again.",
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleInitialBooking = async () => {
    setBookingMessage("");

    if (!patientId) {
      setBookingMessage(
        "Please sign in as a patient before booking an appointment.",
      );
      return;
    }

    if (!appointmentReason.trim()) {
      setBookingMessage("Please add your reason for this appointment request.");
      return;
    }

    if (!selectedTime) {
      setBookingMessage(
        "No future slots are available for this date. Please choose another date.",
      );
      return;
    }

    if (!consultType) {
      setBookingMessage("Please select consultation type.");
      return;
    }

    const slotIndex = TIME_SLOTS.indexOf(selectedTime);
    if (
      slotIndex === -1 ||
      isSlotDisabled(selectedDate, selectedTime, slotIndex)
    ) {
      setBookingMessage(
        "Selected appointment time is in the past. Please choose a future time.",
      );
      return;
    }

    setShowPaymentModal(true);
    setPaymentStep("prompt");
  };

  useEffect(() => {
    const currentSlotIndex = TIME_SLOTS.indexOf(selectedTime);
    const selectedSlotInvalid =
      currentSlotIndex === -1 ||
      isSlotDisabled(selectedDate, selectedTime, currentSlotIndex);

    if (!selectedSlotInvalid) return;

    const nextAvailableSlot = TIME_SLOTS.find(
      (slot, index) => !isSlotDisabled(selectedDate, slot, index),
    );

    setSelectedTime(nextAvailableSlot || "");
  }, [selectedDate, selectedTime, now]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] text-[#1D1D1F] pb-32 md:pb-8">
      {/* Header Nav */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/doctors")}
            className="p-2 -ml-2 rounded-full hover:bg-[#F5F5F7] transition-colors"
          >
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
              {selectedDoctor.initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {selectedDoctor.name}
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <StatusBadge status="online" />
                  <span className="inline-flex items-center text-[#0071E3] text-sm font-medium bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verified Doctor
                  </span>
                </div>
              </div>
              <p className="text-lg text-[#86868B] mb-4">
                {selectedDoctor.specialty} • Nawaloka Hospital
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
                <div>
                  <p className="text-sm text-[#86868B] mb-1">Patients</p>
                  <p className="font-semibold text-lg">1,200+</p>
                </div>
                <div>
                  <p className="text-sm text-[#86868B] mb-1">Experience</p>
                  <p className="font-semibold text-lg">
                    {selectedDoctor.experience}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#86868B] mb-1">Rating</p>
                  <div className="flex items-center font-semibold text-lg">
                    {selectedDoctor.rating}{" "}
                    <Star className="w-5 h-5 text-[#FF9F0A] fill-[#FF9F0A] ml-1" />
                  </div>
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
              {days.map((d) => (
                <button
                  key={d.isoDate}
                  disabled={isDateInPast(d.isoDate)}
                  onClick={() => setSelectedDate(d.isoDate)}
                  className={`flex flex-col items-center justify-center min-w-[4rem] py-3 rounded-2xl transition-colors border ${isDateInPast(d.isoDate) ? "bg-[#F5F5F7] text-[#86868B] border-transparent opacity-50 cursor-not-allowed" : selectedDate === d.isoDate ? "bg-[#0071E3] text-white border-[#0071E3]" : "bg-white text-[#1D1D1F] border-[#D2D2D7]/50 hover:border-[#0071E3]"}`}
                >
                  <span
                    className={`text-xs font-medium mb-1 ${selectedDate === d.isoDate ? "text-white/80" : "text-[#86868B]"}`}
                  >
                    {d.day}
                  </span>
                  <span className="text-lg font-semibold">{d.dateLabel}</span>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
              {TIME_SLOTS.map((time, i) => {
                const isUnavailable = isSlotDisabled(selectedDate, time, i);
                return (
                  <button
                    key={time}
                    disabled={isUnavailable}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${isUnavailable ? "bg-[#F5F5F7] text-[#86868B] border-transparent opacity-50 cursor-not-allowed" : selectedTime === time ? "bg-[#0071E3] text-white border-[#0071E3]" : "bg-white text-[#1D1D1F] border-[#D2D2D7]/50 hover:border-[#0071E3]"}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            {/* Consultation Type */}
            <h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              Consultation Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setConsultType("video")}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${consultType === "video" ? "border-[#0071E3] bg-[#0071E3]/5" : "border-[#D2D2D7]/50 bg-white hover:border-[#0071E3]/50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${consultType === "video" ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}
                >
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Video Consult</p>
                  <p className="text-sm text-[#86868B]">Rs. 2,500</p>
                </div>
              </button>
              <button
                onClick={() => setConsultType("in-person")}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${consultType === "in-person" ? "border-[#0071E3] bg-[#0071E3]/5" : "border-[#D2D2D7]/50 bg-white hover:border-[#0071E3]/50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${consultType === "in-person" ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">
                    In-Person Visit
                  </p>
                  <p className="text-sm text-[#86868B]">Rs. 3,000</p>
                </div>
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider mb-3">
                Appointment Reason
              </h3>
              <textarea
                rows={3}
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                placeholder="Describe your symptoms or reason for consultation"
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3] resize-none"
              />
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
            {[1, 2, 3].map((i) => (
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
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 text-[#FF9F0A] fill-[#FF9F0A]"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[#1D1D1F] text-sm leading-relaxed mt-3">
                  Very professional and attentive. Dr. Perera took the time to
                  explain my condition clearly and answered all my questions.
                  Highly recommended!
                </p>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Booking CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#D2D2D7]/50 p-4 pb-safe z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <p className="text-sm text-[#86868B] mb-0.5">
              {selectedDateDetails.displayDate},{" "}
              {selectedTime || "No slots available"} • {consultTypeLabel}
            </p>
            <p className="font-semibold text-lg">Total: Rs. {consultFee}</p>
          </div>
          <AppleButton
            size="lg"
            className="w-full sm:w-auto px-12"
            disabled={
              isBooking ||
              !selectedTime ||
              isSlotDisabled(
                selectedDate,
                selectedTime,
                TIME_SLOTS.indexOf(selectedTime),
              )
            }
            onClick={handleInitialBooking}
          >
            {isBooking ? "Sending Request..." : "Confirm Booking"}
          </AppleButton>
        </div>
        {bookingMessage && (
          <p className="max-w-4xl mx-auto mt-3 text-sm text-[#0071E3] px-1">
            {bookingMessage}
          </p>
        )}
      </div>

      {/* Payment Prompt Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm"
              onClick={() => {
                if (!isProcessingPayment) {
                  setShowPaymentModal(false);
                  setPaymentStep("prompt");
                  setBankSlipFile(null);
                  setBankSlipMessage("");
                }
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => {
                  if (!isProcessingPayment) {
                    setShowPaymentModal(false);
                    setPaymentStep("prompt");
                    setBankSlipFile(null);
                    setBankSlipMessage("");
                  }
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                ✕
              </button>

              {paymentStep === "prompt" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      If you want proceed payment?
                    </h2>
                    <p className="text-[#86868B]">
                      Choose whether to continue with payment details now or
                      book later.
                    </p>
                  </div>

                  <div className="bg-[#F5F5F7] rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#86868B]">Doctor</span>
                      <span className="font-medium text-right">
                        {selectedDoctor.name}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#86868B]">Date & Time</span>
                      <span className="font-medium text-right">
                        {selectedDateDetails.displayDate}, {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#86868B]">Amount</span>
                      <span className="font-medium text-right">
                        Rs. {consultFee}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* <AppleButton
                      variant="secondary"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentStep("prompt");
                        setBankSlipFile(null);
                        setBankSlipMessage("");
                      }}
                    >
                      Close
                    </AppleButton> */}
                    <AppleButton
                      variant="secondary"
                      onClick={handleProceedLater}
                    >
                      Later
                    </AppleButton>
                    <AppleButton onClick={handleProceedYes}>Yes</AppleButton>
                  </div>
                </div>
              )}

              {paymentStep === "payment" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Bank Payment</h2>
                    <p className="text-[#86868B]">
                      Transfer the payment using the bank details below and
                      upload the bank slip.
                    </p>
                  </div>

                  <div className="bg-[#0F172A] text-white rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between gap-4">
                      <span className="text-white/70">Bank</span>
                      <span className="font-semibold text-right">
                        People's Bank
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/70">Account Name</span>
                      <span className="font-semibold text-right">
                        MediCare Plus (Pvt) Ltd
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/70">Account Number</span>
                      <span className="font-semibold text-right">
                        123-456-7890
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/70">Branch</span>
                      <span className="font-semibold text-right">
                        Colombo Main
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/70">Amount</span>
                      <span className="font-semibold text-right">
                        Rs. {consultFee}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[#1D1D1F]">
                      Upload bank slip
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setBankSlipFile(e.target.files?.[0] || null)
                      }
                      className="w-full rounded-xl border border-[#D2D2D7]/50 bg-[#F5F5F7] px-4 py-3 text-sm"
                    />
                    {bankSlipFile && (
                      <p className="text-sm text-[#86868B]">
                        Selected file: {bankSlipFile.name}
                      </p>
                    )}
                    {bankSlipMessage && (
                      <p className="text-sm text-[#FF3B30]">
                        {bankSlipMessage}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                    {/* <AppleButton
                      variant="secondary"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentStep("prompt");
                        setBankSlipFile(null);
                        setBankSlipMessage("");
                      }}
                      disabled={isProcessingPayment}
                    >
                      Close
                    </AppleButton> */}
                    <AppleButton
                      onClick={handleBankSlipUpload}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment
                        ? "Uploading..."
                        : "Upload Slip & Book"}
                    </AppleButton>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-full bg-[#30D158]/10 text-[#30D158] flex items-center justify-center mx-auto mb-6"
              >
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
                  <span className="font-medium">{selectedDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Date & Time</span>
                  <span className="font-medium">
                    {selectedDateDetails.displayDate}, {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Type</span>
                  <span className="font-medium">{consultTypeLabel}</span>
                </div>
                <div className="pt-3 border-t border-[#D2D2D7]/50 flex justify-between">
                  <span className="text-[#86868B]">Amount Paid</span>
                  <span className="font-bold">Rs. {consultFee}</span>
                </div>
              </div>

              <div className="space-y-3">
                <AppleButton
                  className="w-full"
                  onClick={() =>
                    navigate("/dashboard", {
                      state: {
                        openSection: "appointments",
                      },
                    })
                  }
                >
                  View Appointment
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Back to Home
                </AppleButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
