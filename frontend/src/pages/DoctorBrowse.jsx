import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Search } from "lucide-react";
import { SearchBar } from "../components/ui/SearchBar";
import { GlassCard } from "../components/ui/GlassCard";
import { AppleButton } from "../components/ui/AppleButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { API_GATEWAY } from "../config/api";

const SPECIALTIES = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic",
  "Psychiatrist",
  "General Physician",
  "ENT",
];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
  "bg-teal-100 text-teal-600",
  "bg-indigo-100 text-indigo-600",
  "bg-rose-100 text-rose-600",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

function getColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function DoctorBrowse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_GATEWAY}/auth/doctors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctors");
        return res.json();
      })
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const specialty = doc.specialization || "";
    const matchesSearch =
      (doc.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      activeSpecialty === "All" ||
      specialty.toLowerCase() === activeSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif] text-[#1D1D1F]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 -ml-2 rounded-full hover:bg-[#F5F5F7] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">
              Find Doctors
            </h1>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search doctors, specialties, conditions..."
          />

          <div className="flex overflow-x-auto py-4 gap-2 no-scrollbar mt-2">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setActiveSpecialty(specialty)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSpecialty === specialty ? "text-white" : "text-[#1D1D1F] bg-white border border-[#D2D2D7]/50 hover:bg-[#F5F5F7]"}`}
              >
                {activeSpecialty === specialty && (
                  <motion.div
                    layoutId="activeSpecialty"
                    className="absolute inset-0 bg-[#0071E3] rounded-full -z-10"
                  />
                )}
                <span className="relative z-10">{specialty}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-20 text-[#86868B]">Loading doctors...</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500">{error}</div>
        )}
        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-[#86868B] font-medium">
                {filteredDoctors.length} doctors found
              </p>
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor, index) => {
                const initials = getInitials(doctor.name);
                const color = getColor(doctor.name);
                const fee = doctor.consultationFee
                  ? `Rs. ${doctor.consultationFee.toLocaleString()}`
                  : "—";
                return (
                  <motion.div
                    key={doctor._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <GlassCard hover className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="flex items-start justify-between sm:block">
                        <div
                          className={`w-16 h-16 rounded-full ${color} flex items-center justify-center font-bold text-xl shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="sm:hidden">
                          <StatusBadge status="online" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-xl font-semibold">{doctor.name}</h3>
                          <div className="hidden sm:block">
                            <StatusBadge status="online" />
                          </div>
                        </div>
                        <p className="text-[#86868B] mb-3">
                          {doctor.specialization}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#D2D2D7]/50">
                          <div>
                            <p className="text-sm text-[#86868B] mb-0.5">
                              Consultation Fee
                            </p>
                            <p className="font-semibold">{fee}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#86868B] mb-0.5">
                              Status
                            </p>
                            <p className="text-[#30D158] font-medium text-sm">
                              Available
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                          <AppleButton
                            className="flex-1"
                            onClick={() =>
                              navigate(`/doctor/${doctor._id}`, {
                                state: { doctor },
                              })
                            }
                          >
                            Book Appointment
                          </AppleButton>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </motion.div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#86868B]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No doctors found</h3>
                <p className="text-[#86868B]">
                  Try adjusting your search or filters to find what you're looking
                  for.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
