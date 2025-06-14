'use client';

import { Plus } from 'lucide-react';
import { Button } from './button';

export default function UploadButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D9DADC] hover:bg-[#C5C6C8] text-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 z-20"
      size="icon"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
} 