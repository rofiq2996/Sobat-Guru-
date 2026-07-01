import { ViewState } from '@/src/types';
import { Moon, Sun, BookOpen, RefreshCw, LogOut, Cloud } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  profil: 'Pengaturan',
  siswa: 'Data Siswa',
  jadwal: 'Jadwal Hari Ini',
  absensi: 'Absensi Siswa',
  nilai: 'Penilaian Akademik',
  jurnal: 'Jurnal Harian',
  bk: 'Catatan Bimbingan Konseling',
  analisis: 'Analisis Belajar',
  laporan: 'Pusat Laporan',
  kalender: 'Kalender Akademik',
  menu: 'Menu Lainnya',
};

function UserControls() {
  const { user, handleLogout, isSyncing } = useAppContext();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isSyncing && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
            <span className="text-xs font-medium text-slate-500">Menyinkronkan...</span>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="p-1.5 md:px-3 md:py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-sm border border-rose-100 dark:border-rose-800/50 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline font-medium">Keluar</span>
        </button>
      </div>
    );
  }

  return null; // since login logic is handled in LoginView before this can even render, but just in case
}

export function HeaderDesktop({ currentView, onToggleTheme, isDark }: HeaderProps) {
  const { teacher } = useAppContext();
  
  return (
    <header className="hidden md:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 py-5 border-b border-slate-200/50 dark:border-slate-800 justify-between items-center z-10 shrink-0">
      <div className="min-w-0 pr-4">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-white truncate">
          {viewTitles[currentView] || 'Portal Guru'}
        </h1>
        <p className="text-sm text-slate-500 font-medium">Sistem Manajemen Kelas & Siswa Terpadu</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <UserControls />
        <button 
          onClick={onToggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}

export function HeaderMobile({ currentView, onChangeView, onToggleTheme, isDark }: HeaderProps) {
  const { teacher } = useAppContext();

  return (
    <header className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-3 text-slate-800 dark:text-white min-w-0">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="/logoo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="font-bold text-base leading-tight truncate tracking-tight">
            Sobat Guru!
          </h1>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-bold truncate uppercase tracking-wider">{teacher.school}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <UserControls />
        <button 
          onClick={onToggleTheme}
          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          title={isDark ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
