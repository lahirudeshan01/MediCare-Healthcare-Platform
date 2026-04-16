import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorBrowse } from './pages/DoctorBrowse';
import { DoctorProfile } from './pages/DoctorProfile';
import { VideoConsultation } from './pages/VideoConsultation';
import { AISymptomChecker } from './pages/AISymptomChecker';
import { PatientProfile } from './pages/PatientProfile';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/doctors" element={<DoctorBrowse />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/consultation" element={<VideoConsultation />} />
        <Route path="/ai-assistant" element={<AISymptomChecker />} />
        <Route path="/profile/:id?" element={<PatientProfile />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>);

}