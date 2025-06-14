'use client';

import { THEME_COLORS } from '../lib/constants';
import { Music } from 'lucide-react';

export default function CapsuleMarker({ capsule, onClick }) {
  const color = THEME_COLORS[capsule.theme];

  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 animate-bounce"
      style={{ backgroundColor: color }}
    >
      <Music className="w-6 h-6 text-white" />
      
      {/* Ripple effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 animate-ping"
        style={{ backgroundColor: color }}
      />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {capsule.title} - {capsule.artist}
      </div>
    </button>
  );
} 