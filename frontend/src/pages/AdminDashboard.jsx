import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Stethoscope,
  Calendar,
  TrendingUp,
  Search,
  ShieldCheck,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AppleButton } from "../components/ui/AppleButton";
import { GlassCard } from "../components/ui/GlassCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { SearchBar } from "../components/ui/SearchBar";
import { API_GATEWAY, PAYMENT_ROUTES } from "../config/api";
const lineData = [
  {
    name: "Jan",
    value: 890,
  },
  {
    name: "Feb",
    value: 1020,
  },
  {
    name: "Mar",
    value: 1150,
  },
  {
    name: "Apr",
    value: 980,
  },
  {
    name: "May",
    value: 1200,
  },
  {
    name: "Jun",
    value: 1350,
  },
  {
    name: "Jul",
    value: 1100,
  },
  {
    name: "Aug",
    value: 1280,
  },
  {
    name: "Sep",
    value: 1400,
  },
  {
    name: "Oct",
    value: 1520,
  },
  {
    name: "Nov",
    value: 1380,
  },
  {
    name: "Dec",
    value: 1450,
  },
];

const barData = [
  {
    name: "Jan",
    value: 2100,
  },
  {
    name: "Feb",
    value: 2400,
  },
  {
    name: "Mar",
    value: 2800,
  },
  {
    name: "Apr",
    value: 2300,
  },
  {
    name: "May",
    value: 3000,
  },
  {
    name: "Jun",
    value: 3200,
  },
  {
    name: "Jul",
    value: 2700,
  },
  {
    name: "Aug",
    value: 3100,
  },
  {
    name: "Sep",
    value: 3400,
  },
  {
    name: "Oct",
    value: 3800,
  },
  {
    name: "Nov",
    value: 3500,
  },
  {
    name: "Dec",
    value: 3700,
  },
];

const pieData = [
  {
    name: "Cardiology",
    value: 22,
    color: "#0071E3",
  },
  {
    name: "Dermatology",
    value: 18,
    color: "#30D158",
  },
  {
    name: "Neurology",
    value: 15,
    color: "#FF9F0A",
  },
  {
    name: "Pediatrics",
    value: 14,
    color: "#FF3B30",
  },
  {
    name: "Orthopedic",
    value: 12,
    color: "#AF52DE",
  },
  {
    name: "General",
    value: 10,
    color: "#5AC8FA",
  },
  {
    name: "Other",
    value: 9,
    color: "#86868B",
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentActionMessage, setPaymentActionMessage] = useState("");
  const [processingPaymentId, setProcessingPaymentId] = useState("");

  const fetchPendingPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await fetch(`${PAYMENT_ROUTES.base}?status=PENDING`);

      if (!response.ok) {
        throw new Error("Failed to load pending payment slips");
      }

      const data = await response.json();
      setPendingPayments(Array.isArray(data) ? data : []);
      setPaymentActionMessage("");
    } catch (error) {
      setPaymentActionMessage(error.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const buildSlipUrl = (publicUrl) => {
    if (!publicUrl) {
      return "#";
    }

    if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
      return publicUrl;
    }

    return `${API_GATEWAY}${publicUrl}`;
  };

  const handleApprove = async (paymentId) => {
    try {
      setProcessingPaymentId(paymentId);
      const response = await fetch(PAYMENT_ROUTES.approve(paymentId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewedBy: "admin" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to approve payment");
      }

      setPaymentActionMessage(
        "Payment approved. Appointment payment verified.",
      );
      await fetchPendingPayments();
    } catch (error) {
      setPaymentActionMessage(error.message);
    } finally {
      setProcessingPaymentId("");
    }
  };

  const handleReject = async (paymentId) => {
    try {
      setProcessingPaymentId(paymentId);
      const response = await fetch(PAYMENT_ROUTES.reject(paymentId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewedBy: "admin",
          reason: "Rejected by admin during verification",
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to reject payment");
      }

      setPaymentActionMessage(
        "Payment rejected. Booking cancelled automatically.",
      );
      await fetchPendingPayments();
    } catch (error) {
      setPaymentActionMessage(error.message);
    } finally {
      setProcessingPaymentId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif]">
      {/* Top Nav */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-sm font-medium text-[#86868B] hover:text-[#1D1D1F]"
            >
              Exit to Site
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-semibold text-sm">
              AD
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Users",
              value: "12,450",
              trend: "+8.2%",
              up: true,
              icon: Users,
            },
            {
              label: "Active Doctors",
              value: "342",
              trend: "+12 new",
              up: true,
              icon: Stethoscope,
            },
            {
              label: "Appointments Today",
              value: "1,247",
              trend: "Steady",
              up: true,
              icon: Calendar,
            },
            {
              label: "Monthly Revenue",
              value: "Rs. 4.2M",
              trend: "+15.3%",
              up: true,
              icon: TrendingUp,
            },
          ].map((stat, idx) => (
            <GlassCard key={idx} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${stat.up ? "bg-[#30D158]/10 text-[#30D158]" : "bg-[#FF3B30]/10 text-[#FF3B30]"}`}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm text-[#86868B] font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-[#1D1D1F]">{stat.value}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold">
              Payment Verification Queue
            </h3>
            <AppleButton
              size="sm"
              variant="secondary"
              onClick={fetchPendingPayments}
            >
              Refresh
            </AppleButton>
          </div>

          {paymentActionMessage && (
            <p className="text-sm text-[#0071E3] mb-4">
              {paymentActionMessage}
            </p>
          )}

          {loadingPayments ? (
            <p className="text-sm text-[#86868B]">Loading pending slips...</p>
          ) : pendingPayments.length === 0 ? (
            <p className="text-sm text-[#86868B]">
              No pending payment slips right now.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment._id} className="bg-[#F5F5F7] rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-[#1D1D1F]">
                        Appointment #{payment.appointmentId}
                      </p>
                      <p className="text-xs text-[#86868B]">
                        Patient: {payment.patientId} • Doctor:{" "}
                        {payment.doctorId || "N/A"}
                      </p>
                    </div>
                    <StatusBadge status="payment-pending" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 text-sm">
                    <span className="text-[#86868B]">
                      Amount: Rs. {payment.amount || 0}
                    </span>
                    <a
                      href={buildSlipUrl(payment?.slip?.publicUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0071E3] font-medium hover:underline"
                    >
                      View Payment Slip
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <AppleButton
                      size="sm"
                      className="bg-[#30D158] hover:bg-[#28B44C]"
                      onClick={() => handleApprove(payment._id)}
                      loading={processingPaymentId === payment._id}
                      disabled={
                        processingPaymentId &&
                        processingPaymentId !== payment._id
                      }
                    >
                      Approve
                    </AppleButton>
                    <AppleButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(payment._id)}
                      loading={processingPaymentId === payment._id}
                      disabled={
                        processingPaymentId &&
                        processingPaymentId !== payment._id
                      }
                    >
                      Reject
                    </AppleButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-6">Appointments Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D2D2D7"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#86868B",
                      fontSize: 12,
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#86868B",
                      fontSize: 12,
                    }}
                    dx={-10}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    cursor={{
                      stroke: "#D2D2D7",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0071E3"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "#0071E3",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-6">
              Revenue by Month (Rs. '000)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D2D2D7"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#86868B",
                      fontSize: 12,
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#86868B",
                      fontSize: 12,
                    }}
                    dx={-10}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    cursor={{
                      fill: "#F5F5F7",
                    }}
                  />

                  <Bar dataKey="value" fill="#0071E3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <GlassCard className="p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold">User Management</h3>
              <div className="w-full sm:w-64">
                <SearchBar
                  value=""
                  onChange={() => {}}
                  placeholder="Search users..."
                />
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
              {["All", "Patients", "Doctors", "Admins"].map((filter, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${idx === 0 ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F]"}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D2D2D7]/50 text-sm text-[#86868B]">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    {
                      name: "Sarah Karunaratne",
                      email: "sarah.k@example.com",
                      role: "Patient",
                      status: "online",
                      date: "Mar 1, 2026",
                    },
                    {
                      name: "Dr. Kumara Perera",
                      email: "dr.kumara@example.com",
                      role: "Doctor",
                      status: "online",
                      date: "Feb 15, 2026",
                    },
                    {
                      name: "Ruwan Jayasekara",
                      email: "ruwan.j@example.com",
                      role: "Patient",
                      status: "offline",
                      date: "Jan 10, 2026",
                    },
                    {
                      name: "Dr. Nishani Fernando",
                      email: "dr.nishani@example.com",
                      role: "Doctor",
                      status: "offline",
                      date: "Dec 5, 2025",
                    },
                  ].map((user, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#D2D2D7]/30 last:border-0 hover:bg-[#F5F5F7]/50 transition-colors"
                    >
                      <td className="py-4">
                        <p className="font-medium text-[#1D1D1F]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#86868B]">{user.email}</p>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-[#F5F5F7] rounded-md text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-4 text-[#86868B]">{user.date}</td>
                      <td className="py-4 text-right">
                        <AppleButton
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          View
                        </AppleButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Verification Queue & Specialties */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Doctor Verification Queue
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "Dr. Asanka Silva",
                    spec: "Orthopedic",
                    date: "Today",
                  },
                  {
                    name: "Dr. Chamari Peiris",
                    spec: "Pediatrics",
                    date: "Yesterday",
                  },
                ].map((doc, idx) => (
                  <div key={idx} className="bg-[#F5F5F7] rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-[#1D1D1F]">
                          {doc.name}
                        </p>
                        <p className="text-xs text-[#86868B]">
                          {doc.spec} • Submitted {doc.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-[#0071E3]">
                      <FileText className="w-3 h-3" />{" "}
                      <span className="hover:underline cursor-pointer">
                        Medical License
                      </span>
                      <span className="text-[#D2D2D7]">•</span>
                      <FileText className="w-3 h-3" />{" "}
                      <span className="hover:underline cursor-pointer">
                        ID Proof
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <AppleButton
                        className="flex-1 bg-[#30D158] hover:bg-[#28B44C]"
                        size="sm"
                      >
                        Approve
                      </AppleButton>
                      <AppleButton
                        variant="danger"
                        className="flex-1"
                        size="sm"
                      >
                        Reject
                      </AppleButton>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Specialties Distribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {pieData.slice(0, 4).map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-xs text-[#86868B]"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: spec.color,
                      }}
                    ></div>
                    {spec.name}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
