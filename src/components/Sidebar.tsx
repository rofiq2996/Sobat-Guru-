import { useState } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  CalendarDays,
  Calendar,
  ClipboardCheck, 
  BookOpenText, 
  Contact, 
  BarChart3, 
  Folder,
  LogOut,
  Moon,
  Sun,
  Edit3,
  Settings,
  ShieldAlert,
  Award
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ViewState } from '@/src/types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentView: ViewState | 'admin';
  onChangeView: (view: ViewState | 'admin') => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export function Sidebar({ currentView, onChangeView, onToggleTheme, isDark }: SidebarProps) {
  const { teacher, user, userStatus } = useAppContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Akademik' },
    { id: 'siswa', label: 'Data Siswa', icon: Users, category: 'Akademik' },
    { id: 'jadwal', label: 'Jadwal Hari Ini', icon: CalendarDays, category: 'Akademik' },
    { id: 'absensi', label: 'Absensi', icon: ClipboardCheck, category: 'Akademik' },
    { id: 'nilai', label: 'Penilaian', icon: Edit3, category: 'Akademik' },
  ];

  navItems.push(
    { id: 'kalender', label: 'Kalender Akademik', icon: Calendar, category: 'Akademik' },
    { id: 'jurnal', label: 'Jurnal Harian', icon: BookOpen, category: 'Administrasi' },
    { id: 'bk', label: 'Catatan BK', icon: Contact, category: 'Administrasi' },
    { id: 'analisis', label: 'Analisis Siswa', icon: BarChart3, category: 'Administrasi' },
    { id: 'laporan', label: 'Pusat Laporan', icon: Folder, category: 'Administrasi' },
    { id: 'profil', label: 'Pengaturan', icon: Settings, category: 'Administrasi' }
  );

  if (userStatus === 'admin') {
     navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldAlert, category: 'Administrasi' });
  }

  const categories = ['Akademik', 'Administrasi'];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0f6c46] border-r border-primary-800 h-full shadow-sm z-20 shrink-0 text-white">
      <div className="p-6 flex items-center gap-3 border-b border-primary-700/50 shrink-0">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <img src="/logo-white.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">Sobat Guru!</h2>
          <p className="text-[10px] uppercase font-semibold text-primary-200 tracking-wider truncate max-w-[140px]">{teacher.school}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
        {categories.map((cat, idx) => {
          const items = navItems.filter(item => item.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className={cn("mb-2", idx > 0 && "mt-6")}>
              <p className="px-3 text-xs font-semibold text-primary-200 uppercase tracking-wider mb-2">
                {cat}
              </p>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    currentView === item.id 
                      ? "bg-white/20 font-semibold" 
                      : "hover:bg-white/10 font-medium opacity-90 hover:opacity-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t border-primary-700/50 shrink-0">
        <div 
          className="w-full flex items-center gap-3 p-2 rounded-lg text-left"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profil" className="w-10 h-10 rounded-full border border-white/20 object-cover shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-700 border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">{(teacher.name || 'US').substring(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{teacher.name}</p>
            <p className="text-xs text-primary-200 truncate">{teacher.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

