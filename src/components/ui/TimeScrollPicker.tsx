import { useState, useRef, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface TimeScrollPickerProps {
  value: string; // "HH:MM"
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
}

export function TimeScrollPicker({ value, onChange, placeholder, disabled, align = 'left' }: TimeScrollPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [hours, setHours] = useState(value ? value.split(':')[0] : '00');
  const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');

  useEffect(() => {
    if (value) {
      setHours(value.split(':')[0]);
      setMinutes(value.split(':')[1]);
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative flex-1 ${isOpen ? 'z-[80]' : 'z-10'}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-slate-800 border ${isOpen ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 flex justify-between items-center text-left disabled:opacity-50 h-[38px] transition-all`}
      >
        <span className={!value ? "text-slate-500" : "text-slate-800 dark:text-slate-200"}>
          {value || placeholder || "--:--"}
        </span>
        <Clock className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'text-primary-500 scale-110' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-[80] mt-2 top-full ${align === 'left' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl w-64 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
          <div className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Pilih Waktu</h3>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 flex justify-center items-center gap-2 relative">
            
            <div className="absolute top-1/2 left-4 right-4 h-[40px] -mt-[20px] bg-slate-100 dark:bg-slate-800 rounded-lg pointer-events-none border-y border-slate-200 dark:border-slate-700 z-0"></div>

            <div className="relative z-10 w-16 flex flex-col items-center">
              <ScrollColumn 
                items={Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))} 
                value={hours} 
                onChange={setHours} 
              />
            </div>

            <div className="relative z-10 text-lg font-bold text-slate-400 dark:text-slate-500 mb-1">:</div>

            <div className="relative z-10 w-16 flex flex-col items-center">
              <ScrollColumn 
                items={Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))} 
                value={minutes} 
                onChange={setMinutes} 
              />
            </div>

          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-xs"
            >
              Batal
            </button>
            <button 
              type="button" 
              onClick={() => {
                onChange(`${hours}:${minutes}`);
                setIsOpen(false);
              }}
              className="flex-1 py-2 px-3 bg-[#0f6c46] hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-xs"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScrollColumn({ items, value, onChange }: { items: string[], value: string, onChange: (val: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;

  useEffect(() => {
    if (containerRef.current) {
      const idx = items.indexOf(value);
      if (idx !== -1) {
        containerRef.current.scrollTop = idx * itemHeight;
      }
    }
  }, [value, items, itemHeight]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const container = containerRef.current;
    
    if(!container) return;

    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const idx = Math.round(container.scrollTop / itemHeight);
        if (items[idx] && items[idx] !== value) {
          onChange(items[idx]);
        }
      }, 50); 
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    }
  }, [items, value, onChange, itemHeight]);

  return (
    <div 
      className="overflow-y-auto snap-y snap-mandatory relative scroll-smooth no-scrollbar w-full"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', height: `${itemHeight * 3}px` }}
      ref={containerRef}
    >
      <div style={{ height: `${itemHeight}px` }}></div> 
      {items.map(item => (
        <div 
          key={item} 
          className={`flex items-center justify-center snap-center transition-all duration-200 ${item === value ? 'text-slate-900 dark:text-white font-semibold scale-110 text-xl' : 'text-slate-400 dark:text-slate-500 font-medium opacity-50 scale-90 text-xl'}`}
          style={{ height: `${itemHeight}px` }}
        >
          {item}
        </div>
      ))}
      <div style={{ height: `${itemHeight}px` }}></div> 
    </div>
  );
}
