'use client';

import { Button } from './button';

export default function ViewModeToggle({ viewMode, onChange }) {
  return (
    <div className="flex bg-gray-100 rounded-full p-1">
      <Button
        variant={viewMode === 'capsules' ? 'default' : 'ghost'}
        onClick={() => onChange('capsules')}
        className="rounded-full px-4 py-2 text-xs font-medium transition-all duration-200"
        size="sm"
      >
        彩色膠囊
      </Button>
      <Button
        variant={viewMode === 'nearby' ? 'default' : 'ghost'}
        onClick={() => onChange('nearby')}
        className="rounded-full px-4 py-2 text-xs font-medium transition-all duration-200"
        size="sm"
      >
        附近聆聽
      </Button>
    </div>
  );
}