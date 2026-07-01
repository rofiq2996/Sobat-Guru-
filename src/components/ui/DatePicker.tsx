import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, flipTop: false });

  // Update layout position
  const updatePosition = () => {
    if (buttonRef.current) {
       const rect = buttonRef.current.getBoundingClientRect();
       const popoverHeight = 320;
       const flipTop = rect.bottom + popoverHeight > window.innerHeight;
       setCoords({
         left: rect.left,
         top: flipTop ? rect.top - popoverHeight - 8 : rect.bottom + 8,
         width: rect.width,
         flipTop
       });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  // Handle parsing initial value
  useEffect(() => {
    if (value && isOpen) {
      const [y, m] = value.split('-');
      if (y && m) {
        setCurrentYear(parseInt(y));
        setCurrentMonth(parseInt(m) - 1);
      }
    }
  }, [value, isOpen]);

  // Handle close on click outside or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      // Close on scroll to prevent detached fixed popups, unless scrolling inside the popover itself
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    // Use capture phase for immediate handling
    document.addEventListener('mousedown', handleClickOutside, true);
    window.addEventListener('scroll', handleScroll, true); 

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const selected = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(selected);
    setIsOpen(false);
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = value === dateKey;
        const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
        const dateObj = new Date(currentYear, currentMonth, day);
        const isSunday = dateObj.getDay() === 0;
        const isFriday = dateObj.getDay() === 5;
        
        days.push(
            <button
              key={day}
              type="button"
              onClick={() => handleSelectDate(day)}
              className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isSelected ? 'bg-primary-600 text-white shadow-sm' :
                isToday ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400' :
                'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              } ${(!isSelected && !isToday && isSunday) ? 'text-rose-500' : ''} ${(!isSelected && !isToday && isFriday) ? 'text-green-600 dark:text-green-400' : ''}`}
            >
              {day}
            </button>
        );
    }
    return days;
  };

  const formattedValue = value ? (() => {
    const [y, m, d] = value.split('-');
    if (!y || !m || !d) return 'Pilih Tanggal';
    return `${parseInt(d)} ${monthNames[parseInt(m)-1]} ${y}`;
  })() : 'Pilih Tanggal';

  const popoverContent = (
    <div 
      ref={popoverRef}
      className="fixed z-[9999] w-[300px] sm:w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ top: coords.top, left: Math.max(10, Math.min(coords.left, window.innerWidth - 310)) }}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-semibold text-slate-800 dark:text-white text-sm">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={day} className={`text-center text-xs font-bold ${
              i === 0 ? 'text-rose-500' : 
              i === 5 ? 'text-green-600 dark:text-green-400' : 
              'text-slate-400'
            }`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {renderDays()}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-left outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-700 dark:text-slate-300 w-full ${className}`}
      >
        <span>{formattedValue}</span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>
      {isOpen && createPortal(popoverContent, document.body)}
    </>
  );
}
