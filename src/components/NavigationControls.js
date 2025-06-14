'use client';

import { Menu, Heart } from 'lucide-react';
import { Button } from './ui/button';

export default function NavigationControls() {
  return (
    <div className="flex items-center gap-2">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-full hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Favorites Button */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-full hover:bg-gray-100"
      >
        <Heart className="w-5 h-5" />
      </Button>
    </div>
  );
} 