import { Calendar as CalendarIcon, Save, Pencil, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';
import { isHoliday, getHolidayName } from '../lib/holidays';

export function AbsensiView() {
  const { classes, students: globalStudents, attendances, setAttendances } = useAppContext();
  const [selectedClass, setSelectedClass] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const holidayName = getHolidayName(date);
  const isHolidayDate = isHoliday(date);
  
  const attendanceKey = `${selectedClass}_${date}`;
  const existingRecords = attendances[attendanceKey] || [];

  const classStudents = globalStudents.filter(s => s.class?.trim().toLowerCase() === selectedClass?.trim().toLowerCase());
  const students = classStudents.map((s, idx) => {
    const existing = existingRecords.find(r => r.name === s.name);
    if (existing) {
      return { ...existing, id: s.id || existing.id };
    }
    return {
      id: s.id || idx,
      name: s.name,
      status: 'Hadir',
      note: '',
      isLocked: false
    };
  });

  const handleStatusChange = (id: string | number, status: string) => {
    const newRecords = students.map(s => s.id === id ? { ...s, status } : s);
    setAttendances(prev => ({
      ...prev,
      [attendanceKey]: newRecords
    }));
  };

  const handleNoteChange = (id: string | number, note: string) => {
    const newRecords = students.map(s => s.id === id ? { ...s, note } : s);
    setAttendances(prev => ({
      ...prev,
      [attendanceKey]: newRecords
    }));
  };

  const handleSaveAll = () => {
    const newRecords = students.map(s => ({ ...s, isLocked: true }));
    setAttendances(prev => ({
      ...prev,
      [attendanceKey]: newRecords
    }));
  };

  const handleUnlock = (id: string | number) => {
    const newRecords = students.map(s => s.id === id ? { ...s, isLocked: false } : s);
    setAttendances(prev => ({
      ...prev,
      [attendanceKey]: newRecords
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="w-full sm:w-auto flex items-center gap-3">
          <div className="bg-green-50 dark:bg-green-900/30 p-2.5 rounded-lg text-[#0f6c46]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tanggal Absensi</p>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-bold text-sm bg-transparent outline-none text-slate-800 dark:text-white" 
            />
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <SelectDropdown 
              value={selectedClass}
              onChange={setSelectedClass}
              options={classes.map(cls => ({ value: cls, label: cls }))}
              placeholder="Pilih Kelas"
            />
          </div>
          <button 
            onClick={handleSaveAll} 
            disabled={isHolidayDate || !selectedClass}
            className="bg-[#0f6c46] hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-[10px] px-5 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 shrink-0 h-[42px]"
          >
            <Save className="w-4 h-4" /> Simpan
          </button>
        </div>
      </div>
      
      {isHolidayDate ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-xl font-bold text-rose-700 dark:text-rose-400 mb-2">Hari Libur</h3>
          <p className="text-rose-600 dark:text-rose-300">
            {holidayName ? `Tanggal ini mencatat hari libur: ${holidayName}` : 'Tanggal ini adalah hari minggu.'}
            <br/>Absensi ditiadakan pada hari libur.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[680px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-[40px] text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4 min-w-[250px]">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    <p>{!selectedClass ? 'Pilih kelas terlebih dahulu' : 'Belum ada data siswa di kelas ini'}</p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{student.name}</td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                    {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((s) => (
                      <button 
                        key={s}
                        title={s}
                        disabled={student.isLocked}
                        onClick={() => handleStatusChange(student.id, s)}
                        className={`text-xs w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                          student.status === s 
                            ? (s === 'Hadir' ? 'bg-green-600 text-white shadow-sm' 
                                : s === 'Izin' ? 'bg-blue-600 text-white shadow-sm'
                                : s === 'Sakit' ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-rose-600 text-white shadow-sm')
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {s.charAt(0)}
                      </button>
                    ))}
                  </td>
                  <td className="py-3 px-4 min-w-[250px]">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={student.note} 
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        disabled={student.isLocked}
                        placeholder="Tambahkan keterangan..."
                        className="w-full min-w-[210px] flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none disabled:opacity-80 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400"
                      />
                      {student.isLocked ? (
                        <button 
                          onClick={() => handleUnlock(student.id)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors shrink-0"
                          title="Ubah Absensi"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-[28px] shrink-0"></div>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
