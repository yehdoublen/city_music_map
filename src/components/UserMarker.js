'use client';

import { useState } from 'react';
import { Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function UserMarker({ user }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="relative group"
      >
        {/* Avatar */}
        <Avatar className="w-10 h-10 border-2 border-white shadow-lg hover:shadow-xl transition-shadow">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
            {user.username.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Music Note Indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6D1A] rounded-full flex items-center justify-center shadow-md animate-pulse">
          <Music className="w-3 h-3 text-white" />
        </div>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
          <div className="font-medium">{user.username}</div>
          <div className="text-gray-300">
            正在聽：{user.currentSong.title} - {user.currentSong.artist}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
        </div>
      )}
    </div>
  );
} 