import { useState, useEffect } from 'react';
import { Users, Building, BookText, Check, UserPlus, UserCog, CalendarClock, CalendarDays, ClipboardCheck, MessageCircle, BarChart3, Folder, Moon, Sun, Contact, ShieldCheck, UserCheck, Activity, Calendar } from 'lucide-react';
import { ViewState } from '@/src/types';
import { useAppContext } from '../context/AppContext';

interface DashboardProps {
  onChangeView: (view: ViewState) => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export function DashboardView({ onChangeView, onToggleTheme, isDark }: DashboardProps) {
  const { teacher, classes, subjects, students, attendances, user } = useAppContext();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, ':') + ' WIB';

  // Calculate stats based on current date attendances if available
  const dateKey = currentTime.toISOString().split('T')[0];
  let hadirCount = 0;
  let absenCount = 0;
  if (attendances && attendances[dateKey]) {
    hadirCount = attendances[dateKey].filter(a => a.status === 'Hadir').length;
    absenCount = attendances[dateKey].filter(a => ['Izin', 'Sakit', 'Alpa'].includes(a.status)).length;
  }

  const stats = [
    { label: 'Total Siswa', value: students?.length.toString() || '0', icon: Users, color: 'text-[#0f6c46] dark:text-emerald-500', bg: 'bg-[#0f6c46]/10 dark:bg-emerald-900/20', solidBg: 'bg-[#0f6c46]' },
    { label: 'Total Kelas', value: classes?.length.toString() || '0', icon: Building, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', solidBg: 'bg-blue-500' },
    { label: 'Total Mapel', value: subjects?.length.toString() || '0', icon: BookText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', solidBg: 'bg-orange-500' },
    { label: 'Kasus BK', value: '0', icon: Contact, color: 'text-purple-600 dark:text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', solidBg: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mobile Top Green Header overlapping metrics card */}
      <div className="md:hidden">
        <div className="bg-[#0f6c46] -mx-4 -mt-4 px-6 pt-8 pb-20 rounded-b-[2rem] relative shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-primary-100 font-medium">Selamat datang,</p>
              <h2 className="text-2xl font-bold mt-1 text-white">{teacher.name}</h2>
              <p className="text-xs text-primary-200 mt-1">{teacher.role}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-white bg-primary-700 flex items-center justify-center text-xl font-bold text-white shadow-sm overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <>{(teacher.name || 'GU').substring(0, 2).toUpperCase()}</>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="-mt-14 mx-1 relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col mb-6">
          <div className="p-3 px-4 flex justify-between items-center text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="font-bold text-xs">{formattedDate}</div>
            <div className="text-xs flex items-center gap-1.5 font-medium text-slate-500">
              <CalendarClock className="w-4 h-4" /> <span>{formattedTime}</span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mb-0.5">{stat.label}</p>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate leading-none">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Mobile) */}
        <div className="mb-6 mx-1 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-4">
          <div className="grid grid-cols-3 gap-y-5 gap-x-2">
            <button onClick={() => onChangeView('siswa')} className="flex flex-col items-center justify-start gap-2 active:scale-95 transition-transform px-1">
              <div className="w-12 h-12 bg-[#0f6c46] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">Data Siswa</span>
            </button>
            <button onClick={() => onChangeView('jadwal')} className="flex flex-col items-center justify-start gap-2 active:scale-95 transition-transform px-1">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">Jadwal</span>
            </button>
            <button onClick={() => onChangeView('kalender')} className="flex flex-col items-center justify-start gap-2 active:scale-95 transition-transform px-1">
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">Kalender</span>
            </button>
            <button onClick={() => onChangeView('bk')} className="flex flex-col items-center justify-start gap-2 active:scale-95 transition-transform px-1">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">BK</span>
            </button>
            <button onClick={() => onChangeView('analisis')} className="flex flex-col items-center justify-start gap-2 active:scale-95 transition-transform px-1">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">Analisis</span>
            </button>
            <button onClick={() => onChangeView('laporan')} className="flex flex-col items-center justify-start gap-2 active:scale-95 transition-transform px-1">
              <div className="w-12 h-12 bg-[#189a66] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Stats */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${stat.bg} rounded-full transition-transform group-hover:scale-110 pointer-events-none`} />
            <div className="relative z-10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-bold ${['Hadir', 'Izin / Sakit', 'Kasus BK'].includes(stat.label) ? stat.color : 'text-slate-800 dark:text-white'}`}>
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Jadwal Hari Ini</h3>
            <button onClick={() => onChangeView('jadwal')} className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              Atur Jadwal
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 md:block hidden">
            <div className="flex flex-col items-center justify-center p-10 text-slate-400 dark:text-slate-500">
              <CalendarDays className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">Belum ada jadwal hari ini</p>
            </div>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex flex-col items-center justify-center p-10 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
              <CalendarDays className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">Belum ada jadwal hari ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Live Report</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-medium text-slate-500">Real-time</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-10">
              <Activity className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">Belum ada aktivitas terbaru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}