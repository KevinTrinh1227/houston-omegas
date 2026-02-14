'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { ChairBadge } from './RoleBadge';
import type { AvailableChair } from '@/lib/member-types';

interface ChairSelectorProps {
  selectedChairs: string[];
  availableChairs: AvailableChair[];
  onChange: (chairs: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export default function ChairSelector({
  selectedChairs,
  availableChairs,
  onChange,
  disabled = false,
  className = '',
}: ChairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredChairs = availableChairs.filter(
    c => c.is_active && !selectedChairs.includes(c.name) &&
      (c.display_name.toLowerCase().includes(search.toLowerCase()) ||
       c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addChair = (chair: string) => {
    onChange([...selectedChairs, chair]);
    setSearch('');
    inputRef.current?.focus();
  };

  const removeChair = (chair: string) => {
    onChange(selectedChairs.filter(c => c !== chair));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`min-h-[42px] px-3 py-2 bg-dash-input border border-dash-input-border rounded-lg flex flex-wrap gap-1.5 items-center cursor-text transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 focus-within:border-gray-300 dark:focus-within:border-gray-600'
        }`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selectedChairs.map(chair => (
          <div key={chair} className="flex items-center gap-1">
            <ChairBadge chair={chair} showIcon={false} />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeChair(chair); }}
                className="text-dash-text-muted hover:text-dash-text transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={selectedChairs.length === 0 ? 'Select chairs...' : ''}
            className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-dash-text placeholder:text-dash-text-muted"
          />
        )}
        {!disabled && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-dash-text-muted hover:text-dash-text transition-colors ml-auto"
          >
            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {open && !disabled && filteredChairs.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-dash-card border border-dash-border rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {filteredChairs.map(chair => (
            <button
              key={chair.name}
              type="button"
              onClick={() => addChair(chair.name)}
              className="w-full px-3 py-2 text-left text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center justify-between"
            >
              <span>{chair.display_name}</span>
              {chair.description && (
                <span className="text-[10px] text-dash-text-muted truncate max-w-[50%]">{chair.description}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && !disabled && filteredChairs.length === 0 && search && (
        <div className="absolute z-50 mt-1 w-full bg-dash-card border border-dash-border rounded-lg shadow-lg py-3 px-4 text-center">
          <p className="text-xs text-dash-text-muted">No chairs match "{search}"</p>
        </div>
      )}
    </div>
  );
}
