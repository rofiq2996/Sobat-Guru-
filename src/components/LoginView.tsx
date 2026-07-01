import React, { useState } from 'react';
import { LogIn, Key, UserPlus, Info, Contact } from 'lucide-react';
import { registerUser, loginWithToken } from '../lib/db';

export const LoginView = ({ onLogin, isSyncing }: { onLogin: (user: any) => void, isSyncing: boolean }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [tokenInput, setTokenInput] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleTokenLogin = async () => {
    if (!tokenInput.trim()) {
      setMessage('Masukkan token login Anda');
      setMessageType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage('');
      const user = await loginWithToken(tokenInput.trim());
      
      if (user) {
        onLogin(user); // Send custom user token
      } else {
        setMessage('Token tidak valid atau belum disetujui');
        setMessageType('error');
      }
    } catch (e: any) {
      setMessage('Terjadi kesalahan koneksi db: ' + e.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regPhone.trim()) {
      setMessage('Semua kolom wajib diisi');
      setMessageType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage('');
      await registerUser(regName.trim(), regPhone.trim());
      setMessage('Pendaftaran berhasil! Hubungi admin untuk mendapatkan Token Login.');
      setMessageType('success');
      setRegName('');
      setRegPhone('');
      setTimeout(() => {
        setActiveTab('login');
        setMessage('');
      }, 4000);
    } catch (e: any) {
      setMessage('Gagal mendaftar: ' + e.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-emerald-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200/50 dark:bg-emerald-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-300/30 dark:bg-emerald-800/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col items-center max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] shadow-2xl shadow-emerald-900/5 border border-white/50 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-4 sm:mb-6 text-center">
          <img 
            src="/logoo.png" 
            alt="Sobat Guru Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto drop-shadow-md mb-1 sm:mb-2"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-1 sm:mb-2 tracking-tight">Sobat Guru!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm px-2">
            Platform manajemen kelas & siswa
          </p>
        </div>

        <div className="w-full">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 sm:mb-6">
            <button 
              onClick={() => { setActiveTab('login'); setMessage(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'login' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setActiveTab('register'); setMessage(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'register' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Daftar
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-6 text-sm flex items-start gap-2 ${messageType === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          {activeTab === 'login' ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Token Login</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 dark:text-slate-100 transition-colors"
                    placeholder="Input token anda"
                    onKeyDown={(e) => e.key === 'Enter' && handleTokenLogin()}
                  />
                </div>
              </div>
              <button 
                onClick={handleTokenLogin}
                disabled={isLoading || isSyncing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 sm:mt-4"
              >
                {isLoading || isSyncing ? 'Memproses...' : 'Masuk Sekarang'}
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 dark:text-slate-100 transition-colors"
                    placeholder="Input nama lengkap"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">No WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Contact className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 dark:text-slate-100 transition-colors"
                    placeholder="Input nomor WA"
                  />
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1.5 leading-relaxed font-medium">
                  WA aktif diperlukan untuk menerima Token Login dari Admin.
                </p>
              </div>
              <button 
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 mt-2 sm:mt-4"
              >
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </div>
          )}

        </div>
        
        <div className="mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-slate-100 dark:border-slate-800 w-full text-center">
          <div className="pt-2">
            <p className="text-[10px] text-slate-400 font-medium">Dikembangkan oleh</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-bold tracking-wide">PT. Al-Fatih Digital Learning</p>
          </div>
        </div>
      </div>
    </div>
  );
};
