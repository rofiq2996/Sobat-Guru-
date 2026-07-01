/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ViewState } from './types';
import { Sidebar } from './components/Sidebar';
import { HeaderDesktop, HeaderMobile } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SiswaView } from './components/SiswaView';
import { JadwalView } from './components/JadwalView';
import { AbsensiView } from './components/AbsensiView';
import { ProfilView } from './components/ProfilView';
import { NilaiView } from './components/NilaiView';
import { AnalisisView } from './components/AnalisisView';
import { JurnalView } from './components/JurnalView';
import { BkView } from './components/BkView';
import { LaporanView } from './components/LaporanView';
import { ComingSoonView } from './components/ComingSoonView';
import { BottomNavigation } from './components/BottomNavigation';
import { KalenderView } from './components/KalenderView';
import { MenuView } from './components/MenuView';
import { LoginView } from './components/LoginView';
import { AdminView } from './components/AdminView';
import { useAppContext } from './context/AppContext';
import { BookOpen } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState | 'admin'>('dashboard');
  const [isDark, setIsDark] = useState(false);
  const { user, userStatus, handleLogin, isSyncing, handleLogout } = useAppContext();

  useEffect(() => {
    // Check initial system/localStorage theme preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(isSystemDark);
        if (isSystemDark) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onChangeView={setCurrentView as any} onToggleTheme={toggleTheme} isDark={isDark} />;
      case 'siswa':
        return <SiswaView />;
      case 'jadwal':
        return <JadwalView />;
      case 'absensi':
        return <AbsensiView />;
      case 'profil':
        return <ProfilView onChangeView={setCurrentView as any} />;
      case 'nilai':
        return <NilaiView />;
      case 'analisis':
        return <AnalisisView />;
      case 'jurnal':
        return <JurnalView />;
      case 'bk':
        return <BkView />;
      case 'laporan':
        return <LaporanView />;
      case 'kalender':
        return <KalenderView />;
      case 'menu':
        return <MenuView onChangeView={setCurrentView as any} />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView onChangeView={setCurrentView as any} onToggleTheme={toggleTheme} isDark={isDark} />;
    }
  };

  if (userStatus === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userStatus === 'unauthenticated' || !user) {
    return <LoginView onLogin={handleLogin} isSyncing={isSyncing} />;
  }

  if (userStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Menunggu Persetujuan</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px]">
            Akun Anda sedang menunggu persetujuan dari Admin. Silakan hubungi admin untuk mendapatkan akses.
          </p>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-200">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0 bg-slate-50/50 dark:bg-slate-950">
        <HeaderMobile 
          currentView={currentView as any} 
          onChangeView={setCurrentView as any}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />
        <HeaderDesktop 
          currentView={currentView as any} 
          onChangeView={setCurrentView as any}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 no-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            {renderView()}
          </div>
        </div>
        <BottomNavigation currentView={currentView as any} onChangeView={setCurrentView as any} />
      </main>
    </div>
  );
}

