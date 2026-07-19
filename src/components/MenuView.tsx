import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  CalendarDays,
  Calendar,
  ClipboardCheck, 
  Contact, 
  BarChart3, 
  Folder,
  Edit3,
  Settings,
  ShieldAlert,
  Award
} from 'lucide-react';
import { ViewState } from '@/src/types';
import { useAppContext } from '../context/AppContext';

interface MenuViewProps {
  onChangeView: (view: ViewState | 'admin') => void;
}

export function MenuView({ onChangeView }: MenuViewProps) {
  const { teacher, userStatus } = useAppContext();

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
    { id: 'bk', label: 'Catatan Siswa', icon: Contact, category: 'Administrasi' },
    { id: 'analisis', label: 'Analisis Siswa', icon: BarChart3, category: 'Administrasi' },
    { id: 'laporan', label: 'Pusat Laporan', icon: Folder, category: 'Administrasi' }
  );

  const categories = ['Akademik', 'Administrasi'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {categories.map(cat => {
        const items = navItems.filter(item => item.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 px-1 uppercase tracking-wider">{cat}</h2>
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id as ViewState | 'admin')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors active:scale-95">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center text-slate-600 dark:text-slate-400 leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
}
