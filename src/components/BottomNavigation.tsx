import { ViewState } from '../types';
import { Home, ClipboardCheck, BookOpen, User, GraduationCap, UserCheck, Settings, LayoutGrid } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export function BottomNavigation({ currentView, onChangeView }: BottomNavProps) {
  const leftItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'nilai', label: 'Nilai', icon: GraduationCap },
  ];

  const rightItems = [
    { id: 'jurnal', label: 'Jurnal', icon: BookOpen },
    { id: 'profil', label: 'Pengaturan', icon: Settings },
  ];

  const renderNavButton = (item: { id: string, label: string, icon: any }) => {
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onChangeView(item.id as ViewState)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
          isActive ? 'text-[#0f6c46] dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <item.icon className={`w-[22px] h-[22px] ${isActive ? 'scale-110 stroke-[2.5px]' : ''} transition-transform`} />
        <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center h-[68px] px-2 relative">
        {/* Left Side */}
        <div className="flex w-2/5 h-full">
          {leftItems.map(renderNavButton)}
        </div>

        {/* Center Floating Button (ABSENSI - QRIS style) */}
        <div className="flex w-1/5 h-full justify-center relative">
          <button
            onClick={() => onChangeView('absensi')}
            className={`absolute -top-5 flex flex-col items-center justify-center active:scale-95 transition-transform duration-200`}
          >
            <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center p-1 shadow-md ${
              currentView === 'absensi' 
                ? 'bg-gradient-to-br from-[#0f6c46] to-primary-700 shadow-[#0f6c46]/30' 
                : 'bg-[#0f6c46] shadow-[#0f6c46]/20'
            }`}>
              <div className="w-full h-full rounded-full border-[1.5px] border-white/25 flex items-center justify-center flex-col">
                <UserCheck className="w-[22px] h-[22px] text-white stroke-[2]" />
              </div>
            </div>
            <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${currentView === 'absensi' ? 'text-[#0f6c46] dark:text-primary-400' : 'text-slate-500 hover:text-slate-600 dark:text-slate-400'}`}>
              Absen
            </span>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex w-2/5 h-full">
          {rightItems.map(renderNavButton)}
        </div>
      </div>
    </div>
  );
}
