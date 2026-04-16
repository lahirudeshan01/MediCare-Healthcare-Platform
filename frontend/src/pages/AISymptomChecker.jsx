import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowUp,
  Paperclip,
  ChevronLeft,
  AlertTriangle } from
'lucide-react';
import { AppleButton } from '../components/ui/AppleButton';
import axios from 'axios';
import { AI_SERVICE } from '../config/api';
const COMMON_SYMPTOMS = [
'Headache',
'Fever',
'Cough',
'Fatigue',
'Chest Pain',
'Nausea',
'Back Pain',
'Dizziness',
'Sore Throat',
'Shortness of Breath'];

export function AISymptomChecker() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
  {
    id: '1',
    type: 'ai',
    content:
    "Hi Sarah 👋 I'm your AI health assistant. Tell me about your symptoms and I'll provide preliminary guidance. Remember, this isn't a substitute for professional medical advice."
  }]
  );
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    const newUserMsg = {
      id: Date.now().toString(),
      type: 'user',
      content: text
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${AI_SERVICE}/ai/check-symptoms`, {
        symptoms: text,
      });
      const { suggested_specialty, urgency, advice } = res.data;

      const urgencyColor = {
        low: { bg: 'bg-green-100', text: 'text-green-700' },
        medium: { bg: 'bg-[#FF9F0A]/10', text: 'text-[#FF9F0A]' },
        high: { bg: 'bg-red-100', text: 'text-red-700' },
      };
      const colors = urgencyColor[urgency] || urgencyColor.medium;

      const aiResponse = (
        <div className="space-y-4">
          <p>Based on your symptoms, here is a preliminary assessment:</p>
          <div className="bg-white border border-[#D2D2D7]/50 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold mb-3">Preliminary Assessment</h4>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-[#86868B]">Urgency:</span>
              <span className={`px-2 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded-md capitalize`}>
                {urgency}
              </span>
            </div>
            <div className="bg-[#F5F5F7] p-3 rounded-lg mb-4">
              <p className="text-sm font-medium mb-1">Advice:</p>
              <p className="text-sm text-[#86868B]">{advice}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#D2D2D7]/50">
              <span className="text-sm font-medium">Recommended: {suggested_specialty}</span>
              <AppleButton size="sm" onClick={() => navigate('/doctors')}>
                Book Appointment
              </AppleButton>
            </div>
          </div>
          <div className="flex gap-2 items-start bg-[#FF9F0A]/10 p-3 rounded-xl text-sm text-[#FF9F0A]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>This is an AI-generated suggestion and not a medical diagnosis. Please consult a healthcare professional for proper evaluation.</p>
          </div>
        </div>
      );

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: 'ai', content: aiResponse },
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: 'Sorry, I encountered an error analyzing your symptoms. Please try again later.',
        },
      ]);
    }
  };
  return (
    <div className="h-screen bg-white font-['Inter',system-ui,sans-serif] flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 hover:bg-[#F5F5F7] rounded-full transition-colors">
              
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071E3] to-[#5AC8FA] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-semibold text-[#1D1D1F] leading-tight">
                  AI Health Assistant
                </h1>
                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#F5F5F7] text-[#86868B] rounded-md uppercase tracking-wider">
                  Beta
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) =>
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              
                <div
                className={`max-w-[85%] md:max-w-[75%] ${msg.type === 'user' ? 'bg-[#0071E3] text-white rounded-2xl rounded-tr-sm px-4 py-3' : 'bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3'}`}>
                
                  {typeof msg.content === 'string' ?
                <p className="text-[15px] leading-relaxed">{msg.content}</p> :

                msg.content
                }
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common Symptoms Chips (only show after first message if no user messages yet) */}
          {messages.length === 1 &&
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            transition={{
              delay: 0.5
            }}
            className="flex flex-wrap gap-2 mt-4">
            
              {COMMON_SYMPTOMS.map((symptom) =>
            <button
              key={symptom}
              onClick={() =>
              handleSend(`I have a ${symptom.toLowerCase()}`)
              }
              className="px-4 py-2 rounded-full border border-[#D2D2D7] text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors bg-white">
              
                  {symptom}
                </button>
            )}
            </motion.div>
          }

          {isTyping &&
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            className="flex justify-start">
            
              <div className="bg-[#F5F5F7] rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1.5 items-center">
                <motion.div
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: 0
                }}
                className="w-2 h-2 bg-[#86868B] rounded-full" />
              
                <motion.div
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: 0.2
                }}
                className="w-2 h-2 bg-[#86868B] rounded-full" />
              
                <motion.div
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: 0.4
                }}
                className="w-2 h-2 bg-[#86868B] rounded-full" />
              
              </div>
            </motion.div>
          }
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-[#D2D2D7]/50 p-4 pb-8 md:pb-4">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2">
          <button className="p-3 text-[#86868B] hover:text-[#1D1D1F] transition-colors shrink-0">
            <Paperclip className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-[#F5F5F7] rounded-2xl border border-transparent focus-within:border-[#D2D2D7] focus-within:bg-white transition-all overflow-hidden flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your symptoms..."
              className="w-full max-h-32 bg-transparent p-3 outline-none resize-none text-[15px]"
              rows={1}
              style={{
                minHeight: '44px'
              }} />
            
          </div>
          <AnimatePresence>
            {input.trim() &&
            <motion.button
              initial={{
                scale: 0,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0,
                opacity: 0
              }}
              onClick={() => handleSend()}
              className="w-10 h-10 rounded-full bg-[#0071E3] text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-[#0077ED] transition-colors mb-0.5">
              
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            }
          </AnimatePresence>
        </div>
      </div>
    </div>);

}