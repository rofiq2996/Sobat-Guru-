import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';
import { CheckCircle2, XCircle } from 'lucide-react';

export function AnalisisView() {
  const { classes, subjects, students: globalStudents, grades, attendances } = useAppContext();
  const [selectedClass, setSelectedClass] = useState((classes && classes[0]) || '');
  const [selectedSubject, setSelectedSubject] = useState('');

  const classStudents = (globalStudents || []).filter(s => s?.class?.trim().toLowerCase() === selectedClass?.trim().toLowerCase());
  const availableSubjects = (subjects || []).filter(s => s?.classes?.includes(selectedClass));

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.find(s => s.id === selectedSubject)) {
      setSelectedSubject(availableSubjects[0].id);
    } else if (availableSubjects.length === 0) {
      setSelectedSubject('');
    }
  }, [selectedClass, availableSubjects, selectedSubject]);

  const activeSubjectData = availableSubjects.find(s => s.id === selectedSubject);
  const kkm = activeSubjectData?.kkm || 75;

  const gradeKeyUH = `${selectedClass}_${selectedSubject}_UH_1`;
  const gradeKeyPTS = `${selectedClass}_${selectedSubject}_PTS_1`;
  const gradeKeySAS = `${selectedClass}_${selectedSubject}_SAS`;

  const safeGrades = grades || {};
  const uhGrades = Array.isArray(safeGrades[gradeKeyUH]) ? safeGrades[gradeKeyUH] : [];
  const ptsGrades = Array.isArray(safeGrades[gradeKeyPTS]) ? safeGrades[gradeKeyPTS] : [];
  const sasGrades = Array.isArray(safeGrades[gradeKeySAS]) ? safeGrades[gradeKeySAS] : [];

  const analysisData = classStudents.map((student, idx) => {
    const uhRecord = uhGrades.find(g => g.name === student.name);
    const ptsRecord = ptsGrades.find(g => g.name === student.name);
    const sasRecord = sasGrades.find(g => g.name === student.name);
    
    const scoreUh = parseInt(uhRecord?.nilai || "0") || 0;
    const scorePts = parseInt(ptsRecord?.nilai || "0") || 0;
    const scoreSas = parseInt(sasRecord?.nilai || "0") || 0;
    const subjectScore = Math.round((scoreUh + scorePts + scoreSas) / 3) || 0;
    const isTargetReached = subjectScore >= kkm;
    const conclusion = isTargetReached ? 'Tuntas' : 'Perlu Bimbingan';

    // Calculate kehadiran
    let hadirCount = 0;
    let totalSessions = 0;
    if (attendances) {
      Object.keys(attendances).forEach(key => {
        if (key.startsWith(`${selectedClass}_`) && Array.isArray(attendances[key])) {
          totalSessions++;
          const record = attendances[key].find(s => s?.name === student?.name);
          if (record && record.status === 'Hadir') {
            hadirCount++;
          }
        }
      });
    }
    const kehadiran = totalSessions === 0 ? 100 : Math.round((hadirCount / totalSessions) * 100);

    return {
      ...student,
      nilaiAkhir: subjectScore,
      isTargetReached,
      conclusion,
      kehadiran
    };
  });

  const totalTuntas = analysisData.filter(d => d.isTargetReached).length;
  const persentaseTuntas = analysisData.length > 0 ? Math.round((totalTuntas / analysisData.length) * 100) : 0;
  const rataRataKelas = analysisData.length > 0 ? Math.round(analysisData.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / analysisData.length) : 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 overflow-hidden w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analisis Hasil Belajar</h2>
          <p className="text-sm text-slate-500">Analisis pencapaian siswa per kelas</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-32">
            <SelectDropdown 
              value={selectedClass}
              onChange={setSelectedClass}
              options={(classes || []).map((cls) => ({ value: cls, label: cls }))}
            />
          </div>
          {availableSubjects.length > 0 && (
            <div className="w-full sm:w-48">
              <SelectDropdown 
                value={selectedSubject}
                onChange={setSelectedSubject}
                options={availableSubjects.map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex sm:block items-center justify-between">
          <p className="text-sm text-slate-500 sm:mb-1">Rata-rata Kelas</p>
          <p className="text-xl sm:text-3xl font-bold text-[#0f6c46] dark:text-primary-400">{rataRataKelas}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex sm:block items-center justify-between">
          <p className="text-sm text-slate-500 sm:mb-1">Target KKM</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kkm}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex sm:block items-center justify-between">
          <p className="text-sm text-slate-500 sm:mb-1">Ketuntasan Klasikal</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white">{persentaseTuntas}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full max-w-full relative">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                <th className="px-6 py-4 font-semibold text-center">Kehadiran</th>
                <th className="px-6 py-4 font-semibold text-center">Nilai Akhir</th>
                <th className="px-6 py-4 font-semibold text-center">Mencapai Target</th>
                <th className="px-6 py-4 font-semibold">Kesimpulan</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                    Tidak ada siswa di kelas ini
                  </td>
                </tr>
              ) : (
                analysisData.map((student, idx) => (
                  <tr key={student.id || idx} className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${idx === analysisData.length - 1 ? 'border-none' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.kehadiran >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        student.kehadiran >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {student.kehadiran}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {student.nilaiAkhir}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {student.isTargetReached ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        student.isTargetReached ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {student.conclusion}
                      </span>
                    </td>
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
