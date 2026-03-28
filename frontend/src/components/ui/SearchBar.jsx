import React from 'react';
import { Search } from 'lucide-react';
export function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  className = ''
}) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[#86868B]" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3 bg-[#F5F5F7] border-transparent rounded-full text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 sm:text-base transition-all duration-200 outline-none shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()} />
      
    </div>);

}