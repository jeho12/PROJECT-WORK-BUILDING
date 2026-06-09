'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

interface JitsiFrameProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
}

export default function JitsiFrame({ roomName, displayName, onClose }: JitsiFrameProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Construct Jitsi Public Room url
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col w-screen h-screen">
      {/* Floating meeting controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-lg shadow-md transition-all gap-1.5 focus:outline-none"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </button>
      </div>

      {!iframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white z-10">
          <svg className="animate-spin h-8 w-8 text-primary-light" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-semibold text-slate-300">Initializing Secure SIWES Supervision Room...</p>
        </div>
      )}

      {/* Meet iframe */}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full border-none"
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
}
