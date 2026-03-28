import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
export function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4 font-['Inter',system-ui,sans-serif] text-[#1D1D1F]">
      <div
        className="mb-8 flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}>
        
        <div className="w-10 h-10 rounded-full bg-[#0071E3] flex items-center justify-center text-white shadow-sm">
          <Activity className="w-6 h-6" />
        </div>
        <span className="text-2xl font-semibold tracking-tight">MediCare+</span>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#D2D2D7]/50 overflow-hidden">
        
        <div className="flex border-b border-[#D2D2D7]/50 relative">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${tab === 'login' ? 'text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
            
            Sign In
            {tab === 'login' &&
            <motion.div
              layoutId="authTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3]" />

            }
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${tab === 'register' ? 'text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
            
            Create Account
            {tab === 'register' &&
            <motion.div
              layoutId="authTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3]" />

            }
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {tab === 'login' ?
            <motion.form
              key="login"
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: 20
              }}
              transition={{
                duration: 0.2
              }}
              onSubmit={handleLogin}
              className="space-y-5">
              
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                    Email
                  </label>
                  <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                  required />
                
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-[#1D1D1F]">
                      Password
                    </label>
                    <a
                    href="#"
                    className="text-sm text-[#0071E3] hover:underline">
                    
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                    required />
                  
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                    
                      {showPassword ?
                    <EyeOff className="w-5 h-5" /> :

                    <Eye className="w-5 h-5" />
                    }
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-[#D2D2D7] text-[#0071E3] focus:ring-[#0071E3]" />
                
                  <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-[#1D1D1F]">
                  
                    Remember me
                  </label>
                </div>

                <AppleButton type="submit" className="w-full">
                  Sign In
                </AppleButton>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D2D2D7]/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#86868B]">or</span>
                  </div>
                </div>

                <AppleButton
                variant="secondary"
                type="button"
                className="w-full"
                icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4" />
                  
                      <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853" />
                  
                      <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05" />
                  
                      <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335" />
                  
                    </svg>
                }>
                
                  Continue with Google
                </AppleButton>
              </motion.form> :

            <motion.form
              key="register"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              transition={{
                duration: 0.2
              }}
              onSubmit={handleRegister}
              className="space-y-5">
              
                <div className="flex p-1 bg-[#F5F5F7] rounded-xl relative">
                  <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors relative z-10 ${role === 'patient' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                  
                    Patient
                    {role === 'patient' &&
                  <motion.div
                    layoutId="roleTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10" />

                  }
                  </button>
                  <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors relative z-10 ${role === 'doctor' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                  
                    Doctor
                    {role === 'doctor' &&
                  <motion.div
                    layoutId="roleTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10" />

                  }
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                    Full Name
                  </label>
                  <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                  required />
                
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                    Email
                  </label>
                  <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                  required />
                
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                    Phone Number
                  </label>
                  <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                  required />
                
                </div>

                {role === 'doctor' &&
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0
                }}
                animate={{
                  opacity: 1,
                  height: 'auto'
                }}
                className="space-y-5 overflow-hidden">
                
                    <div>
                      <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                        Specialty
                      </label>
                      <select className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none appearance-none">
                        <option value="">Select Specialty</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                        Medical License Number
                      </label>
                      <input
                    type="text"
                    placeholder="SLMC-12345"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                    required />
                  
                    </div>
                  </motion.div>
              }

                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                    required />
                  
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                    
                      {showPassword ?
                    <EyeOff className="w-5 h-5" /> :

                    <Eye className="w-5 h-5" />
                    }
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-[#D2D2D7] text-[#0071E3] focus:ring-[#0071E3]"
                  required />
                
                  <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-[#86868B]">
                  
                    I agree to the{' '}
                    <a href="#" className="text-[#0071E3] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#0071E3] hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <AppleButton type="submit" className="w-full">
                  Create Account
                </AppleButton>
              </motion.form>
            }
          </AnimatePresence>
        </div>
      </motion.div>

      <p className="mt-8 text-sm text-[#86868B]">
        {tab === 'login' ?
        "Don't have an account? " :
        'Already have an account? '}
        <button
          onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
          className="text-[#0071E3] font-medium hover:underline">
          
          {tab === 'login' ? 'Register' : 'Sign in'}
        </button>
      </p>

      <button
        onClick={() => navigate('/admin')}
        className="mt-4 px-4 py-2 text-xs font-medium text-[#86868B] border border-dashed border-[#D2D2D7] rounded-lg hover:text-[#1D1D1F] hover:border-[#86868B] transition-colors">
        
        ⚙️ Admin Dashboard (Dev Only)
      </button>
    </div>);

}