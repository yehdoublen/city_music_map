'use client';

import { Search } from 'lucide-react';
import { Input } from './input';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 rounded-full h-10 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />
    </div>
  );
}