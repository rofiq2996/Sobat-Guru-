import { ViewState } from '@/src/types';

interface ComingSoonProps {
  view: ViewState;
}

const titles: Record<string, string> = {
  nilai: 'Modul Penilaian',
  analisis: 'Analisis Belajar',
  jurnal: 'Jurnal Harian Mengajar',
  bk: 'Catatan Siswa',
  laporan: 'Eksport Pusat Laporan',
};

export function ComingSoonView({ view }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        {titles[view] || 'Modul'} Sedang Dibangun
      </h2>
      <p className="text-slate-500 max-w-md text-center">
        Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia pada pembaruan Sobat Guru! berikutnya.
      </p>
    </div>
  );
}
