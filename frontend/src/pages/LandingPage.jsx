import React, { useEffect, useState, Children } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { AppleButton } from '../components/ui/AppleButton';
import {
  Activity,
  Calendar,
  Video,
  Shield,
  ChevronRight,
  Stethoscope,
  Sparkles,
  HeartPulse,
  Clock,
  FileText,
  MessageSquare,
  ArrowRight,
  User } from
'lucide-react';
export function LandingPage() {
  const navigate = useNavigate();
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  const [activeNav, setActiveNav] = useState('');
  useEffect(() => {
    const sectionIds = ['patients', 'telemedicine', 'ai-checker', 'doctors'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0
      }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-['Inter',system-ui,sans-serif] selection:bg-[#0071E3]/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              })
              }>
              
              <div className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                MediCare+
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1D1D1F]">
              {[
              {
                id: 'patients',
                label: 'For Patients'
              },
              {
                id: 'telemedicine',
                label: 'Telemedicine'
              },
              {
                id: 'ai-checker',
                label: 'AI Symptom Checker'
              },
              {
                id: 'doctors',
                label: 'For Doctors'
              }].
              map((item) =>
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`transition-colors relative py-1 ${activeNav === item.id ? 'text-[#0071E3]' : 'hover:text-[#0071E3]'}`}>
                
                  {item.label}
                  {activeNav === item.id &&
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0071E3] rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }} />

                }
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Sign In is temporarily disabled until auth flow is ready */}
              {/*
              <AppleButton
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => navigate('/auth')}>
                Sign In
              </AppleButton>
              */}
              <AppleButton size="sm" onClick={() => navigate('/auth')}>
                Get Started
              </AppleButton>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }}>
            
            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              transition={{
                delay: 0.2,
                duration: 0.5
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-[#D2D2D7]/50 text-sm font-medium text-[#0071E3] mb-8 cursor-pointer hover:bg-[#F5F5F7] transition-colors"
              onClick={() => scrollTo('ai-checker')}>
              
              <Sparkles className="w-4 h-4" />
              <span>Introducing AI-Powered Health Suggestions</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#1D1D1F]">
              Your health.
              <br />
              Brilliantly connected.
            </h1>
            <p className="text-xl md:text-2xl text-[#86868B] mb-10 max-w-2xl mx-auto font-medium">
              Book appointments, consult with top doctors via video, and manage
              your medical records—all in one beautiful, secure place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <AppleButton
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/auth')}>
                
                Create Account
              </AppleButton>
              <AppleButton
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto group"
                onClick={() => scrollTo('telemedicine')}>
                
                Explore Features
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </AppleButton>
            </div>
          </motion.div>
        </section>

        {/* For Patients / Features Section */}
        <section
          id="patients"
          className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need.
            </h2>
            <p className="text-xl text-[#86868B] max-w-2xl mx-auto">
              A complete healthcare ecosystem designed entirely around you.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              margin: '-100px'
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <motion.div variants={itemVariants} className="h-full">
              <GlassCard hover className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Smart Appointments
                </h3>
                <p className="text-[#86868B] flex-grow">
                  Find the right specialist and book instantly. Manage your
                  schedule with seamless calendar integration and real-time
                  updates.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <GlassCard hover className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] mb-6">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Health Tracking</h3>
                <p className="text-[#86868B] flex-grow">
                  Monitor your vitals, track medications, and keep a close eye
                  on your overall wellness journey with beautiful charts.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="h-full lg:col-span-2">
              
              <GlassCard hover className="p-8 flex flex-col h-full">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center text-[#30D158] mb-6">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      Secure Health Records
                    </h3>
                    <p className="text-[#86868B] mb-6">
                      Your medical history, prescriptions, and lab reports are
                      encrypted and stored securely. Access them anytime,
                      anywhere, and share them with your doctors effortlessly.
                    </p>
                    <AppleButton variant="secondary" size="sm">
                      Learn about Privacy
                    </AppleButton>
                  </div>
                  <div className="flex-1 w-full bg-[#F5F5F7] rounded-xl p-6 border border-[#D2D2D7]/50">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) =>
                      <div
                        key={i}
                        className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                        
                          <div className="w-8 h-8 rounded bg-[#0071E3]/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#0071E3]" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-24 bg-[#D2D2D7] rounded mb-2"></div>
                            <div className="h-2 w-16 bg-[#F5F5F7] rounded"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <GlassCard
                hover
                className="p-8 flex flex-col h-full bg-gradient-to-br from-[#0071E3]/5 to-transparent">
                
                <div className="w-12 h-12 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">24/7 Access</h3>
                <p className="text-[#86868B] flex-grow">
                  Your health doesn't sleep, and neither do we. Access your
                  records, book appointments, or check symptoms anytime.
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* Telemedicine Section */}
        <section
          id="telemedicine"
          className="py-24 bg-white border-y border-[#D2D2D7]/50">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D158]/10 text-sm font-medium text-[#30D158]">
                  <Video className="w-4 h-4" /> Virtual Care
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  See a doctor from your living room.
                </h2>
                <p className="text-xl text-[#86868B] leading-relaxed">
                  Skip the waiting room. Connect with top specialists through
                  crystal-clear, secure video consultations. Get diagnoses,
                  prescriptions, and follow-up care without leaving home.
                </p>
                <ul className="space-y-4">
                  {[
                  'HD Video & Audio',
                  'Secure & Encrypted',
                  'Instant Digital Prescriptions',
                  'Screen Sharing for Lab Results'].
                  map((feature, i) =>
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[#1D1D1F] font-medium">
                    
                      <div className="w-6 h-6 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158]">
                        <Activity className="w-3 h-3" />
                      </div>
                      {feature}
                    </li>
                  )}
                </ul>
                <AppleButton size="lg" onClick={() => navigate('/auth')}>
                  Start a Consultation
                </AppleButton>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#D2D2D7]/50 bg-[#1D1D1F] aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  {/* Mock Video UI */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>{' '}
                        12:45
                      </div>
                      <div className="w-32 h-24 bg-gray-700 rounded-lg border-2 border-white/20 shadow-lg overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                          <User className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="z-10 text-center text-white">
                    <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold shadow-lg">
                      Dr. F
                    </div>
                    <h3 className="text-xl font-medium">
                      Dr. Nishani Fernando
                    </h3>
                    <p className="text-white/70">Dermatologist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Symptom Checker Section */}
        <section
          id="ai-checker"
          className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <div className="flex-1 w-full">
              <GlassCard className="p-6 max-w-md mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0071E3] to-[#5AC8FA]"></div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D2D2D7]/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071E3] to-[#5AC8FA] flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Assistant</h4>
                    <p className="text-xs text-[#86868B]">Online</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-start">
                    <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm">
                      Hi! I'm your AI health assistant. How are you feeling
                      today?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#0071E3] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm">
                      I've had a mild headache and fever since yesterday.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm">
                      <p className="mb-2">
                        Based on your symptoms, this could be a mild viral
                        infection. I recommend:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-[#86868B]">
                        <li>Resting and staying hydrated</li>
                        <li>Monitoring your temperature</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F5F5F7] rounded-full px-4 py-3 flex items-center justify-between text-sm text-[#86868B]">
                  <span>Type your symptoms...</span>
                  <div className="w-6 h-6 rounded-full bg-[#0071E3] flex items-center justify-center text-white">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </GlassCard>
            </div>
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F0A]/10 text-sm font-medium text-[#FF9F0A]">
                <Sparkles className="w-4 h-4" /> AI-Powered
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Not feeling well? Just ask.
              </h2>
              <p className="text-xl text-[#86868B] leading-relaxed">
                Describe your symptoms in plain English. Our advanced AI
                analyzes your input instantly to provide preliminary guidance,
                suggest possible causes, and recommend the right specialist to
                see.
              </p>
              <AppleButton size="lg" onClick={() => navigate('/auth')}>
                Try Symptom Checker
              </AppleButton>
            </div>
          </div>
        </section>

        {/* For Doctors Section */}
        <section id="doctors" className="py-24 bg-[#1D1D1F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mx-auto mb-8">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Empowering Healthcare Providers.
            </h2>
            <p className="text-xl text-[#86868B] max-w-3xl mx-auto mb-12">
              Join thousands of doctors using MediCare+ to manage their
              practice, conduct virtual visits, and issue digital prescriptions
              with our powerful, secure provider tools.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <Calendar className="w-8 h-8 text-[#0071E3] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-[#86868B]">
                  Automated booking, reminders, and calendar syncing to reduce
                  no-shows.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <FileText className="w-8 h-8 text-[#30D158] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Digital EMR</h3>
                <p className="text-[#86868B]">
                  Access patient history instantly and write digital
                  prescriptions securely.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <Activity className="w-8 h-8 text-[#FF9F0A] mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Practice Analytics
                </h3>
                <p className="text-[#86868B]">
                  Gain insights into your practice performance with detailed
                  reporting.
                </p>
              </div>
            </div>

            <AppleButton
              variant="secondary"
              className="!bg-white !text-[#1D1D1F] hover:!bg-white/90"
              size="lg"
              onClick={() => navigate('/doctor-dashboard#')}>
              
              Join the Provider Network
            </AppleButton>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D2D2D7]/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0071E3] flex items-center justify-center text-white">
              <Activity className="w-3 h-3" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              MediCare+
            </span>
          </div>
          <div className="flex gap-6 text-sm text-[#86868B]">
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">
              Contact Support
            </a>
          </div>
          <p className="text-sm text-[#86868B]">
            © 2026 MediCare+. All rights reserved.
          </p>
        </div>
      </footer>
    </div>);

}