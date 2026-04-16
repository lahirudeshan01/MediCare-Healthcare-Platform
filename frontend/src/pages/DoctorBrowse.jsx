import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Video } from "lucide-react";
import { SearchBar } from "../components/ui/SearchBar";
import { GlassCard } from "../components/ui/GlassCard";
import { AppleButton } from "../components/ui/AppleButton";
import { StatusBadge } from "../components/ui/StatusBadge";
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

const DOCTORS = [
  {
    id: "1",
    name: "Dr. Kumara Perera",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 248,
    experience: "15 yrs",
    fee: "Rs. 3,000",
    status: "online",
    color: "bg-blue-100 text-blue-600",
    initials: "KP",
  },
  {
    id: "2",
    name: "Dr. Nishani Fernando",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 186,
    experience: "10 yrs",
    fee: "Rs. 2,500",
    status: "online",
    color: "bg-pink-100 text-pink-600",
    initials: "NF",
  },
  {
    id: "3",
    name: "Dr. Rajith Silva",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 312,
    experience: "20 yrs",
    fee: "Rs. 3,500",
    status: "offline",
    color: "bg-purple-100 text-purple-600",
    initials: "RS",
  },
  {
    id: "4",
    name: "Dr. Amaya Jayawardena",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 420,
    experience: "8 yrs",
    fee: "Rs. 2,000",
    status: "online",
    color: "bg-green-100 text-green-600",
    initials: "AJ",
  },
  {
    id: "5",
    name: "Dr. Dinesh Wickramasinghe",
    specialty: "Orthopedic",
    rating: 4.6,
    reviews: 156,
    experience: "18 yrs",
    fee: "Rs. 3,000",
    status: "offline",
    color: "bg-orange-100 text-orange-600",
    initials: "DW",
  },
  {
    id: "6",
    name: "Dr. Sachini Ratnayake",
    specialty: "Psychiatrist",
    rating: 4.8,
    reviews: 204,
    experience: "12 yrs",
    fee: "Rs. 2,800",
    status: "online",
    color: "bg-teal-100 text-teal-600",
    initials: "SR",
  },
  {
    id: "7",
    name: "Dr. Tharuka Bandara",
    specialty: "General Physician",
    rating: 4.5,
    reviews: 89,
    experience: "6 yrs",
    fee: "Rs. 1,500",
    status: "online",
    color: "bg-indigo-100 text-indigo-600",
    initials: "TB",
  },
  {
    id: "8",
    name: "Dr. Malini Gunawardena",
    specialty: "ENT",
    rating: 4.7,
    reviews: 178,
    experience: "14 yrs",
    fee: "Rs. 2,500",
    status: "offline",
    color: "bg-rose-100 text-rose-600",
    initials: "MG",
  },
];

export function DoctorBrowse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      activeSpecialty === "All" || doc.specialty === activeSpecialty;
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
        <div className="flex justify-between items-center mb-6">
          <p className="text-[#86868B] font-medium">
            {filteredDoctors.length} doctors found
          </p>
          <select className="bg-transparent text-sm font-medium text-[#1D1D1F] outline-none cursor-pointer">
            <option>Sort by: Recommended</option>
            <option>Rating: High to Low</option>
            <option>Price: Low to High</option>
            <option>Availability</option>
          </select>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              layout
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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
                    className={`w-16 h-16 rounded-full ${doctor.color} flex items-center justify-center font-bold text-xl shrink-0`}
                  >
                    {doctor.initials}
                  </div>
                  <div className="sm:hidden">
                    <StatusBadge status={doctor.status} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
                    <div className="hidden sm:block">
                      <StatusBadge status={doctor.status} />
                    </div>
                  </div>
                  <p className="text-[#86868B] mb-3">{doctor.specialty}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                    <div className="flex items-center text-[#1D1D1F] font-medium">
                      <Star className="w-4 h-4 text-[#FF9F0A] fill-[#FF9F0A] mr-1" />
                      {doctor.rating}{" "}
                      <span className="text-[#86868B] font-normal ml-1">
                        ({doctor.reviews})
                      </span>
                    </div>
                    <div className="text-[#86868B]">•</div>
                    <div className="text-[#1D1D1F]">
                      {doctor.experience} experience
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#D2D2D7]/50">
                    <div>
                      <p className="text-sm text-[#86868B] mb-0.5">
                        Consultation Fee
                      </p>
                      <p className="font-semibold">{doctor.fee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#86868B] mb-0.5">
                        Next available
                      </p>
                      <p className="text-[#30D158] font-medium text-sm">
                        Today, 3:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <AppleButton
                      className="flex-1"
                      onClick={() =>
                        navigate(`/doctor/${doctor.id}`, {
                          state: {
                            doctor,
                          },
                        })
                      }
                    >
                      Book Appointment
                    </AppleButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
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
      </main>
    </div>
  );
}
