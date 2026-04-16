import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  Stethoscope,
  Sparkles,
  FileText,
  Pill,
  Video,
  User,
  Settings,
  LogOut,
  Bell,
  HeartPulse,
  Scale,
  Moon,
  Upload,
  ChevronRight,
  Download,
  MapPin,
  ArrowUp,
  Paperclip,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { AppleButton } from "../components/ui/AppleButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { APPOINTMENT_ROUTES } from "../config/api";
const COMMON_SYMPTOMS = [
  "Headache",
  "Fever",
  "Cough",
  "Fatigue",
  "Chest Pain",
  "Nausea",
  "Back Pain",
  "Dizziness",
  "Sore Throat",
  "Shortness of Breath",
];

const DOCTOR_DIRECTORY = {
  1: {
    name: "Dr. Kumara Perera",
    specialty: "Cardiologist",
    initials: "KP",
    color: "bg-blue-100 text-blue-600",
  },
  2: {
    name: "Dr. Nishani Fernando",
    specialty: "Dermatologist",
    initials: "NF",
    color: "bg-pink-100 text-pink-600",
  },
  3: {
    name: "Dr. Rajith Silva",
    specialty: "Neurologist",
    initials: "RS",
    color: "bg-purple-100 text-purple-600",
  },
  4: {
    name: "Dr. Amaya Jayawardena",
    specialty: "Pediatrician",
    initials: "AJ",
    color: "bg-green-100 text-green-600",
  },
  5: {
    name: "Dr. Dinesh Wickramasinghe",
    specialty: "Orthopedic",
    initials: "DW",
    color: "bg-orange-100 text-orange-600",
  },
  6: {
    name: "Dr. Sachini Ratnayake",
    specialty: "Psychiatrist",
    initials: "SR",
    color: "bg-teal-100 text-teal-600",
  },
  7: {
    name: "Dr. Tharuka Bandara",
    specialty: "General Physician",
    initials: "TB",
    color: "bg-indigo-100 text-indigo-600",
  },
  8: {
    name: "Dr. Malini Gunawardena",
    specialty: "ENT",
    initials: "MG",
    color: "bg-rose-100 text-rose-600",
  },
};

const toTitleCase = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const formatAppointmentDateTime = (date, timeSlot) => {
  if (!date) return timeSlot || "TBD";

  const parsedDate = new Date(date);
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return `${formattedDate}${timeSlot ? `, ${timeSlot}` : ""}`;
};

export function PatientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "there";
  const userEmail = user.email || "";
  const userFirstName = userName.split(" ")[0];
  const userInitials =
    userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  // Profile data stored per-user in localStorage
  const profileKey = `patientProfile_${user.id || user.email}`;
  const loadProfile = () => {
    try {
      return JSON.parse(localStorage.getItem(profileKey) || "{}");
    } catch {
      return {};
    }
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

  // Derived display values for profile header
  const displayAge = () => {
    if (!profile.dob) return null;
    const diff = new Date() - new Date(profile.dob);
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const [activeSection, setActiveSection] = useState(
    location.state?.openSection || "dashboard",
  );
  // Appointments State
  const [aptFilter, setAptFilter] = useState("Upcoming");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState("");
  const [appointmentActionMessage, setAppointmentActionMessage] = useState("");
  const [appointmentActionType, setAppointmentActionType] = useState("success");
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  // AI Assistant State
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      content: `Hi ${userName.split(" ")[0]} 👋 I'm your AI health assistant. Tell me about your symptoms and I'll provide preliminary guidance. Remember, this isn't a substitute for professional medical advice.`,
    },
  ]);
  // Profile State
  const [profileTab, setProfileTab] = useState("settings");
  useEffect(() => {
    if (activeSection === "ai-assistant") {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, activeSection]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user.id) {
        setAppointments([]);
        return;
      }

      setAppointmentsLoading(true);
      try {
        const response = await fetch(APPOINTMENT_ROUTES.byPatient(user.id));
        if (!response.ok) {
          throw new Error("Failed to load appointments");
        }

        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (_error) {
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadAppointments();
  }, [user.id]);

  useEffect(() => {
    if (location.state?.openSection) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!appointmentActionMessage) return undefined;

    const timeoutId = setTimeout(() => {
      setAppointmentActionMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [appointmentActionMessage]);

  const closeCancelPopup = () => {
    if (cancellingAppointmentId) return;
    setShowCancelPopup(false);
    setAppointmentToCancel(null);
  };

  const handleConfirmCancelAppointment = async () => {
    if (!appointmentToCancel?.id) return;

    setAppointmentActionMessage("");
    setCancellingAppointmentId(appointmentToCancel.id);

    try {
      const response = await fetch(
        APPOINTMENT_ROUTES.cancel(appointmentToCancel.id),
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      const updatedAppointment = await response.json();
      setAppointments((currentAppointments) =>
        currentAppointments.map((item) =>
          item._id === appointmentToCancel.id ? updatedAppointment : item,
        ),
      );
      setAppointmentActionType("success");
      setAppointmentActionMessage("Appointment cancelled successfully.");
    } catch (_error) {
      setAppointmentActionType("error");
      setAppointmentActionMessage(
        "Unable to cancel the appointment. Please try again.",
      );
    } finally {
      setCancellingAppointmentId("");
      setShowCancelPopup(false);
      setAppointmentToCancel(null);
    }
  };

  const handleSendAI = (text = input) => {
    if (!text.trim()) return;
    const newUserMsg = {
      id: Date.now().toString(),
      type: "user",
      content: text,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let aiResponse;
      if (
        text.toLowerCase().includes("headache") ||
        text.toLowerCase().includes("fever")
      ) {
        aiResponse = (
          <div className="space-y-4">
            <p>
              Based on your symptoms of headache and fever, here is a
              preliminary assessment:
            </p>
            <div className="bg-white border border-[#D2D2D7]/50 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3">Preliminary Assessment</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-[#86868B]">Severity:</span>
                <span className="px-2 py-1 bg-[#FF9F0A]/10 text-[#FF9F0A] text-xs font-medium rounded-md">
                  Moderate
                </span>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Viral Infection</span>
                    <span className="text-[#86868B]">85%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0071E3] w-[85%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tension Headache</span>
                    <span className="text-[#86868B]">40%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0071E3] w-[40%] rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#F5F5F7] p-3 rounded-lg mb-4">
                <p className="text-sm font-medium mb-2">Recommendations:</p>
                <ul className="text-sm text-[#86868B] space-y-1 list-disc pl-4">
                  <li>Stay hydrated and rest</li>
                  <li>
                    Monitor temperature — seek immediate care if above 103°F
                  </li>
                  <li>Over-the-counter pain relief may help</li>
                </ul>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#D2D2D7]/50">
                <span className="text-sm font-medium">
                  Recommended: General Physician
                </span>
                <AppleButton size="sm" onClick={() => navigate("/doctors")}>
                  Book Appointment
                </AppleButton>
              </div>
            </div>
            <div className="flex gap-2 items-start bg-[#FF9F0A]/10 p-3 rounded-xl text-sm text-[#FF9F0A]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>
                This is an AI-generated suggestion and not a medical diagnosis.
                Please consult a healthcare professional for proper evaluation.
              </p>
            </div>
          </div>
        );
      } else {
        aiResponse =
          "I understand. To give you a better assessment, could you tell me how long you've been experiencing these symptoms and if you have any other conditions?";
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: aiResponse,
        },
      ]);
    }, 1500);
  };
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };
  const panelVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    show: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -10,
    },
  };
  const normalizedAppointments = appointments.map((apt) => {
    const doctor = DOCTOR_DIRECTORY[apt.doctorId] || {};
    const fallbackInitials = apt.doctorId
      ? apt.doctorId.slice(0, 2).toUpperCase()
      : "DR";
    const normalizedStatus = toTitleCase(apt.status || "pending").toLowerCase();
    const normalizedPaymentStatus = toTitleCase(
      apt.paymentStatus || "unpaid",
    ).toLowerCase();
    const displayStatus =
      normalizedPaymentStatus === "pending"
        ? "payment-pending"
        : normalizedStatus;

    return {
      id: apt._id,
      doc: doctor.name || `Doctor #${apt.doctorId}`,
      spec: apt.specialty || doctor.specialty || "General Consultation",
      date: formatAppointmentDateTime(apt.date, apt.timeSlot),
      type:
        apt.consultType === "in-person" ? "In-Person Visit" : "Video Consult",
      status: normalizedStatus,
      paymentStatus: normalizedPaymentStatus,
      displayStatus,
      initials: doctor.initials || fallbackInitials,
      color: doctor.color || "bg-slate-100 text-slate-600",
    };
  });

  const filteredAppointments = normalizedAppointments.filter((apt) => {
    if (aptFilter === "All") return true;
    if (aptFilter === "Upcoming")
      return apt.status === "confirmed" || apt.status === "pending";
    if (aptFilter === "Completed") return apt.status === "completed";
    if (aptFilter === "Cancelled") return apt.status === "cancelled";
    return true;
  });

  const upcomingAppointments = normalizedAppointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending",
  );

  const handleCancelAppointment = async (appointmentId) => {
    const appointment = appointments.find((item) => item._id === appointmentId);
    setAppointmentToCancel({
      id: appointmentId,
      doctorName:
        DOCTOR_DIRECTORY[appointment?.doctorId]?.name || "this doctor",
    });
    setShowCancelPopup(true);
  };

  const renderDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <header className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[#86868B] font-medium mb-1">Thursday, Oct 24</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Good morning, {userFirstName}
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-[#D2D2D7]/50 flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF3B30] rounded-full border-2 border-white"></span>
        </button>
      </header>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <GlassCard
          hover
          className="p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
          onClick={() => navigate("/doctors")}
        >
          <div className="w-12 h-12 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Book Appointment</span>
        </GlassCard>
        <GlassCard
          hover
          className="p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
          onClick={() => setActiveSection("ai-assistant")}
        >
          <div className="w-12 h-12 rounded-full bg-[#FF9F0A]/10 flex items-center justify-center text-[#FF9F0A]">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">AI Symptom Check</span>
        </GlassCard>
        <GlassCard
          hover
          className="p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
          onClick={() => {
            setActiveSection("profile");
            setProfileTab("labs");
          }}
        >
          <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center text-[#30D158]">
            <Upload className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Upload Report</span>
        </GlassCard>
        <GlassCard
          hover
          className="p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
          onClick={() => navigate("/consultation")}
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Video className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Video Call</span>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 bg-gradient-to-r from-[#0071E3]/5 to-[#30D158]/5 border-[#0071E3]/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0071E3] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI Health Insights</h3>
              <p className="text-[#1D1D1F] mb-3">
                Based on your recent vitals, your cardiovascular health looks
                excellent. Continue your current exercise routine to maintain
                optimal blood pressure.
              </p>
              <button
                onClick={() => setActiveSection("ai-assistant")}
                className="text-[#0071E3] font-medium text-sm flex items-center hover:underline"
              >
                View Details <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <button
                onClick={() => setActiveSection("appointments")}
                className="text-[#0071E3] text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 2).map((apt, idx) => (
                <GlassCard
                  key={idx}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${apt.color} flex items-center justify-center font-bold text-lg shrink-0`}
                    >
                      {apt.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1D1D1F]">
                        {apt.doc}
                      </h4>
                      <p className="text-sm text-[#86868B]">
                        {apt.spec} • {apt.type}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium">{apt.date}</span>
                        <StatusBadge status={apt.displayStatus} />
                      </div>
                      <p className="text-xs text-[#86868B] mt-1">
                        Payment: {toTitleCase(apt.paymentStatus || "unpaid")}
                      </p>
                    </div>
                  </div>
                  {apt.status === "confirmed" &&
                    apt.type === "Video Consult" && (
                      <AppleButton
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => navigate("/consultation")}
                      >
                        Join Call
                      </AppleButton>
                    )}
                </GlassCard>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Prescriptions</h2>
              <button
                onClick={() => setActiveSection("prescriptions")}
                className="text-[#0071E3] text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <GlassCard className="divide-y divide-[#D2D2D7]/50">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B]">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Amoxicillin 500mg</h4>
                    <p className="text-xs text-[#86868B]">
                      Dr. Tharuka Bandara • Oct 15, 2023
                    </p>
                  </div>
                </div>
                <button className="text-[#0071E3] text-sm font-medium hover:underline">
                  Download
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B]">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Loratadine 10mg</h4>
                    <p className="text-xs text-[#86868B]">
                      Dr. Nishani Fernando • Sep 22, 2023
                    </p>
                  </div>
                </div>
                <button className="text-[#0071E3] text-sm font-medium hover:underline">
                  Download
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Health Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2 text-[#FF3B30]">
                <HeartPulse className="w-5 h-5" />
                <span className="text-sm font-medium text-[#86868B]">
                  Heart Rate
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">72</span>
                <span className="text-sm text-[#86868B]">bpm</span>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2 text-[#0071E3]">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium text-[#86868B]">
                  Blood Pressure
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">120/80</span>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2 text-[#30D158]">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium text-[#86868B]">BMI</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">22.4</span>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2 text-purple-500">
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium text-[#86868B]">
                  Sleep
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">7.5</span>
                <span className="text-sm text-[#86868B]">hrs</span>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderAppointments = () => (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          My Appointments
        </h1>
        <AppleButton onClick={() => navigate("/doctors")}>Book New</AppleButton>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {["All", "Upcoming", "Completed", "Cancelled"].map((filter) => (
          <button
            key={filter}
            onClick={() => setAptFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${aptFilter === filter ? "bg-[#1D1D1F] text-white" : "bg-white text-[#1D1D1F] border border-[#D2D2D7]/50 hover:bg-[#F5F5F7]"}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {appointmentsLoading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#D2D2D7]/50 text-[#86868B]">
            Loading your appointments...
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <GlassCard
              key={apt.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full ${apt.color} flex items-center justify-center font-bold text-xl shrink-0`}
                >
                  {apt.initials}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">
                    {apt.doc}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#86868B]">
                    <span>{apt.spec}</span>
                    <span>•</span>
                    <span className="flex items-center font-medium text-[#1D1D1F]">
                      <Calendar className="w-4 h-4 mr-1" /> {apt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      {apt.type === "Video Consult" ? (
                        <Video className="w-4 h-4 mr-1" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-1" />
                      )}{" "}
                      {apt.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <StatusBadge status={apt.displayStatus} />
                <p className="text-xs text-[#86868B]">
                  Payment: {toTitleCase(apt.paymentStatus || "unpaid")}
                </p>
                {apt.status === "confirmed" && (
                  <div className="flex flex-col gap-2 sm:items-end">
                    {apt.type === "Video Consult" && (
                      <AppleButton
                        size="sm"
                        onClick={() => navigate("/consultation")}
                      >
                        Join Call
                      </AppleButton>
                    )}
                    <AppleButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancelAppointment(apt.id)}
                      disabled={cancellingAppointmentId === apt.id}
                    >
                      {cancellingAppointmentId === apt.id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </AppleButton>
                  </div>
                )}
                {apt.status === "pending" && (
                  <div className="flex flex-col gap-2 sm:items-end">
                    <AppleButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancelAppointment(apt.id)}
                      disabled={cancellingAppointmentId === apt.id}
                    >
                      {cancellingAppointmentId === apt.id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </AppleButton>
                  </div>
                )}
                {(apt.status === "completed" || apt.status === "cancelled") && (
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/doctors")}
                  >
                    Book Again
                  </AppleButton>
                )}
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#D2D2D7]/50">
            <Calendar className="w-12 h-12 text-[#86868B] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No appointments found
            </h3>
            <p className="text-[#86868B]">
              You don't have any {aptFilter.toLowerCase()} appointments.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderAIAssistant = () => (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#D2D2D7]/50 overflow-hidden"
    >
      <div className="p-4 border-b border-[#D2D2D7]/50 flex items-center gap-2 bg-[#F5F5F7]/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071E3] to-[#5AC8FA] flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-[#1D1D1F] leading-tight">
            AI Health Assistant
          </h2>
          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white text-[#86868B] rounded-md uppercase tracking-wider border border-[#D2D2D7]/50">
            Beta
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] ${msg.type === "user" ? "bg-[#0071E3] text-white rounded-2xl rounded-tr-sm px-4 py-3" : "bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3"}`}
                >
                  {typeof msg.content === "string" ? (
                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {messages.length === 1 && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.5,
              }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() =>
                    handleSendAI(`I have a ${symptom.toLowerCase()}`)
                  }
                  className="px-4 py-2 rounded-full border border-[#D2D2D7] text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors bg-white"
                >
                  {symptom}
                </button>
              ))}
            </motion.div>
          )}

          {isTyping && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="flex justify-start"
            >
              <div className="bg-[#F5F5F7] rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1.5 items-center">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: 0,
                  }}
                  className="w-2 h-2 bg-[#86868B] rounded-full"
                />

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: 0.2,
                  }}
                  className="w-2 h-2 bg-[#86868B] rounded-full"
                />

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: 0.4,
                  }}
                  className="w-2 h-2 bg-[#86868B] rounded-full"
                />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#D2D2D7]/50">
        <div className="relative flex items-end gap-2">
          <button className="p-3 text-[#86868B] hover:text-[#1D1D1F] transition-colors shrink-0">
            <Paperclip className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-[#F5F5F7] rounded-2xl border border-transparent focus-within:border-[#D2D2D7] focus-within:bg-white transition-all overflow-hidden flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAI();
                }
              }}
              placeholder="Describe your symptoms..."
              className="w-full max-h-32 bg-transparent p-3 outline-none resize-none text-[15px]"
              rows={1}
              style={{
                minHeight: "44px",
              }}
            />
          </div>
          <AnimatePresence>
            {input.trim() && (
              <motion.button
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                }}
                onClick={() => handleSendAI()}
                className="w-10 h-10 rounded-full bg-[#0071E3] text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-[#0077ED] transition-colors mb-0.5"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  const renderProfileHeader = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
      <div className="w-24 h-24 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-3xl font-semibold shadow-md">
        {userInitials}
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">{userName}</h1>
        <div className="flex flex-wrap gap-2 mb-3">
          {displayAge() !== null && (
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
              Age {displayAge()}
            </span>
          )}
          {profile.bloodType && (
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
              Blood Type {profile.bloodType}
            </span>
          )}
          {profile.gender && (
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-[#D2D2D7]/50">
              {profile.gender}
            </span>
          )}
          {profile.allergies && (
            <span className="px-3 py-1 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full text-sm font-medium">
              Allergies: {profile.allergies}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      {renderProfileHeader()}
      <h2 className="text-2xl font-semibold mb-6">Medical Records</h2>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#D2D2D7] before:to-transparent">
        {[
          {
            date: "Mar 5, 2026",
            doc: "Dr. Kumara Perera",
            title: "Annual Cardiac Checkup",
            notes: "All vitals normal. Continue current medication.",
            color: "bg-[#0071E3]",
          },
          {
            date: "Feb 18, 2026",
            doc: "Dr. Nishani Fernando",
            title: "Skin Consultation",
            notes: "Mild eczema on forearms. Prescribed topical cream.",
            color: "bg-[#30D158]",
          },
          {
            date: "Jan 10, 2026",
            doc: "Dr. Tharuka Bandara",
            title: "General Checkup",
            notes: "Seasonal flu. Rest and hydration recommended.",
            color: "bg-[#FF9F0A]",
          },
          {
            date: "Dec 2, 2025",
            doc: "Dr. Rajith Silva",
            title: "Neurology Follow-up",
            notes: "Migraine management review. Adjusted medication dosage.",
            color: "bg-[#AF52DE]",
          },
        ].map((record, idx) => (
          <div
            key={idx}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div
              className={`flex items-center justify-center w-4 h-4 rounded-full border-4 border-white ${record.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-4 md:ml-0 z-10`}
            ></div>
            <GlassCard
              className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 border-l-4"
              style={{
                borderLeftColor: record.color
                  .replace("bg-[", "")
                  .replace("]", ""),
              }}
            >
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
        ))}
      </div>
    </motion.div>
  );

  const renderPrescriptions = () => (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-semibold mb-6">My Prescriptions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            name: "Amoxicillin 500mg",
            dosage: "1 capsule, 3 times a day",
            doc: "Dr. Tharuka Bandara",
            date: "Jan 10, 2026",
            valid: "Jan 17, 2026",
            status: "expired",
          },
          {
            name: "Hydrocortisone Cream 1%",
            dosage: "Apply twice daily",
            doc: "Dr. Nishani Fernando",
            date: "Feb 18, 2026",
            valid: "Mar 18, 2026",
            status: "active",
          },
          {
            name: "Atorvastatin 20mg",
            dosage: "1 tablet daily at night",
            doc: "Dr. Kumara Perera",
            date: "Mar 5, 2026",
            valid: "Sep 5, 2026",
            status: "active",
          },
        ].map((rx, idx) => (
          <GlassCard key={idx} className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1F]">
                  {rx.name}
                </h3>
                <p className="text-[#86868B] text-sm mt-1">{rx.dosage}</p>
              </div>
              <StatusBadge
                status={rx.status === "active" ? "confirmed" : "offline"}
              />
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
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </AppleButton>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      {renderProfileHeader()}

      <div className="flex gap-4 border-b border-[#D2D2D7]/50 mb-8">
        <button
          onClick={() => setProfileTab("settings")}
          className={`pb-3 text-sm font-medium relative ${profileTab === "settings" ? "text-[#0071E3]" : "text-[#86868B] hover:text-[#1D1D1F]"}`}
        >
          Settings
          {profileTab === "settings" && (
            <motion.div
              layoutId="profileTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3]"
            />
          )}
        </button>
        <button
          onClick={() => setProfileTab("labs")}
          className={`pb-3 text-sm font-medium relative ${profileTab === "labs" ? "text-[#0071E3]" : "text-[#86868B] hover:text-[#1D1D1F]"}`}
        >
          Lab Reports
          {profileTab === "labs" && (
            <motion.div
              layoutId="profileTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3]"
            />
          )}
        </button>
      </div>

      {profileTab === "settings" ? (
        <div className="space-y-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  readOnly
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none text-[#86868B] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none text-[#86868B] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  placeholder="+94 77 000 0000"
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dob || ""}
                  onChange={(e) => handleProfileChange("dob", e.target.value)}
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Gender
                </label>
                <select
                  value={profile.gender || ""}
                  onChange={(e) =>
                    handleProfileChange("gender", e.target.value)
                  }
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Blood Type
                </label>
                <select
                  value={profile.bloodType || ""}
                  onChange={(e) =>
                    handleProfileChange("bloodType", e.target.value)
                  }
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="">Select blood type</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={profile.address || ""}
                  onChange={(e) =>
                    handleProfileChange("address", e.target.value)
                  }
                  placeholder="Your address"
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Allergies{" "}
                  <span className="text-xs font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={profile.allergies || ""}
                  onChange={(e) =>
                    handleProfileChange("allergies", e.target.value)
                  }
                  placeholder="e.g. Penicillin, Pollen"
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold mb-6">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.emergencyName || ""}
                  onChange={(e) =>
                    handleProfileChange("emergencyName", e.target.value)
                  }
                  placeholder="Emergency contact name"
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={profile.emergencyRelationship || ""}
                  onChange={(e) =>
                    handleProfileChange("emergencyRelationship", e.target.value)
                  }
                  placeholder="e.g. Spouse, Parent"
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.emergencyPhone || ""}
                  onChange={(e) =>
                    handleProfileChange("emergencyPhone", e.target.value)
                  }
                  placeholder="+94 71 000 0000"
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>
          </GlassCard>
          <div className="flex justify-end items-center gap-4">
            {profileSaved && (
              <span className="text-[#30D158] text-sm font-medium">
                Profile saved!
              </span>
            )}
            <AppleButton size="lg" onClick={handleSaveProfile}>
              Save Changes
            </AppleButton>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-[#D2D2D7] rounded-2xl p-10 text-center bg-white hover:bg-[#F5F5F7]/50 transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-[#0071E3]/10 text-[#0071E3] rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Drag and drop or click to upload
            </h3>
            <p className="text-[#86868B] text-sm">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
          </div>
          <h3 className="text-lg font-semibold mt-8 mb-4">Uploaded Reports</h3>
          <div className="bg-white rounded-2xl border border-[#D2D2D7]/50 overflow-hidden">
            {[
              {
                name: "Blood Test Results.pdf",
                date: "Mar 4, 2026",
                size: "1.2 MB",
              },
              {
                name: "ECG Report.pdf",
                date: "Mar 4, 2026",
                size: "2.4 MB",
              },
              {
                name: "X-Ray Chest.pdf",
                date: "Dec 1, 2025",
                size: "5.1 MB",
              },
            ].map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border-b border-[#D2D2D7]/50 last:border-0 hover:bg-[#F5F5F7] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1D1D1F]">{file.name}</p>
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
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </AppleButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Activity,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
    },
    {
      id: "find-doctors",
      label: "Find Doctors",
      icon: Stethoscope,
      action: () => navigate("/doctors"),
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: Sparkles,
    },
    {
      id: "records",
      label: "Medical Records",
      icon: FileText,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: Pill,
    },
    {
      id: "video-consult",
      label: "Video Consult",
      icon: Video,
      action: () => navigate("/consultation"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-['Inter',system-ui,sans-serif] text-[#1D1D1F]">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#D2D2D7]/50 h-screen sticky top-0 z-20">
        <div
          className="p-6 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            MediCare+
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  item.action ? item.action() : setActiveSection(item.id)
                }
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? "bg-[#0071E3]/10 text-[#0071E3]" : "text-[#1D1D1F] hover:bg-[#F5F5F7]"}`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-[#0071E3]" : "text-[#86868B]"}`}
                />{" "}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#D2D2D7]/50 space-y-1">
          <button
            onClick={() => {
              setActiveSection("profile");
              setProfileTab("settings");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeSection === "profile" && profileTab === "settings" ? "bg-[#0071E3]/10 text-[#0071E3]" : "text-[#1D1D1F] hover:bg-[#F5F5F7]"}`}
          >
            <Settings
              className={`w-5 h-5 ${activeSection === "profile" && profileTab === "settings" ? "text-[#0071E3]" : "text-[#86868B]"}`}
            />{" "}
            Settings
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8 h-screen relative">
        <AnimatePresence mode="wait">
          {activeSection === "dashboard" && (
            <motion.div key="dashboard">{renderDashboard()}</motion.div>
          )}
          {activeSection === "appointments" && (
            <motion.div key="appointments">{renderAppointments()}</motion.div>
          )}
          {activeSection === "ai-assistant" && (
            <motion.div key="ai-assistant">{renderAIAssistant()}</motion.div>
          )}
          {activeSection === "records" && (
            <motion.div key="records">{renderRecords()}</motion.div>
          )}
          {activeSection === "prescriptions" && (
            <motion.div key="prescriptions">{renderPrescriptions()}</motion.div>
          )}
          {activeSection === "profile" && (
            <motion.div key="profile">{renderProfile()}</motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCancelPopup && (
          <motion.div
            key="cancel-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              key="cancel-popup-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white rounded-2xl border border-[#D2D2D7]/60 shadow-xl p-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">
                    Cancel Booking?
                  </h3>
                  <p className="text-sm text-[#86868B] mt-1">
                    This will cancel your appointment with{" "}
                    {appointmentToCancel?.doctorName}.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={closeCancelPopup}
                  disabled={Boolean(cancellingAppointmentId)}
                  className="px-4 py-2 rounded-xl border border-[#D2D2D7]/70 text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors disabled:opacity-60"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleConfirmCancelAppointment}
                  disabled={Boolean(cancellingAppointmentId)}
                  className="px-4 py-2 rounded-xl bg-[#FF3B30] text-white hover:bg-[#e63228] transition-colors disabled:opacity-70"
                >
                  {cancellingAppointmentId ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appointmentActionMessage && (
          <motion.div
            key="appointment-action-toast"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 left-6 sm:left-auto sm:w-[360px] z-50"
          >
            <div
              className={`rounded-2xl border p-4 shadow-lg flex items-start gap-3 ${
                appointmentActionType === "success"
                  ? "bg-[#e9f9ef] border-[#b6eac8] text-[#14532d]"
                  : "bg-[#fff1f0] border-[#ffd1cc] text-[#9f1239]"
              }`}
            >
              <div className="mt-0.5">
                {appointmentActionType === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <p className="text-sm font-medium">{appointmentActionMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#D2D2D7]/50 flex justify-around items-center p-4 pb-safe z-30">
        <button
          className={`flex flex-col items-center gap-1 ${activeSection === "dashboard" ? "text-[#0071E3]" : "text-[#86868B]"}`}
          onClick={() => setActiveSection("dashboard")}
        >
          <Activity className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button
          className="flex flex-col items-center gap-1 text-[#86868B]"
          onClick={() => navigate("/doctors")}
        >
          <Stethoscope className="w-6 h-6" />
          <span className="text-[10px] font-medium">Doctors</span>
        </button>
        <button
          className={`flex flex-col items-center gap-1 ${activeSection === "ai-assistant" ? "text-[#0071E3]" : "text-[#86868B]"}`}
          onClick={() => setActiveSection("ai-assistant")}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-medium">AI Check</span>
        </button>
        <button
          className={`flex flex-col items-center gap-1 ${activeSection === "profile" ? "text-[#0071E3]" : "text-[#86868B]"}`}
          onClick={() => setActiveSection("profile")}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}
