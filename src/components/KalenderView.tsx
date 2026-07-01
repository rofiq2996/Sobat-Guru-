import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ConfirmModal } from './ui/ConfirmModal';

export function KalenderView() {
  const { agendas, setAgendas } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5)); // June 2026 as per metadata if we want, or just new Date()
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  
  const [newAgenda, setNewAgenda] = useState<{title: string; type: string}>({ title: '', type: 'akademik' });
  const [editAgendaIndex, setEditAgendaIndex] = useState<number | null>(null);
  const [agendaToDelete, setAgendaToDelete] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    setIsAgendaModalOpen(true);
    setEditAgendaIndex(null);
    setNewAgenda({ title: '', type: 'akademik' });
  };

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newAgenda.title) return;

    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    
    setAgendas(prev => {
      const current = prev[dateKey] || [];
      if (editAgendaIndex !== null) {
        const updated = [...current];
        updated[editAgendaIndex] = { ...newAgenda };
        return { ...prev, [dateKey]: updated };
      }
      return {
        ...prev,
        [dateKey]: [...current, { ...newAgenda }]
      };
    });

    setNewAgenda({ title: '', type: 'akademik' });
    setEditAgendaIndex(null);
  };

  const handleEditAgenda = (idx: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const agendaToEdit = agendas[dateKey][idx];
    if (agendaToEdit) {
      setNewAgenda({ ...agendaToEdit });
      setEditAgendaIndex(idx);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDeleteAgenda = (idx: number) => {
    setAgendaToDelete(idx);
  };

  const confirmDeleteAgenda = () => {
    if (!selectedDate || agendaToDelete === null) return;
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    
    setAgendas(prev => {
      const current = prev[dateKey] || [];
      const updated = current.filter((_, i) => i !== agendaToDelete);
      return { ...prev, [dateKey]: updated };
    });
    
    if (editAgendaIndex === agendaToDelete) {
      setNewAgenda({ title: '', type: 'akademik' });
      setEditAgendaIndex(null);
    } else if (editAgendaIndex !== null && agendaToDelete < editAgendaIndex) {
      setEditAgendaIndex(editAgendaIndex - 1);
    }
    setAgendaToDelete(null);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'akademik': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rapat': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'libur': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-12 sm:h-24 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg sm:rounded-xl"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAgendas = agendas[dateKey] || [];
        const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
        const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;
        const isFriday = new Date(currentYear, currentMonth, day).getDay() === 5;
        const isHoliday = dayAgendas.some(agenda => agenda.type === 'libur');

        days.push(
            <div 
              key={day} 
              onClick={() => handleDateClick(day)}
              className={`h-12 sm:h-24 border ${isToday ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'} bg-white dark:bg-slate-900 p-1 sm:p-2 cursor-pointer transition-all hover:shadow-sm flex flex-col rounded-lg sm:rounded-xl active:scale-95 relative`}
            >
              <div className="flex justify-center sm:justify-between items-start">
                  <span className={`text-xs sm:text-sm font-semibold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-primary-600 text-white' : 
                    (isSunday || isHoliday) ? 'text-rose-600 dark:text-rose-400' : 
                    isFriday ? 'text-green-600 dark:text-green-400' :
                    'text-slate-700 dark:text-slate-300'
                  }`}>
                      {day}
                  </span>
              </div>
              {dayAgendas.length > 0 && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex sm:hidden gap-0.5">
                    {dayAgendas.slice(0, 3).map((_, i) => (
                      <span key={i} className="w-1 h-1 rounded-full bg-primary-500"></span>
                    ))}
                  </div>
              )}
              <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-y-auto no-scrollbar flex-1 pb-1">
                  {dayAgendas.slice(0, 2).map((agenda, idx) => (
                      <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getTypeStyle(agenda.type)}`}>
                          {agenda.title}
                      </div>
                  ))}
                  {dayAgendas.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-medium px-1">
                          +{dayAgendas.length - 2} lagi
                      </div>
                  )}
              </div>
            </div>
        );
    }

    return days;
  };

  const selectedDateKey = selectedDate ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null;
  const currentAgendas = selectedDateKey ? agendas[selectedDateKey] || [] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
            Kalender Akademik
          </h2>
          <p className="text-sm text-slate-500 mt-1">Kelola agenda dan jadwal akademik sekolah</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 transition-colors hidden sm:block">
              Hari Ini
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={`text-center text-xs font-bold py-2 ${
              idx === 0 ? 'text-rose-500 w-full' : 
              idx === 5 ? 'text-green-600 dark:text-green-400 w-full' : 
              'text-slate-500 dark:text-slate-400'
            }`}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      <ConfirmModal
        isOpen={agendaToDelete !== null}
        title="Hapus Agenda"
        message="Apakah Anda yakin ingin menghapus agenda ini?"
        onConfirm={confirmDeleteAgenda}
        onCancel={() => setAgendaToDelete(null)}
      />

      {/* Modal Agenda */}
      {isAgendaModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Agenda Tanggal</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  {selectedDate} {monthNames[currentMonth]} {currentYear}
                </p>
              </div>
              <button 
                onClick={() => setIsAgendaModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto no-scrollbar flex-1">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                  Daftar Agenda
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs">{currentAgendas.length}</span>
                </h4>
                
                {currentAgendas.length > 0 ? (
                  <div className="space-y-3">
                    {currentAgendas.map((agenda, idx) => (
                      <div key={idx} className="flex gap-3 group relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            agenda.type === 'akademik' ? 'bg-blue-500' :
                            agenda.type === 'rapat' ? 'bg-purple-500' : 'bg-rose-500'
                          }`}></div>
                          {idx !== currentAgendas.length - 1 && (
                            <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-1"></div>
                          )}
                        </div>
                        <div className="pb-3 flex-1">
                          <p className="font-semibold text-sm text-slate-800 dark:text-white">{agenda.title}</p>
                        </div>
                        <div className="flex items-start gap-1 pt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pr-2">
                          <button 
                            onClick={() => handleEditAgenda(idx)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAgenda(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-slate-500">Belum ada agenda pada tanggal ini</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {editAgendaIndex !== null ? <Edit2 className="w-4 h-4 text-primary-600" /> : <Plus className="w-4 h-4 text-primary-600" />}
                    {editAgendaIndex !== null ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                  </div>
                  {editAgendaIndex !== null && (
                    <button 
                      onClick={() => {
                        setEditAgendaIndex(null);
                        setNewAgenda({ title: '', type: 'akademik' });
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded"
                    >
                      Batal
                    </button>
                  )}
                </h4>
                <form ref={formRef} onSubmit={handleAddAgenda} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nama Kegiatan</label>
                    <input 
                      type="text" 
                      required
                      value={newAgenda.title}
                      onChange={(e) => setNewAgenda({...newAgenda, title: e.target.value})}
                      placeholder="Contoh: Rapat Wali Murid"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input 
                      type="checkbox"
                      checked={newAgenda.type === 'libur'}
                      onChange={(e) => setNewAgenda({...newAgenda, type: e.target.checked ? 'libur' : 'akademik'})}
                      className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Jadikan Tanggal Merah (Libur)</span>
                  </label>
                  <button 
                    type="submit"
                    disabled={!newAgenda.title}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2 flex justify-center items-center gap-2"
                  >
                    Simpan Agenda
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
