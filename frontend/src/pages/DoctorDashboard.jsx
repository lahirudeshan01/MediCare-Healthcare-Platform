import React, { useEffect, useState } from 'react';
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
  Pencil,
  Video } from
'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';

const AVAILABILITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const AVAILABILITY_BLOCKS = ['9:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 5:00 PM'];

const DEFAULT_AVAILABILITY_SLOTS = AVAILABILITY_DAYS.flatMap((day) =>
AVAILABILITY_BLOCKS.map((block, blockIndex) => ({
  day,
  block,
  isAvailable: blockIndex !== 1
}))
);

export function DoctorDashboard() {
  const navigate = useNavigate();
  const doctorApiBase = import.meta.env.VITE_DOCTOR_API || 'http://localhost:3000';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = user.id || user._id || '';
  const token = localStorage.getItem('token') || '';
  const authHeader = { Authorization: `Bearer ${token}` };
  const userName = user.name || 'Doctor';
  const userInitials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DR';
  const [activeSection, setActiveSection] = useState('dashboard');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [listMessage, setListMessage] = useState('');
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [isUpdatingAppointmentId, setIsUpdatingAppointmentId] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState(DEFAULT_AVAILABILITY_SLOTS);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [allAppointments, setAllAppointments] = useState([]);
  const [patientDirectory, setPatientDirectory] = useState([]);
  const [selectedPatientKey, setSelectedPatientKey] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patientMessage, setPatientMessage] = useState('');
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editPrescriptionForm, setEditPrescriptionForm] = useState({
    patientName: '',
    diagnosis: '',
    notes: '',
    medicationsText: ''
  });

  const parseAppointmentDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    const parsed = new Date(dateValue);
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    const parsedWithCurrentYear = new Date(`${dateValue}, ${new Date().getFullYear()}`);
    if (!Number.isNaN(parsedWithCurrentYear.getTime())) {
      return new Date(
        parsedWithCurrentYear.getFullYear(),
        parsedWithCurrentYear.getMonth(),
        parsedWithCurrentYear.getDate()
      );
    }

    return null;
  };

  const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

  const formatAppointmentDateLabel = (dateValue) => {
    const parsedDate = parseAppointmentDate(dateValue);
    if (!parsedDate) {
      return dateValue || '';
    }

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    if (isSameDay(parsedDate, todayDate)) {
      return 'Today';
    }

    if (isSameDay(parsedDate, tomorrowDate)) {
      return 'Tomorrow';
    }

    return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const todayDate = new Date();
  const todayOnly = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  const todaysApprovedAppointments = approvedAppointments.filter((apt) => {
    const parsedDate = parseAppointmentDate(apt.appointmentDate);
    return parsedDate ? isSameDay(parsedDate, todayOnly) : false;
  });
  const patientsTodayCount =
  new Set(todaysApprovedAppointments.map((apt) => apt.patientId || apt.patientName)).size;
  const completedTodayCount = prescriptions.filter((item) => {
    if (!item.date) {
      return false;
    }

    const prescriptionDate = new Date(item.date);
    if (Number.isNaN(prescriptionDate.getTime())) {
      return false;
    }

    return isSameDay(prescriptionDate, todayOnly);
  }).length;
  const todaysRevenue = todaysApprovedAppointments.reduce((total, apt) =>
  total + (apt.consultType === 'in-person' ? 3000 : 2500), 0
  );
  const todaysRevenueLabel = `Rs. ${todaysRevenue.toLocaleString('en-US')}`;
  const selectedPatient = patientDirectory.find((patient) => patient.key === selectedPatientKey) || null;
  const upcomingAvailabilityDates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(todayOnly);
    date.setDate(todayOnly.getDate() + index);
    const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
    const availableBlocks = availabilitySlots.
    filter((slot) => slot.day === dayShort && slot.isAvailable).
    map((slot) => slot.block);

    return {
      key: `${date.toISOString().slice(0, 10)}-${dayShort}`,
      dayShort,
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      availableBlocks
    };
  }).filter((item) => item.availableBlocks.length > 0);

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

  const updateMedicationField = (id, field, value) => {
    setMedications((prev) =>
    prev.map((med) =>
    med.id === id ?
    {
      ...med,
      [field]: value
    } :
    med
    )
    );
  };

  const loadPrescriptions = async () => {
    setIsLoadingPrescriptions(true);
    setListMessage('');
    try {
      const response = await fetch(`${doctorApiBase}/prescriptions?doctorId=${doctorId}`, { headers: authHeader });
      if (!response.ok) {
        throw new Error('Failed to fetch prescriptions');
      }

      const data = await response.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (_error) {
      setListMessage('Could not load prescriptions list.');
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

  const loadAppointments = async () => {
    setIsLoadingAppointments(true);
    setAppointmentMessage('');
    try {
      const [pendingResponse, approvedResponse] = await Promise.all([
      fetch(`${doctorApiBase}/appointments?doctorId=${doctorId}&status=pending`, { headers: authHeader }),
      fetch(`${doctorApiBase}/appointments?doctorId=${doctorId}&status=approved`, { headers: authHeader })]);


      if (!pendingResponse.ok || !approvedResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const [pendingData, approvedData] = await Promise.all([
      pendingResponse.json(),
      approvedResponse.json()]);


      setPendingAppointments(Array.isArray(pendingData) ? pendingData : []);
      setApprovedAppointments(Array.isArray(approvedData) ? approvedData : []);
    } catch (_error) {
      setAppointmentMessage('Could not load appointment requests.');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const loadPatientsData = async () => {
    setIsLoadingPatients(true);
    setPatientMessage('');
    try {
      const [appointmentsResponse, prescriptionsResponse] = await Promise.all([
      fetch(`${doctorApiBase}/appointments?doctorId=${doctorId}`, { headers: authHeader }),
      fetch(`${doctorApiBase}/prescriptions?doctorId=${doctorId}`, { headers: authHeader })]);


      if (!appointmentsResponse.ok || !prescriptionsResponse.ok) {
        throw new Error('Failed to fetch patient details');
      }

      const [appointmentsData, prescriptionsData] = await Promise.all([
      appointmentsResponse.json(),
      prescriptionsResponse.json()]);


      const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : [];
      const prescriptionsList = Array.isArray(prescriptionsData) ? prescriptionsData : [];

      const patientMap = new Map();

      appointmentsList.forEach((apt) => {
        const patientNameValue = apt.patientName || 'Unknown Patient';
        const key = apt.patientId || `name:${patientNameValue.toLowerCase()}`;
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            key,
            patientName: patientNameValue,
            patientId: apt.patientId || 'N/A',
            appointments: [],
            prescriptions: []
          });
        }

        patientMap.get(key).appointments.push(apt);
      });

      prescriptionsList.forEach((item) => {
        const patientNameValue = item.patientName || 'Unknown Patient';
        const matchedEntry = Array.from(patientMap.values()).find(
          (patient) => patient.patientName.toLowerCase() === patientNameValue.toLowerCase()
        );

        if (matchedEntry) {
          matchedEntry.prescriptions.push(item);
          return;
        }

        const key = `name:${patientNameValue.toLowerCase()}`;
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            key,
            patientName: patientNameValue,
            patientId: 'N/A',
            appointments: [],
            prescriptions: [item]
          });
          return;
        }

        patientMap.get(key).prescriptions.push(item);
      });

      const patients = Array.from(patientMap.values()).
      map((patient) => ({
        ...patient,
        appointments: patient.appointments.sort(
          (a, b) => new Date(b.createdAt || b.appointmentDate || 0) - new Date(a.createdAt || a.appointmentDate || 0)
        ),
        prescriptions: patient.prescriptions.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        )
      })).
      sort((a, b) => a.patientName.localeCompare(b.patientName));

      setAllAppointments(appointmentsList);
      setPatientDirectory(patients);
      setSelectedPatientKey((prev) => {
        const exists = patients.some((patient) => patient.key === prev);
        return exists ? prev : patients[0]?.key || '';
      });
    } catch (_error) {
      setPatientMessage('Could not load patient data.');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadAvailability = async () => {
    setAvailabilityMessage('');
    try {
      const response = await fetch(`${doctorApiBase}/doctors/${doctorId}/availability`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      const incomingSlots = Array.isArray(data.slots) ? data.slots : [];
      if (incomingSlots.length === 0) {
        setAvailabilitySlots(DEFAULT_AVAILABILITY_SLOTS);
        return;
      }

      const mergedSlots = AVAILABILITY_DAYS.flatMap((day) =>
      AVAILABILITY_BLOCKS.map((block) => {
        const existing = incomingSlots.find((slot) => slot.day === day && slot.block === block);
        return {
          day,
          block,
          isAvailable: Boolean(existing?.isAvailable)
        };
      })
      );

      setAvailabilitySlots(mergedSlots);
    } catch (_error) {
      setAvailabilityMessage('Could not load availability.');
    }
  };

  const toggleAvailabilitySlot = (day, block) => {
    if (!isEditingAvailability) {
      return;
    }

    setAvailabilitySlots((prev) =>
    prev.map((slot) =>
    slot.day === day && slot.block === block ?
    {
      ...slot,
      isAvailable: !slot.isAvailable
    } :
    slot
    )
    );
  };

  const handleEditSchedule = async () => {
    if (!isEditingAvailability) {
      setAvailabilityMessage('Edit mode enabled. Click slots to toggle, then Save Schedule.');
      setIsEditingAvailability(true);
      return;
    }

    setIsSavingAvailability(true);
    setAvailabilityMessage('');
    try {
      const response = await fetch(`${doctorApiBase}/doctors/${doctorId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          slots: availabilitySlots
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save availability');
      }

      setAvailabilityMessage('Availability saved successfully.');
      setIsEditingAvailability(false);
      await loadAvailability();
    } catch (_error) {
      setAvailabilityMessage('Failed to save availability. Please try again.');
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    setAppointmentMessage('');
    setIsUpdatingAppointmentId(appointmentId);

    try {
      const response = await fetch(`${doctorApiBase}/appointments/${appointmentId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      setAppointmentMessage(action === 'accept' ? 'Appointment approved.' : 'Appointment rejected.');
      await loadAppointments();
      await loadPatientsData();
    } catch (_error) {
      setAppointmentMessage('Failed to update appointment. Please try again.');
    } finally {
      setIsUpdatingAppointmentId('');
    }
  };

  const medicationsToMultilineText = (medications = []) =>
  medications.
  map((med) => [med.name || '', med.dosage || '', med.frequency || '', med.duration || ''].join(' | ')).
  join('\n');

  const multilineTextToMedications = (text) =>
  text.
  split('\n').
  map((line) => line.trim()).
  filter(Boolean).
  map((line) => {
    const [name = '', dosage = '', frequency = '', duration = ''] = line.split('|').map((part) => part.trim());
    return {
      name,
      dosage,
      frequency,
      duration
    };
  }).
  filter((med) => med.name || med.dosage || med.frequency || med.duration);

  const startEditingPrescription = (item) => {
    setListMessage('');
    setEditingPrescriptionId(item._id);
    setEditPrescriptionForm({
      patientName: item.patientName || '',
      diagnosis: item.diagnosis || '',
      notes: item.notes || '',
      medicationsText: medicationsToMultilineText(item.medications)
    });
  };

  const cancelEditingPrescription = () => {
    setEditingPrescriptionId(null);
    setIsSavingEdit(false);
    setEditPrescriptionForm({
      patientName: '',
      diagnosis: '',
      notes: '',
      medicationsText: ''
    });
  };

  const handleUpdatePrescription = async (id) => {
    setListMessage('');

    if (!editPrescriptionForm.patientName.trim() || !editPrescriptionForm.diagnosis.trim()) {
      setListMessage('Patient name and diagnosis are required for update.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const response = await fetch(`${doctorApiBase}/prescriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          doctorId,
          patientName: editPrescriptionForm.patientName.trim(),
          diagnosis: editPrescriptionForm.diagnosis.trim(),
          notes: editPrescriptionForm.notes.trim(),
          medications: multilineTextToMedications(editPrescriptionForm.medicationsText)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update prescription');
      }

      setListMessage('Prescription updated successfully.');
      cancelEditingPrescription();
      await loadPrescriptions();
      await loadPatientsData();
    } catch (_error) {
      setListMessage('Failed to update prescription. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    setListMessage('');

    const confirmed = window.confirm('Delete this prescription?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${doctorApiBase}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: authHeader
      });

      if (!response.ok) {
        throw new Error('Failed to delete prescription');
      }

      if (editingPrescriptionId === id) {
        cancelEditingPrescription();
      }

      setListMessage('Prescription deleted successfully.');
      await loadPrescriptions();
      await loadPatientsData();
    } catch (_error) {
      setListMessage('Failed to delete prescription. Please try again.');
    }
  };

  useEffect(() => {
    loadPrescriptions();
    loadAppointments();
    loadAvailability();
    loadPatientsData();
  }, []);

  const handlePrescriptionSubmit = async () => {
    setFormMessage('');

    if (!patientName.trim() || !diagnosis.trim()) {
      setFormMessage('Patient name and diagnosis are required.');
      return;
    }

    const filteredMedications = medications.
    map((med) => ({
      name: med.name.trim(),
      dosage: med.dosage.trim(),
      frequency: med.frequency.trim(),
      duration: med.duration.trim()
    }))
    .filter((med) => med.name || med.dosage || med.frequency || med.duration);

    setIsSubmittingPrescription(true);

    try {
      const response = await fetch(`${doctorApiBase}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          doctorId,
          patientName: patientName.trim(),
          diagnosis: diagnosis.trim(),
          medications: filteredMedications,
          notes: notes.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save prescription');
      }

      setFormMessage('Prescription saved successfully.');
      setPatientName('');
      setDiagnosis('');
      setNotes('');
      setMedications([
      {
        id: Date.now(),
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      }]);

      await loadPrescriptions();
      await loadPatientsData();
      setActiveSection('prescriptions');
    } catch (_error) {
      setFormMessage('Failed to save prescription. Please try again.');
    } finally {
      setIsSubmittingPrescription(false);
    }
  };

  const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    section: 'dashboard'
  },
  {
    icon: Calendar,
    label: 'My Schedule',
    section: 'schedule'
  },
  {
    icon: Users,
    label: 'Patients',
    section: 'patients'
  },
  {
    icon: Pill,
    label: 'Prescriptions',
    section: 'prescriptions'
  },
  {
    icon: Clock,
    label: 'Availability',
    section: 'availability'
  },
  {
    icon: Banknote,
    label: 'Earnings'
  }];
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
          {navItems.map((item, idx) =>
          <button
            key={idx}
            type="button"
            onClick={() => item.section && setActiveSection(item.section)}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeSection === item.section ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'}`}>
            
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
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
        {activeSection === 'dashboard' &&
        <>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">
              Welcome back, Dr. {userName.split(' ').slice(-1)[0]}
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
            {userInitials}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
          {
            label: 'Patients Today',
            value: String(patientsTodayCount),
            icon: Users,
            color: 'text-[#0071E3]',
            bg: 'bg-[#0071E3]/10'
          },
          {
            label: 'Pending Requests',
            value: String(pendingAppointments.length),
            icon: Clock,
            color: 'text-[#FF9F0A]',
            bg: 'bg-[#FF9F0A]/10'
          },
          {
            label: 'Completed Today',
            value: String(completedTodayCount),
            icon: CheckCircle,
            color: 'text-[#30D158]',
            bg: 'bg-[#30D158]/10'
          },
          {
            label: "Today's Revenue",
            value: todaysRevenueLabel,
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
                  {isLoadingAppointments &&
                  <p className="text-sm text-[#86868B]">Loading schedule...</p>
                  }

                  {!isLoadingAppointments && todaysApprovedAppointments.length === 0 &&
                  <p className="text-sm text-[#86868B]">No approved appointments yet.</p>
                  }

                  {!isLoadingAppointments &&
                  todaysApprovedAppointments.slice(0, 5).map((apt) =>
                  <div key={apt._id} className="flex items-center gap-4 group">
                      <div className="w-20 text-sm font-medium text-[#86868B] text-right shrink-0">
                        {apt.appointmentTime}
                      </div>
                      <div className="w-3 h-3 rounded-full bg-[#D2D2D7] group-hover:bg-[#0071E3] transition-colors relative z-10"></div>
                      <div className="flex-1 bg-[#F5F5F7] rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1D1D1F]">
                            {apt.patientName}
                          </p>
                          <p className="text-sm text-[#86868B]">
                            {formatAppointmentDateLabel(apt.appointmentDate)} • {apt.consultType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                          </p>
                          <p className="text-xs text-[#86868B] mt-1">Patient ID: {apt.patientId || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status="confirmed" />
                          {apt.consultType === 'video' &&
                        <AppleButton
                          size="sm"
                          onClick={() =>
                          navigate(
                            `/consultation?appointmentId=${apt._id}&doctorId=${doctorId}&patientId=${apt.patientId || 1}`
                          )
                          }
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
              {appointmentMessage &&
              <p className="text-sm text-[#0071E3] mb-3">{appointmentMessage}</p>
              }
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingAppointments &&
                <p className="text-sm text-[#86868B]">Loading requests...</p>
                }

                {!isLoadingAppointments && pendingAppointments.length === 0 &&
                <p className="text-sm text-[#86868B]">No pending appointment requests.</p>
                }

                {!isLoadingAppointments && pendingAppointments.map((req) =>
                <GlassCard key={req._id} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-medium">
                        {(req.patientName || 'Patient').
                      split(' ').
                      map((n) => n[0]).
                      join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{req.patientName}</p>
                        <p className="text-sm text-[#86868B]">
                          {formatAppointmentDateLabel(req.appointmentDate)}, {req.appointmentTime}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[#1D1D1F] mb-4">
                      Reason: {req.reason}
                    </p>
                    <div className="flex gap-2">
                      <AppleButton
                      className="flex-1 bg-[#30D158] hover:bg-[#28B44C] focus:ring-[#30D158]"
                      size="sm"
                      disabled={isUpdatingAppointmentId === req._id}
                      onClick={() => handleAppointmentAction(req._id, 'accept')}
                      icon={<CheckCircle className="w-4 h-4" />}>
                        {isUpdatingAppointmentId === req._id ? 'Updating...' : 'Accept'}
                      </AppleButton>
                      <AppleButton
                      variant="danger"
                      className="flex-1"
                      size="sm"
                      disabled={isUpdatingAppointmentId === req._id}
                      onClick={() => handleAppointmentAction(req._id, 'reject')}
                      icon={<XCircle className="w-4 h-4" />}>
                        {isUpdatingAppointmentId === req._id ? 'Updating...' : 'Reject'}
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
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]" />
                    
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868B] mb-1">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Hypertension"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
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
                          value={med.name}
                          onChange={(e) => updateMedicationField(med.id, 'name', e.target.value)}
                          className="w-full bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3] mb-2" />
                        
                          <div className="grid grid-cols-3 gap-2">
                            <input
                            type="text"
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) => updateMedicationField(med.id, 'dosage', e.target.value)}
                            className="bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />
                          
                            <input
                            type="text"
                            placeholder="Frequency"
                            value={med.frequency}
                            onChange={(e) => updateMedicationField(med.id, 'frequency', e.target.value)}
                            className="bg-white rounded-lg px-3 py-1.5 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />
                          
                            <input
                            type="text"
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => updateMedicationField(med.id, 'duration', e.target.value)}
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
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#0071E3] resize-none" />
                    
                  </div>

                  {formMessage &&
                  <p className="text-sm text-[#0071E3]">{formMessage}</p>
                  }

                  <AppleButton
                    className="w-full mt-4"
                    onClick={handlePrescriptionSubmit}
                    disabled={isSubmittingPrescription}>
                    {isSubmittingPrescription ? 'Saving...' : 'Sign & Send Prescription'}
                  </AppleButton>
                </div>
              </GlassCard>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Availability Management
              </h2>
              <GlassCard className="p-6">
                {availabilityMessage &&
                <p className="text-sm text-[#0071E3] mb-3">{availabilityMessage}</p>
                }

                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1 mb-1 pl-12">
                    {AVAILABILITY_BLOCKS.map((block) =>
                    <p key={`header-${block}`} className="text-[11px] font-medium text-[#86868B] text-center">
                        {block}
                      </p>
                    )}
                  </div>

                  {AVAILABILITY_DAYS.map((day) =>
                  <div key={day} className="flex items-center gap-4">
                      <span className="w-8 text-sm font-medium text-[#86868B]">
                        {day}
                      </span>
                      <div className="flex-1 flex gap-1">
                        {AVAILABILITY_BLOCKS.map((block) => {
                        const slot = availabilitySlots.find((item) => item.day === day && item.block === block);
                        const isAvailable = Boolean(slot?.isAvailable);
                        return (
                          <button
                            key={`${day}-${block}`}
                            type="button"
                            onClick={() => toggleAvailabilitySlot(day, block)}
                            title={block}
                            className={`h-10 flex-1 rounded-md transition-colors ${isAvailable ? 'bg-[#0071E3] opacity-90 hover:opacity-100' : 'bg-[#F5F5F7] hover:bg-[#D2D2D7]'} ${isEditingAvailability ? 'cursor-pointer' : 'cursor-default'}`}>
                          </button>);

                      })}
                      </div>
                    </div>
                  )}
                </div>
                <AppleButton
                  variant="secondary"
                  size="sm"
                  onClick={handleEditSchedule}
                  disabled={isSavingAvailability}
                  className="w-full mt-6">
                  {isEditingAvailability ? isSavingAvailability ? 'Saving...' : 'Save Schedule' : 'Edit Schedule'}
                </AppleButton>
              </GlassCard>
            </section>
          </div>
        </div>
        </>
        }

        {activeSection === 'availability' &&
        <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">
                  Availability
                </h1>
                <p className="text-[#86868B]">Manage and view your available time slots</p>
              </div>
              <AppleButton size="sm" onClick={loadAvailability}>
                Refresh
              </AppleButton>
            </header>

            <div className="space-y-6">
              {/* Schedule Editor */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Weekly Schedule</h2>
                {availabilityMessage &&
                <p className="text-sm text-[#0071E3] mb-3">{availabilityMessage}</p>
                }
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="w-8" />
                    <div className="flex-1 flex gap-1">
                      {AVAILABILITY_BLOCKS.map((block) =>
                      <p key={`header-${block}`} className="text-[11px] font-medium text-[#86868B] text-center flex-1">
                        {block}
                      </p>
                      )}
                    </div>
                  </div>
                  {AVAILABILITY_DAYS.map((day) =>
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium text-[#86868B]">{day}</span>
                    <div className="flex-1 flex gap-1">
                      {AVAILABILITY_BLOCKS.map((block) => {
                        const slot = availabilitySlots.find((item) => item.day === day && item.block === block);
                        const isAvailable = Boolean(slot?.isAvailable);
                        return (
                          <button
                            key={`${day}-${block}`}
                            type="button"
                            onClick={() => toggleAvailabilitySlot(day, block)}
                            title={block}
                            className={`h-10 flex-1 rounded-md transition-colors ${isAvailable ? 'bg-[#0071E3] opacity-90 hover:opacity-100' : 'bg-[#F5F5F7] hover:bg-[#D2D2D7]'} ${isEditingAvailability ? 'cursor-pointer' : 'cursor-default'}`}>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  )}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-[#86868B]">
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#0071E3]" /> Available</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#F5F5F7] border border-[#D2D2D7]" /> Unavailable</span>
                </div>
                <AppleButton
                  variant="secondary"
                  size="sm"
                  onClick={handleEditSchedule}
                  disabled={isSavingAvailability}
                  className="w-full mt-6">
                  {isEditingAvailability ? isSavingAvailability ? 'Saving...' : 'Save Schedule' : 'Edit Schedule'}
                </AppleButton>
              </GlassCard>

              {/* Upcoming dates view */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Upcoming Available Slots (Next 14 Days)</h2>
                {upcomingAvailabilityDates.length === 0 &&
                <p className="text-sm text-[#86868B]">No available slots found for the next 14 days.</p>
                }
                {upcomingAvailabilityDates.length > 0 &&
                <div className="space-y-4">
                  {upcomingAvailabilityDates.map((item) =>
                  <div key={item.key} className="border border-[#D2D2D7]/60 rounded-xl p-4 bg-white">
                    <p className="font-semibold text-[#1D1D1F] mb-2">
                      {item.dayShort}, {item.dateLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.availableBlocks.map((block) =>
                      <span
                        key={`${item.key}-${block}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#0071E3]/10 text-[#0071E3]">
                        {block}
                      </span>
                      )}
                    </div>
                  </div>
                  )}
                </div>
                }
              </GlassCard>
            </div>
          </div>
        }

        {activeSection === 'patients' &&
        <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">
                  Patients
                </h1>
                <p className="text-[#86868B]">Appointment requests, medical records, prescriptions, and details</p>
              </div>
              <AppleButton size="sm" onClick={loadPatientsData}>
                Refresh
              </AppleButton>
            </header>

            {patientMessage &&
            <p className="text-sm text-[#0071E3] mb-4">{patientMessage}</p>
            }

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="p-4 lg:col-span-1">
                <h2 className="text-lg font-semibold mb-3">Patient List</h2>

                {isLoadingPatients &&
                <p className="text-sm text-[#86868B]">Loading patients...</p>
                }

                {!isLoadingPatients && patientDirectory.length === 0 &&
                <p className="text-sm text-[#86868B]">No patient data yet.</p>
                }

                {!isLoadingPatients && patientDirectory.length > 0 &&
                <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                    {patientDirectory.map((patient) => {
                    const pendingCount = patient.appointments.filter((apt) => apt.status === 'pending').length;
                    return (
                      <button
                        type="button"
                        key={patient.key}
                        onClick={() => setSelectedPatientKey(patient.key)}
                        className={`w-full text-left rounded-xl p-3 border transition-colors ${selectedPatientKey === patient.key ? 'bg-[#0071E3]/10 border-[#0071E3]/30' : 'bg-white border-[#D2D2D7]/50 hover:bg-[#F5F5F7]'}`}>
                        <p className="font-medium text-[#1D1D1F]">{patient.patientName}</p>
                        <p className="text-xs text-[#86868B] mt-1">
                          Appointments: {patient.appointments.length} • Prescriptions: {patient.prescriptions.length}
                        </p>
                        {pendingCount > 0 &&
                        <p className="text-xs text-[#FF9F0A] mt-1">Pending requests: {pendingCount}</p>
                        }
                      </button>);

                  })}
                  </div>
                }
              </GlassCard>

              <GlassCard className="p-6 lg:col-span-2">
                {!selectedPatient &&
                <p className="text-sm text-[#86868B]">Select a patient to view details.</p>
                }

                {selectedPatient &&
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D2D2D7]/50 pb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-[#1D1D1F]">{selectedPatient.patientName}</h2>
                        <p className="text-sm text-[#86868B]">Patient ID: {selectedPatient.patientId}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#0071E3]/10 text-[#0071E3]">
                          Appointments: {selectedPatient.appointments.length}
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#30D158]/10 text-[#30D158]">
                          Prescriptions: {selectedPatient.prescriptions.length}
                        </span>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Appointment Requests</h3>
                      {selectedPatient.appointments.length === 0 &&
                      <p className="text-sm text-[#86868B]">No appointments found for this patient.</p>
                      }

                      {selectedPatient.appointments.length > 0 &&
                      <div className="space-y-2">
                          {selectedPatient.appointments.slice(0, 8).map((apt) =>
                        <div key={apt._id} className="rounded-lg border border-[#D2D2D7]/50 p-3 bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium text-[#1D1D1F]">
                                {formatAppointmentDateLabel(apt.appointmentDate)}, {apt.appointmentTime}
                              </p>
                              <StatusBadge status={apt.status === 'approved' ? 'confirmed' : apt.status} />
                            </div>
                            <p className="text-sm text-[#86868B] mt-1">Reason: {apt.reason}</p>
                          </div>
                        )}
                        </div>
                      }
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Past Medical Reports</h3>
                      {selectedPatient.appointments.filter((apt) => apt.status !== 'pending').length === 0 &&
                      <p className="text-sm text-[#86868B]">No past medical records yet.</p>
                      }

                      {selectedPatient.appointments.filter((apt) => apt.status !== 'pending').length > 0 &&
                      <div className="space-y-2">
                          {selectedPatient.appointments.filter((apt) => apt.status !== 'pending').slice(0, 8).map((apt) =>
                        <div key={`record-${apt._id}`} className="rounded-lg border border-[#D2D2D7]/50 p-3 bg-[#F9FAFB]">
                            <p className="text-sm font-medium text-[#1D1D1F]">
                              {formatAppointmentDateLabel(apt.appointmentDate)} • {apt.consultType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                            </p>
                            <p className="text-sm text-[#86868B] mt-1">Clinical note: {apt.reason}</p>
                          </div>
                        )}
                        </div>
                      }
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Prescriptions</h3>
                      {selectedPatient.prescriptions.length === 0 &&
                      <p className="text-sm text-[#86868B]">No prescriptions for this patient yet.</p>
                      }

                      {selectedPatient.prescriptions.length > 0 &&
                      <div className="space-y-2">
                          {selectedPatient.prescriptions.slice(0, 8).map((item) =>
                        <div key={`pres-${item._id}`} className="rounded-lg border border-[#D2D2D7]/50 p-3 bg-white">
                            <p className="text-sm font-medium text-[#1D1D1F]">Diagnosis: {item.diagnosis}</p>
                            <p className="text-xs text-[#86868B] mt-1">
                              {item.date ? new Date(item.date).toLocaleString() : 'Unknown date'}
                            </p>
                            {item.notes &&
                            <p className="text-sm text-[#86868B] mt-1">Notes: {item.notes}</p>
                            }
                          </div>
                        )}
                        </div>
                      }
                    </section>
                  </div>
                }
              </GlassCard>
            </div>
          </div>
        }

        {activeSection === 'schedule' &&
        <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">
                  My Schedule
                </h1>
                <p className="text-[#86868B]">Approved appointments</p>
              </div>
              <AppleButton size="sm" onClick={loadAppointments}>
                Refresh
              </AppleButton>
            </header>

            <GlassCard className="p-6">
              {isLoadingAppointments &&
              <p className="text-sm text-[#86868B]">Loading schedule...</p>
              }

              {!isLoadingAppointments && approvedAppointments.length === 0 &&
              <p className="text-sm text-[#86868B]">No approved appointments yet.</p>
              }

              {!isLoadingAppointments && approvedAppointments.length > 0 &&
              <div className="space-y-4">
                  {approvedAppointments.map((apt) =>
                <div
                  key={apt._id}
                  className="border border-[#D2D2D7]/60 rounded-xl p-4 bg-white flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#1D1D1F]">{apt.patientName}</p>
                      <p className="text-sm text-[#86868B]">
                        {formatAppointmentDateLabel(apt.appointmentDate)}, {apt.appointmentTime}
                      </p>
                      <p className="text-xs text-[#86868B] mt-1">Patient ID: {apt.patientId || 'N/A'}</p>
                      <p className="text-sm text-[#1D1D1F] mt-1">Reason: {apt.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="confirmed" />
                      {apt.consultType === 'video' &&
                  <AppleButton
                    size="sm"
                    onClick={() =>
                    navigate(
                      `/consultation?appointmentId=${apt._id}&doctorId=${doctorId}&patientId=${apt.patientId || 1}`
                    )
                    }
                    icon={<Video className="w-4 h-4" />}>
                          Join
                        </AppleButton>
                  }
                    </div>
                  </div>
                )}
                </div>
              }
            </GlassCard>
          </div>
        }

        {activeSection === 'prescriptions' &&
        <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">
                  Prescriptions
                </h1>
                <p className="text-[#86868B]">All prescriptions saved to MongoDB</p>
              </div>
              <AppleButton size="sm" onClick={loadPrescriptions}>
                Refresh
              </AppleButton>
            </header>

            <GlassCard className="p-6">
              {isLoadingPrescriptions ?
              <p className="text-[#86868B]">Loading prescriptions...</p> :
              <div className="space-y-4">
                  {listMessage &&
                <p className="text-sm text-[#0071E3]">{listMessage}</p>
                }

                  {prescriptions.length === 0 &&
                <p className="text-[#86868B]">No prescriptions found yet.</p>
                }

                  {prescriptions.map((item) =>
                <div key={item._id} className="border border-[#D2D2D7]/60 rounded-xl p-4 bg-white">
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="flex-1">
                          {editingPrescriptionId === item._id ?
                        <div className="space-y-2">
                              <input
                            type="text"
                            value={editPrescriptionForm.patientName}
                            onChange={(e) =>
                            setEditPrescriptionForm((prev) => ({
                              ...prev,
                              patientName: e.target.value
                            }))
                            }
                            placeholder="Patient name"
                            className="w-full bg-[#F5F5F7] rounded-lg px-3 py-2 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />

                              <input
                            type="text"
                            value={editPrescriptionForm.diagnosis}
                            onChange={(e) =>
                            setEditPrescriptionForm((prev) => ({
                              ...prev,
                              diagnosis: e.target.value
                            }))
                            }
                            placeholder="Diagnosis"
                            className="w-full bg-[#F5F5F7] rounded-lg px-3 py-2 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3]" />
                            </div> :
                        <>
                              <p className="font-semibold text-[#1D1D1F]">{item.patientName}</p>
                              <p className="text-sm text-[#86868B]">Diagnosis: {item.diagnosis}</p>
                            </>
                        }
                        </div>
                        <StatusBadge status="confirmed" />
                      </div>

                      <p className="text-sm text-[#1D1D1F] mb-2">
                        Date: {new Date(item.date).toLocaleString()}
                      </p>

                      {editingPrescriptionId === item._id ?
                  <div className="mb-3">
                          <p className="text-sm font-medium text-[#1D1D1F] mb-1">Medications</p>
                          <textarea
                        rows={4}
                        value={editPrescriptionForm.medicationsText}
                        onChange={(e) =>
                        setEditPrescriptionForm((prev) => ({
                          ...prev,
                          medicationsText: e.target.value
                        }))
                        }
                        placeholder="One medication per line: name | dosage | frequency | duration"
                        className="w-full bg-[#F5F5F7] rounded-lg px-3 py-2 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3] resize-y" />
                        </div> :
                  Array.isArray(item.medications) && item.medications.length > 0 &&
                  <div className="mb-2">
                          <p className="text-sm font-medium text-[#1D1D1F] mb-1">Medications</p>
                          <ul className="text-sm text-[#86868B] space-y-1">
                            {item.medications.map((med, idx) =>
                      <li key={`${item._id}-${idx}`}>
                                {med.name || 'Medication'}
                                {(med.dosage || med.frequency || med.duration) &&
                        <span>
                                    {' '}
                                    ({[med.dosage, med.frequency, med.duration].filter(Boolean).join(', ')})
                                  </span>
                        }
                              </li>
                      )}
                          </ul>
                        </div>
                  }

                      {editingPrescriptionId === item._id ?
                  <div className="mb-3">
                          <p className="text-sm font-medium text-[#1D1D1F] mb-1">Notes</p>
                          <textarea
                        rows={2}
                        value={editPrescriptionForm.notes}
                        onChange={(e) =>
                        setEditPrescriptionForm((prev) => ({
                          ...prev,
                          notes: e.target.value
                        }))
                        }
                        className="w-full bg-[#F5F5F7] rounded-lg px-3 py-2 text-sm outline-none border border-[#D2D2D7]/50 focus:border-[#0071E3] resize-none" />
                        </div> :
                  item.notes &&
                  <p className="text-sm text-[#1D1D1F] mb-3">Notes: {item.notes}</p>
                  }

                      <div className="flex flex-wrap gap-2">
                        {editingPrescriptionId === item._id ?
                    <>
                            <AppleButton
                          size="sm"
                          onClick={() => handleUpdatePrescription(item._id)}
                          disabled={isSavingEdit}
                          icon={<CheckCircle className="w-4 h-4" />}>
                              {isSavingEdit ? 'Saving...' : 'Update'}
                            </AppleButton>
                            <AppleButton
                          size="sm"
                          variant="secondary"
                          onClick={cancelEditingPrescription}
                          icon={<XCircle className="w-4 h-4" />}>
                              Cancel
                            </AppleButton>
                          </> :
                    <>
                            <AppleButton
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditingPrescription(item)}
                          icon={<Pencil className="w-4 h-4" />}>
                              Update
                            </AppleButton>
                            <AppleButton
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeletePrescription(item._id)}
                          icon={<Trash2 className="w-4 h-4" />}>
                              Delete
                            </AppleButton>
                          </>
                    }
                      </div>
                    </div>
                )}
                </div>
              }
            </GlassCard>
          </div>
        }
      </main>
    </div>);

}