import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Plus, Trash2, Save, X, BookOpen, GraduationCap, Calendar, Upload, Edit, LogOut, Shield, Download, ShieldAlert, Smartphone, Cloud, Link } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ConfirmModal } from './ui/ConfirmModal';
import { SelectDropdown } from './ui/SelectDropdown';
import { ViewState } from '../types';

interface ProfilViewProps {
  onChangeView?: (view: ViewState | 'admin') => void;
}

export function ProfilView({ onChangeView }: ProfilViewProps) {
  const { teacher, setTeacher, classes, setClasses, subjects, setSubjects, agendas, setAgendas, kopSurat, setKopSurat, user, userStatus, handleLogout, semester, setSemester, schoolType, setSchoolType, linkedSessionId, spreadsheetUrl, setSpreadsheetUrl, resetAllData } = useAppContext();
  const calFileInputRef = useRef<HTMLInputElement>(null);
  
  const [localSpreadsheetUrl, setLocalSpreadsheetUrl] = useState(spreadsheetUrl || '');

  useEffect(() => {
    setLocalSpreadsheetUrl(spreadsheetUrl || '');
  }, [spreadsheetUrl]);

  // Teacher Form State
  const [teacherName, setTeacherName] = useState(teacher.name);
  const [teacherRole, setTeacherRole] = useState(teacher.role);
  const [teacherSchool, setTeacherSchool] = useState(teacher.school);
  const [localSemester, setLocalSemester] = useState(semester);
  const [localSchoolType, setLocalSchoolType] = useState(schoolType);
  
  // Kop Surat State
  const [localKop, setLocalKop] = useState(kopSurat);

  // Classes State
  const [newClass, setNewClass] = useState('');

  // Subjects State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectKkm, setNewSubjectKkm] = useState('');
  const [newSubjectClasses, setNewSubjectClasses] = useState<string[]>([]);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [showResetLinkModal, setShowResetLinkModal] = useState(false);
  const [showResetAllModal, setShowResetAllModal] = useState(false);

  const handleSaveProfile = () => {
    setTeacher({
      name: teacherName,
      role: teacherRole,
      school: teacherSchool,
    });
    setSemester(localSemester);
    setSchoolType(localSchoolType);
    setKopSurat(localKop);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleCalendarExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        const getValue = (row: any, keys: string[]) => {
          for (const k of Object.keys(row)) {
            if (keys.some(key => key.toLowerCase() === k.toLowerCase())) {
              if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
                return String(row[k]);
              }
            }
          }
          return '';
        };
        
        setAgendas(prev => {
          const newAgendas = { ...prev };
          let count = 0;

          data.forEach((row) => {
            const dateStr = getValue(row, ['Tanggal', 'Date']);
            const title = getValue(row, ['Nama', 'NamaKegiatan', 'Agenda', 'Title', 'Kegiatan', 'Uraian']);
            const type = (getValue(row, ['Jenis', 'Type', 'Kategori']) || 'akademik').toLowerCase();

            if (dateStr && title) {
              // Excel dates can be numeric, let's assume yyyy-mm-dd or string for simplicity
              let formattedDate = dateStr;
              if (typeof row.Tanggal === 'number' || typeof row.tanggal === 'number') {
                const excelDate = new Date((row.Tanggal - (25567 + 2)) * 86400 * 1000);
                formattedDate = excelDate.toISOString().split('T')[0];
              } else {
                // Try to parse simple dd/mm/yyyy or yyyy-mm-dd
                if (formattedDate.includes('/')) {
                  const parts = formattedDate.split('/');
                  if (parts.length === 3) {
                    // d/m/y to y.m.d
                    if (parts[2].length === 4) {
                      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    }
                  }
                }
              }

              if (!newAgendas[formattedDate]) {
                newAgendas[formattedDate] = [];
              }
              
              // Check for exact duplicate
              const isDuplicate = newAgendas[formattedDate].some(a => a.title === title && a.type === type);
              if (!isDuplicate) {
                newAgendas[formattedDate].push({ title, type });
                count++;
              }
            }
          });

          setTimeout(() => alert(`${count} agenda kalender baru berhasil diimpor!`), 100);
          return newAgendas;
        });
      } catch (error) {
        alert('Gagal mengimpor file excel kalender. Pastikan formatnya benar (Kolom: Tanggal, Nama, Jenis).');
        console.error(error);
      }
      if (calFileInputRef.current) calFileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Tanggal: '2026-07-15', Nama: 'Rapat Awal Tahun Ajaran', Jenis: 'akademik' },
      { Tanggal: '2026-08-17', Nama: 'Upacara Kemerdekaan RI', Jenis: 'libur' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kalender");
    XLSX.writeFile(wb, "Template_Kalender_Akademik.xlsx");
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass) return;
    if (!classes.includes(newClass)) {
      setClasses([...classes, newClass]);
    }
    setNewClass('');
  };

  const handleDeleteClass = (cls: string) => {
    setClassToDelete(cls);
  };

  const handleToggleNewSubjectClass = (cls: string) => {
    setNewSubjectClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectKkm) return;
    if (newSubjectClasses.length === 0) {
      alert("Pilih minimal 1 kelas untuk mapel ini");
      return;
    }
    
    if (editSubjectId) {
      setSubjects(subjects.map(s => 
        s.id === editSubjectId 
          ? { id: editSubjectId, name: newSubjectName, kkm: parseInt(newSubjectKkm, 10), classes: newSubjectClasses }
          : s
      ));
      setEditSubjectId(null);
    } else {
      const newSubj = {
        id: Date.now().toString(),
        name: newSubjectName,
        kkm: parseInt(newSubjectKkm, 10),
        classes: newSubjectClasses
      };
      setSubjects([...subjects, newSubj]);
    }
    setNewSubjectName('');
    setNewSubjectKkm('');
    setNewSubjectClasses([]);
  };

  const handleEditSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      setNewSubjectName(subject.name);
      setNewSubjectKkm(subject.kkm.toString());
      setNewSubjectClasses(subject.classes);
      setEditSubjectId(subject.id);
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjectToDelete(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-8">
      <ConfirmModal
        isOpen={classToDelete !== null}
        title="Hapus Kelas"
        message={`Apakah Anda yakin ingin menghapus kelas ${classToDelete}?`}
        onConfirm={() => {
          if (classToDelete) {
            setClasses(classes.filter(c => c !== classToDelete));
            setClassToDelete(null);
          }
        }}
        onCancel={() => setClassToDelete(null)}
      />

      <ConfirmModal
        isOpen={subjectToDelete !== null}
        title="Hapus Mata Pelajaran"
        message="Apakah Anda yakin ingin menghapus mata pelajaran ini?"
        onConfirm={() => {
          if (subjectToDelete) {
            setSubjects(subjects.filter(s => s.id !== subjectToDelete));
            setSubjectToDelete(null);
          }
        }}
        onCancel={() => setSubjectToDelete(null)}
      />

      <ConfirmModal
        isOpen={showResetLinkModal}
        title="Hapus Link & Reset Database"
        message="Apakah Anda yakin ingin menghapus link dan mengosongkan semua data spreadsheet dari aplikasi? Data di aplikasi akan direset, tetapi file di Google Drive/Spreadsheet tidak akan terhapus."
        onConfirm={async () => {
          setLocalSpreadsheetUrl('');
          await setSpreadsheetUrl(null);
          setShowResetLinkModal(false);
          alert('Link dan data spreadsheet telah dihapus.');
        }}
        onCancel={() => setShowResetLinkModal(false)}
      />

      <ConfirmModal
        isOpen={showResetAllModal}
        title="RESET TOTAL SELURUH DATA"
        message="PERINGATAN: Tindakan ini akan mengosongkan seluruh data Anda (data guru, kelas, mata pelajaran, siswa, nilai, kehadiran, jadwal, jurnal) baik di aplikasi, backup cloud (Firebase/Firestore), dan mengosongkan file Google Spreadsheet Anda agar kembali bersih dari awal. Apakah Anda yakin ingin melanjutkan?"
        onConfirm={async () => {
          try {
            await resetAllData();
            setLocalSpreadsheetUrl('');
            setShowResetAllModal(false);
            alert('Sukses! Seluruh data Anda telah dikosongkan dan direset.');
          } catch (e: any) {
            alert('Gagal melakukan reset data: ' + e.message);
          }
        }}
        onCancel={() => setShowResetAllModal(false)}
      />

      {/* Developer Info Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center mb-6">
        <p className="text-xs font-medium text-slate-500 mb-1">Dikembangkan oleh</p>
        <p className="text-lg font-bold tracking-wide text-slate-800 dark:text-white">PT. Al-Fatih Digital Learning</p>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white truncate">{user?.displayName || 'User'}</h2>
              {user?.email && <p className="text-sm text-slate-500 truncate">{user.email}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {userStatus === 'admin' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium"><Shield className="w-3 h-3"/> Admin Account</span>
                )}
                {linkedSessionId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/30">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Taut & Sinkron Real-Time ({linkedSessionId})
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {userStatus === 'admin' && (
              <button 
                onClick={() => onChangeView?.('admin')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 py-2.5 px-6 rounded-xl font-medium transition-colors"
              >
                  <ShieldAlert className="w-4 h-4" /> Masuk Panel Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 py-2.5 px-6 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Keluar Akun
            </button>
          </div>
        </div>
      </div>

      {/* Integration Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-in fade-in duration-300">
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-500">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800 dark:text-white">Autofill Google Spreadsheet</h2>
                  <p className="text-sm text-slate-500 max-w-xl">Tempelkan link Ekstensi / Google Spreadsheet Web App Anda di bawah ini secara manual.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Link className="w-4 h-4 text-slate-400" /> Link Spreadsheet Pilihan
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/..."
                  value={localSpreadsheetUrl}
                  onChange={(e) => setLocalSpreadsheetUrl(e.target.value)}
                  className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all dark:text-white"
                />
                <button
                  onClick={async () => {
                    const trimmed = localSpreadsheetUrl.trim();
                    if (trimmed && (!trimmed.startsWith('https://script.google.com/') || !trimmed.includes('/exec'))) {
                      alert('Error: URL Apps Script tidak valid!\nPastikan Anda menyalin URL Web App yang diakhiri dengan /exec, BUKAN link editor.');
                      return;
                    }
                    try {
                      if (trimmed) {
                        const res = await fetch(trimmed, { 
                          method: 'POST', 
                          body: JSON.stringify({ action: 'read' }),
                          redirect: 'follow'
                        });
                        if (!res.ok) {
                          alert(`Gagal mengakses Apps Script.\nPastikan pengaturan deploy Web App adalah:\n"Execute as: Me"\n"Who has access: Anyone" (Siapa saja)`);
                          return;
                        }
                      }
                      await setSpreadsheetUrl(trimmed);
                      alert('Link Spreadsheet disinkronkan / disimpan!');
                    } catch (e: any) {
                      alert(`Error mengakses Apps Script (Gagal tersambung).\n\nKemungkinan penyebab:\n1. Salah link (Harus diakhiri /exec)\n2. Deployment Apps Script belum di-set "Who has access: Anyone"\n\nDetail: ${e.message}`);
                    }
                  }}
                  disabled={localSpreadsheetUrl === spreadsheetUrl}
                  className="bg-slate-800 disabled:opacity-50 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center whitespace-nowrap"
                >
                  Simpan Link
                </button>
                <button
                  onClick={() => setShowResetLinkModal(true)}
                  disabled={!spreadsheetUrl && !localSpreadsheetUrl}
                  className="bg-red-50 disabled:opacity-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Profile Data */}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Data Guru</h2>
            <p className="text-sm text-slate-500">Ubah data informasi anda</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              value={teacherName}
              onChange={e => setTeacherName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jabatan</label>
              <SelectDropdown
                value={teacherRole}
                onChange={setTeacherRole}
                options={[
                  { value: "Guru Bidang", label: "Guru Bidang" },
                  { value: "Wali Kelas", label: "Wali Kelas" }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Sekolah</label>
              <input 
                type="text" 
                value={teacherSchool}
                onChange={e => setTeacherSchool(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester Saat Ini</label>
              <SelectDropdown
                value={localSemester}
                onChange={val => setLocalSemester(val as 'Ganjil' | 'Genap')}
                options={[
                  { value: "Ganjil", label: "Semester Ganjil" },
                  { value: "Genap", label: "Semester Genap" }
                ]}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Sekolah (Hari Kerja)</label>
              <SelectDropdown
                value={localSchoolType}
                onChange={setLocalSchoolType}
                options={[
                  { value: "5 Hari (Senin - Jumat)", label: "5 Hari (Senin - Jumat)" },
                  { value: "6 Hari (Senin - Sabtu)", label: "6 Hari (Senin - Sabtu)" }
                ]}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveProfile} className="bg-[#0f6c46] hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>

      {/* Kop Surat Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Pengaturan Kop Surat</h2>
            <p className="text-sm text-slate-500">Kop surat yang akan muncul di setiap laporan</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Header 1 (Cth: PEMERINTAH...)</label>
              <input 
                type="text" 
                value={localKop.header1}
                onChange={e => setLocalKop({...localKop, header1: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Header 2 (Cth: DINAS...)</label>
              <input 
                type="text" 
                value={localKop.header2}
                onChange={e => setLocalKop({...localKop, header2: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-sm" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Sekolah</label>
            <input 
              type="text" 
              value={localKop.namaSekolah}
              onChange={e => setLocalKop({...localKop, namaSekolah: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-sm font-bold" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap</label>
            <input 
              type="text" 
              value={localKop.alamat}
              onChange={e => setLocalKop({...localKop, alamat: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website / Email Lengkap</label>
            <input 
              type="text" 
              value={localKop.websiteEmail}
              onChange={e => setLocalKop({...localKop, websiteEmail: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo Kop Surat (Link URL - Opsional)</label>
            <input 
              type="text" 
              placeholder="https://..."
              value={localKop.logoUrl || ''}
              onChange={e => setLocalKop({...localKop, logoUrl: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-sm" 
            />
            <p className="text-xs text-slate-500 mt-1">
              Tempelkan link gambar logo (URL yang diakhiri .png/.jpg atau link Google Drive yang sudah di-share publik). Agar tidak memakan memori lokal/browser, logo cukup menggunakan link.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveProfile} className="bg-[#0f6c46] hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Simpan Kop Surat
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classes Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-[#0f6c46] dark:text-primary-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">Data Kelas</h2>
              <p className="text-sm text-slate-500">Kelas yang anda ajar</p>
            </div>
          </div>

          <form onSubmit={handleAddClass} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newClass}
              onChange={e => setNewClass(e.target.value)}
              placeholder="Cth: 6A"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900" 
            />
            <button type="submit" className="bg-[#0f6c46] hover:bg-primary-700 text-white rounded-xl px-3 py-2.5 shadow-sm transition-colors flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            <div className="space-y-2">
              {classes.map((cls, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{cls}</span>
                  <button onClick={() => handleDeleteClass(cls)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">Belum ada kelas yang ditambahkan</div>
              )}
            </div>
          </div>
        </div>

        {/* Subjects Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">Mata Pelajaran</h2>
              <p className="text-sm text-slate-500">Mapel dan standar KKM</p>
            </div>
          </div>

          <form onSubmit={handleAddSubject} className="flex flex-col gap-3 mb-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="Nama Mapel"
                className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900" 
              />
              <input 
                type="number" 
                value={newSubjectKkm}
                onChange={e => setNewSubjectKkm(e.target.value)}
                placeholder="KKM"
                className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 text-center" 
              />
              <button type="submit" className="bg-[#0f6c46] hover:bg-primary-700 text-white rounded-xl px-3 py-2.5 shadow-sm transition-colors flex items-center justify-center shrink-0">
                {editSubjectId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              {editSubjectId && (
                <button type="button" onClick={() => {
                  setEditSubjectId(null);
                  setNewSubjectName('');
                  setNewSubjectKkm('');
                  setNewSubjectClasses([]);
                }} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 shadow-sm transition-colors flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {classes.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 mb-2">Pilih Kelas yang Diajar Mapel Ini:</p>
                <div className="flex flex-wrap gap-2">
                  {classes.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleToggleNewSubjectClass(cls)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        newSubjectClasses.includes(cls)
                          ? 'bg-[#0f6c46] border-[#0f6c46] text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            <div className="space-y-2">
              {subjects.map((subj) => (
                <div key={subj.id} className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${editSubjectId === subj.id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{subj.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500">KKM: <span className="font-bold">{subj.kkm}</span></p>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <p className="text-xs text-slate-500 truncate">
                        Kelas: <span className="font-medium text-slate-600 dark:text-slate-400">{subj.classes.join(', ')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center ml-2 shrink-0">
                    <button onClick={() => handleEditSubject(subj.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSubject(subj.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">Belum ada mapel yang ditambahkan</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Kalender Akademik</h2>
            <p className="text-sm text-slate-500">Import agenda kalender dari file Excel</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={calFileInputRef}
            onChange={handleCalendarExcelUpload}
          />
          <button 
            onClick={handleDownloadTemplate}
            className="w-full sm:w-auto bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
          >
            <Download className="w-4 h-4" /> Unduh Template
          </button>
          <button 
            onClick={() => calFileInputRef.current?.click()}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
          >
            <Upload className="w-4 h-4" /> Import Excel Kalender
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-rose-950/10 rounded-2xl shadow-sm border border-red-100 dark:border-rose-900/30 p-6 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-rose-950 flex items-center justify-center text-red-600 dark:text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-red-800 dark:text-rose-400">Zona Bahaya (Danger Zone)</h2>
            <p className="text-sm text-red-600/80 dark:text-rose-400/70">
              Gunakan opsi ini jika Anda ingin membersihkan dan mengosongkan seluruh database Anda secara permanen dari server dan Google Spreadsheet untuk memulai ulang dari awal.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowResetAllModal(true)}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Kosongkan & Reset Total Seluruh Data
          </button>
        </div>
      </div>
    </div>
  );
}
