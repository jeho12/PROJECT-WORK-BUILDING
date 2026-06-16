'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const FAQS = [
  {
    q: "How do I log my daily SIWES activities?",
    a: "Go to the 'Logbook' tab on your sidebar, select the active week, expand today's day card, input your hours and activity (min 50 characters), then click 'Submit & Lock Day'. Remember, locked entries cannot be edited!"
  },
  {
    q: "Why is my supervision room button blocked?",
    a: "To join a session, the system captures your GPS coordinates and verifies they are within 500m of your organization placement. If you are outside this radius, you cannot join the virtual consultation."
  },
  {
    q: "How do I check in daily?",
    a: "Navigate to the 'Attendance' page, click the green 'CLOCK IN' button in the morning, and the red 'CLOCK OUT' button when leaving. Ensure your browser's location access is authorized."
  },
  {
    q: "How do supervisors generate AI summaries?",
    a: "Supervisors can navigate to 'My Students', click 'Review Logs' on a student, select the 'AI Summary Check' tab, and click 'Generate Summary' to retrieve NLP ratings, strengths, and weaknesses."
  },
  {
    q: "Who allocates supervisors to students?",
    a: "Only administrators can assign supervisors. Admins manage allocations using the 'Assignments' tab in the administrative dashboard."
  },
  {
    q: "How do I complete my profile?",
    a: "Go to 'Profile', upload your passport photo, fill in your training placement coordinates, start/end dates, matric info, and save. Your profile must be complete to unlock logbook entries and daily check-ins!"
  },
  {
    q: "Can I edit weekly logs after submitting the report?",
    a: "No. Once a weekly report is submitted for review, the week enters 'submitted' status and locks. If your supervisor rejects it, it returns to 'rejected' status so you can correct details."
  },
  {
    q: "How do I download/print my official SIWES report?",
    a: "Navigate to 'Reports' in your student workspace, select your weeks range, and click the blue 'Export to PDF' button. This downloads a styled compilation of your locked entries, signatures, and evaluations."
  },
  {
    q: "Can I use the portal and clock in on my phone?",
    a: "Yes! The portal is fully responsive. When clocking in from a mobile browser, ensure device location services (GPS) are enabled and location permissions are granted."
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am the Anchor SIWES Assistant. How can I help you navigate the portal today?",
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleFAQClick = (faq: typeof FAQS[0]) => {
    // 1. Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: faq.q,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMsg]);

    // 2. Add bot typing response
    setTimeout(() => {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: faq.a,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Hello! I am the Anchor SIWES Assistant. How can I help you navigate the portal today?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:rotate-12 focus:outline-none flex items-center justify-center border-2 border-white"
          title="Open Chatbot"
          aria-label="Open Chatbot"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="bg-white border border-border-custom rounded-2xl shadow-xl w-[350px] sm:w-[380px] h-[500px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between shadow-sm border-b border-blue-800">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary-light" />
              <div>
                <h4 className="font-bold text-sm tracking-wide">AUL SIWES Bot</h4>
                <p className="text-[10px] text-blue-200">Interactive FAQ Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleReset}
                title="Restart Chat"
                className="p-1 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white transition-colors focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white transition-colors focus:outline-none"
                title="Close Chatbot"
                aria-label="Close Chatbot"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex items-start space-x-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-100 text-primary' : 'bg-slate-200 text-text-secondary'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                
                <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white text-text-primary border border-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Options List (Bottom selection tray) */}
          <div className="p-3 bg-white border-t border-border-custom space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider px-1">Common FAQ Questions</p>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {FAQS.map((faq, index) => {
                // Prevent duplicate click selections to keep logs clean
                const isAlreadyAsked = messages.some((m) => m.text === faq.q);
                return (
                  <button
                    key={index}
                    disabled={isAlreadyAsked}
                    onClick={() => handleFAQClick(faq)}
                    className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 rounded-xl text-[11px] font-semibold text-text-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-normal leading-normal"
                  >
                    {faq.q}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
