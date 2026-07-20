import { useState, useEffect } from 'react';
import { Save, Plus, Minus, Pencil } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';

export function NilaiView() {
  const { classes, subjects, semester, students: globalStudents, grades, setGrades, teacher } = useAppContext();
  const [selectedClass, setSelectedClass] = useState(classes[0] || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [jenisPenilaian, setJenisPenilaian] = useState('UH_1');
  const [uhCount, setUhCount] = useState(1);

  const gradeKey = `${selectedClass}_${selectedSubject}_${jenisPenilaian}`;
  const students = grades[gradeKey] || [];

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      const classStudents = globalStudents.filter(s => s.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());
      const currentGrades = grades[gradeKey];
      
      if (!currentGrades || currentGrades.length !== classStudents.length) {
        setGrades(prev => {
          // It's possible the state changed before this callback, so check again inside setter
          const current = prev[gradeKey] || [];
          if (current.length === classStudents.length) return prev;
          
          const newGrades = classStudents.map((s, idx) => {
            const existing = current.find(g => g.name === s.name);
            if (existing) {
              return { ...existing, id: idx };
            }
            return {
              id: idx,
              name: s.name,
              nilai: '',
              isLocked: false,
              sikap: 'B',
              karakter: 'B'
            };
          });
          
          return {
            ...prev,
            [gradeKey]: newGrades
          };
        });
      }
    }
  }, [selectedClass, selectedSubject, jenisPenilaian, globalStudents, grades, gradeKey, setGrades]);

  // Handle derived subjects based on selected class
  const availableSubjects = subjects.filter(s => 
    s.classes.some(c => c.trim().toLowerCase() === selectedClass.trim().toLowerCase())
  );

  useEffect(() => {
    // If selected subject is not in the new available subjects, reset it
    if (availableSubjects.length > 0 && !availableSubjects.find(s => s.id === selectedSubject)) {
      setSelectedSubject(availableSubjects[0].id);
    } else if (availableSubjects.length === 0) {
      setSelectedSubject('');
    }
  }, [selectedClass, availableSubjects, selectedSubject]);

  const uhOptions = Array.from({ length: uhCount }).map((_, i) => ({
    value: `UH_${i + 1}`, label: `UH ${i + 1}`
  }));

  const assessmentOptions = semester === 'Ganjil' 
    ? [
        ...uhOptions,
        { value: 'PTS_1', label: 'PTS 1 (Sumatif Tengah Semester 1)' },
        { value: 'SAS', label: 'SAS (Sumatif Akhir Semester 1)' },
      ]
    : [
        ...uhOptions,
        { value: 'PTS_2', label: 'PTS 2 (Sumatif Tengah Semester 2)' },
        { value: 'SAT', label: 'SAT (Sumatif Akhir Tahun)' },
      ];

  // Effect to reset jenisPenilaian if it's not valid for the current semester
  useEffect(() => {
    if (!assessmentOptions.find(o => o.value === jenisPenilaian)) {
      setJenisPenilaian('UH_1');
    }
  }, [semester, uhCount, assessmentOptions, jenisPenilaian]);

  const handleSaveAll = () => {
    setGrades(prev => ({
      ...prev,
      [gradeKey]: (prev[gradeKey] || []).map(s => s.nilai !== '' ? { ...s, isLocked: true } : s)
    }));
  };

  const handleUnlock = (id: number) => {
    setGrades(prev => ({
      ...prev,
      [gradeKey]: (prev[gradeKey] || []).map(s => s.id === id ? { ...s, isLocked: false } : s)
    }));
  };

  const handleNilaiChange = (id: number, val: string) => {
    setGrades(prev => ({
      ...prev,
      [gradeKey]: (prev[gradeKey] || []).map(s => s.id === id ? { ...s, nilai: val } : s)
    }));
  };

  const handleSikapChange = (id: number, val: string) => {
    setGrades(prev => ({
      ...prev,
      [gradeKey]: (prev[gradeKey] || []).map(s => s.id === id ? { ...s, sikap: val } : s)
    }));
  };

  const handleKarakterChange = (id: number, val: string) => {
    setGrades(prev => ({
      ...prev,
      [gradeKey]: (prev[gradeKey] || []).map(s => s.id === id ? { ...s, karakter: val } : s)
    }));
  };

  const getSpecificValue = (studentName: string, type: string, count?: number) => {
    const key = `${selectedClass}_${selectedSubject}_${type}${type === 'UH' ? `_${count}` : ''}`;
    const current = grades[key];
    if (current) {
      const student = current.find(s => s.name === studentName);
      return student ? student.nilai : '';
    }
    return '';
  };

  const handleSpecificNilaiChange = (studentIdx: number, type: string, count: number | undefined, val: string) => {
    const key = `${selectedClass}_${selectedSubject}_${type}${type === 'UH' ? `_${count}` : ''}`;
    setGrades(prev => {
      const classStudents = globalStudents.filter(s => s.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());
      const current = prev[key] || [];
      
      const newGrades = classStudents.map((s, idx) => {
        const existing = current.find(g => g.name === s.name);
        if (existing) {
          return { ...existing, id: idx };
        }
        return {
          id: idx,
          name: s.name,
          nilai: '',
          isLocked: false,
          sikap: 'B',
          karakter: 'B'
        };
      });
      
      return {
        ...prev,
        [key]: newGrades.map((s, idx) => idx === studentIdx ? { ...s, nilai: val } : s)
      };
    });
  };

  const desktopCols: Array<{ type: string; count?: number }> = [
    ...Array.from({ length: uhCount }).map((_, i) => ({ type: 'UH', count: i + 1 })),
    { type: semester === 'Ganjil' ? 'PTS_1' : 'PTS_2' },
    { type: semester === 'Ganjil' ? 'SAS' : 'SAT' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Input Penilaian</h2>
            <p className="text-sm text-slate-500">Masukkan nilai siswa</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto z-50">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none sm:w-32 min-w-0">
                <SelectDropdown 
                  placeholder="Pilih Kelas"
                  value={selectedClass}
                  onChange={setSelectedClass}
                  options={classes.map(cls => ({ value: cls, label: cls }))}
                />
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 sm:px-2 shrink-0 h-[42px]" title="Jumlah UH">
                <span className="text-sm font-semibold text-slate-500 ml-1 mr-1 inline-block">UH:</span>
                <div className="flex items-center">
                  <button 
                    onClick={() => setUhCount(Math.max(1, uhCount - 1))}
                    className="p-1 sm:p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
                    disabled={uhCount <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 sm:w-8 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {uhCount}
                  </span>
                  <button 
                    onClick={() => setUhCount(uhCount + 1)}
                    className="p-1 sm:p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {availableSubjects.length > 1 && (
              <div className="w-full sm:w-40">
                <SelectDropdown 
                  placeholder="Pilih Mapel"
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  options={availableSubjects.map(s => ({ value: s.id.toString(), label: s.name }))}
                />
              </div>
            )}
            <div className="w-full sm:w-56 flex gap-2 md:hidden">
              <div className="flex-1 min-w-0">
                <SelectDropdown 
                  placeholder="Jenis Penilaian"
                  value={jenisPenilaian}
                  onChange={setJenisPenilaian}
                  options={assessmentOptions}
                />
              </div>
            </div>
            <button onClick={handleSaveAll} className="bg-[#0f6c46] hover:bg-primary-700 text-white font-medium py-[10px] px-5 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 shrink-0 h-[42px]">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-center w-16">No</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Nama Siswa</th>
                {teacher.role === 'Wali Kelas' && (
                  <>
                    <th className="py-3 px-4 font-semibold min-w-[140px] text-center">Sikap</th>
                    <th className="py-3 px-4 font-semibold min-w-[140px] text-center">Karakter</th>
                  </>
                )}
                <th className="py-3 px-4 font-semibold min-w-[120px] w-32 text-center md:hidden">
                  Nilai {jenisPenilaian && `(${assessmentOptions.find(o => o.value === jenisPenilaian)?.label})`}
                </th>
                {desktopCols.map((col, idx) => (
                  <th key={idx} className="hidden md:table-cell py-3 px-2 font-semibold min-w-[100px] text-center">
                    {col.type === 'UH' ? `UH ${col.count}` : (col.type.startsWith('PTS') ? (semester === 'Ganjil' ? 'STS 1' : 'STS 2') : (semester === 'Ganjil' ? 'SAS' : 'SAT'))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={(teacher.role === 'Wali Kelas' ? 5 : 3) + desktopCols.length} className="py-8 text-center text-slate-500">
                    <p>Pilih kelas terlebih dahulu atau belum ada data siswa</p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{student.name}</td>
                  {teacher.role === 'Wali Kelas' && (
                    <>
                      <td className="py-3 px-4">
                        <SelectDropdown
                          value={student.sikap}
                          onChange={(val) => handleSikapChange(student.id, val)}
                          disabled={student.isLocked}
                          buttonClassName={`w-full min-h-[38px] text-xs font-semibold ${student.sikap === 'Sangat Baik' ? 'bg-green-50/50 border-green-200 text-green-700' :
                              student.sikap === 'Baik' ? 'bg-blue-50/50 border-blue-200 text-blue-700' :
                              student.sikap === 'Cukup' ? 'bg-orange-50/50 border-orange-200 text-orange-700' :
                              'bg-rose-50/50 border-rose-200 text-rose-700'
                            }`}
                          options={[
                            { value: 'Sangat Baik', label: 'Sangat Baik' },
                            { value: 'Baik', label: 'Baik' },
                            { value: 'Cukup', label: 'Cukup' },
                            { value: 'Kurang', label: 'Kurang' }
                          ]}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <SelectDropdown
                          value={student.karakter}
                          onChange={(val) => handleKarakterChange(student.id, val)}
                          disabled={student.isLocked}
                          buttonClassName={`w-full min-h-[38px] text-xs font-semibold ${student.karakter === 'Sangat Baik' ? 'bg-green-50/50 border-green-200 text-green-700' :
                              student.karakter === 'Baik' ? 'bg-blue-50/50 border-blue-200 text-blue-700' :
                              student.karakter === 'Cukup' ? 'bg-orange-50/50 border-orange-200 text-orange-700' :
                              'bg-rose-50/50 border-rose-200 text-rose-700'
                            }`}
                          options={[
                            { value: 'Sangat Baik', label: 'Sangat Baik' },
                            { value: 'Baik', label: 'Baik' },
                            { value: 'Cukup', label: 'Cukup' },
                            { value: 'Kurang', label: 'Kurang' }
                          ]}
                        />
                      </td>
                    </>
                  )}
                  <td className="py-3 px-4 md:hidden">
                    <div className="flex items-center gap-2 h-[42px]">
                       <input 
                         type="number" 
                         value={student.nilai}
                         onChange={(e) => handleNilaiChange(student.id, e.target.value)}
                         disabled={student.isLocked}
                         placeholder="-"
                         className="flex-1 min-w-0 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none text-center focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium disabled:opacity-80 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400"
                       />
                       {student.isLocked ? (
                         <button 
                           onClick={() => handleUnlock(student.id)}
                           className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors shrink-0"
                           title="Ubah Nilai"
                         >
                           <Pencil className="w-4 h-4" />
                         </button>
                       ) : (
                         <div className="w-8 shrink-0"></div>
                       )}
                     </div>
                   </td>
                   {desktopCols.map((col, cIdx) => {
                      const val = getSpecificValue(student.name, col.type, col.count);
                      return (
                        <td key={cIdx} className="hidden md:table-cell py-3 px-2">
                           <input 
                             type="number" 
                             value={val}
                             onChange={(e) => handleSpecificNilaiChange(idx, col.type, col.count, e.target.value)}
                             placeholder="-"
                             className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-sm outline-none text-center focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                           />
                        </td>
                      );
                    })}
                 </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
