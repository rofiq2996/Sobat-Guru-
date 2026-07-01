import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export function SelectDropdown({ value, onChange, options, placeholder = "Pilih opsi", disabled = false, className = "", buttonClassName = "" }: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className={`relative w-full ${isOpen ? 'z-[70]' : 'z-10'} ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full min-h-[42px] border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 flex justify-between items-center text-left disabled:opacity-50 transition-colors ${buttonClassName || 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
      >
        <span className={!value ? "text-slate-500" : "text-slate-800 dark:text-slate-200"}>{selectedLabel}</span>
        <div
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute z-[100] mt-1 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg"
        >
          <ul className="max-h-48 overflow-y-auto custom-scrollbar py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === opt.value 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

