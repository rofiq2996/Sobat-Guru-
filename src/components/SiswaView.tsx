import { Search, Plus, Edit, Trash2, X, Upload, Download } from 'lucide-react';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';
import { ConfirmModal } from './ui/ConfirmModal';

export function SiswaView() {
  const { classes, students, setStudents } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', class: '', gender: 'L' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.class.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.class) return;
    
    const studentToSave = { ...newStudent };
    if (!studentToSave.id) {
      studentToSave.id = 'SIS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    if (editIndex !== null) {
      const updated = [...students];
      updated[editIndex] = studentToSave;
      setStudents(updated);
    } else {
      setStudents([...students, studentToSave]);
    }
    setIsModalOpen(false);
    setNewStudent({ id: '', name: '', class: '', gender: 'L' });
    setEditIndex(null);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { raw: false });
        
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

        const importedStudents = data.map((row) => {
          const name = getValue(row, ['Nama', 'name', 'Nama Siswa']);
          const className = getValue(row, ['Kelas', 'class', 'Rombel']);
          const gender = getValue(row, ['L/P', 'Laki/Perempuan', 'Gender', 'Jenis Kelamin', 'JK']) || 'L';
          
          const id = 'TMP-' + Math.random().toString(36).substr(2, 6).toUpperCase();

          return { id, name, class: className, gender };
        }).filter((s) => s.id && s.name);

        setStudents(prev => {
          const newStudents = [...prev];
          let addedCount = 0;
          
          importedStudents.forEach(imp => {
            if (!newStudents.some(s => s.id === imp.id)) {
              newStudents.push(imp);
              addedCount++;
            }
          });
          
          setTimeout(() => alert(`${addedCount} data siswa baru berhasil diimpor!`), 100);
          return newStudents;
        });
      } catch (error) {
        alert('Gagal mengimpor file excel. Pastikan formatnya benar (Kolom: Nama, Kelas, L/P).');
        console.error(error);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Nama Siswa': 'Andi Sulaiman', Kelas: 'X IPA 1', 'L/P': 'L' },
      { 'Nama Siswa': 'Budi Santoso', Kelas: 'X IPA 1', 'L/P': 'L' },
      { 'Nama Siswa': 'Citra Kirana', Kelas: 'X IPA 1', 'L/P': 'P' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Format_Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  const handleEdit = (index: number) => {
    setNewStudent(students[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    setItemToDelete(index);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full max-w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden w-full max-w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="relative w-full md:w-56 lg:w-72 shrink-0">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau kelas..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-shadow focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900" 
            />
          </div>
          <div className="flex flex-nowrap justify-start md:justify-end gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button 
              onClick={downloadTemplate}
              className="flex-none bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium py-2.5 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
              title="Unduh format template excel"
            >
              <Download className="w-4 h-4" /> <span className="hidden lg:inline">Unduh Template</span>
            </button>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleExcelUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
              title="Import Excel"
            >
              <Upload className="w-4 h-4" /> <span className="hidden lg:inline">Import Excel</span>
            </button>
            <button 
              onClick={() => {
                setNewStudent({ id: '', name: '', class: '', gender: 'L' });
                setEditIndex(null);
                setIsModalOpen(true);
              }}
              className="flex-none bg-[#0f6c46] hover:bg-primary-700 text-white font-medium py-2.5 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Tambah Siswa
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-5">Nama Siswa</th>
                <th className="py-3 px-5 text-center">Kelas</th>
                <th className="py-3 px-5 text-center">L/P</th>
                <th className="py-3 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredStudents.map((student, idx) => {
                // Find original index to pass to handleEdit or delete safely
                const originalIndex = students.findIndex(s => s.id === student.id);
                return (
                  <tr key={student.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-800 dark:text-slate-200">{student.name}</td>
                    <td className="py-3 px-5 text-center">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300">
                        {student.class}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">{student.gender}</td>
                    <td className="py-3 px-5 text-right flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(originalIndex !== -1 ? originalIndex : idx)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(originalIndex !== -1 ? originalIndex : idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Hapus Data Siswa"
        message="Apakah Anda yakin ingin menghapus data siswa ini?"
        onConfirm={() => {
          if (itemToDelete !== null) {
            setStudents(students.filter((_, i) => i !== itemToDelete));
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-20">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editIndex !== null ? 'Edit Data Siswa' : 'Tambah Data Siswa'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="flex flex-col">
              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={newStudent.name}
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" 
                    placeholder="Masukkan Nama Lengkap"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kelas</label>
                    <SelectDropdown
                      placeholder="Pilih Kelas"
                      value={newStudent.class}
                      onChange={val => setNewStudent({...newStudent, class: val})}
                      options={classes.map(cls => ({ value: cls, label: cls }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                    <SelectDropdown
                      value={newStudent.gender}
                      onChange={val => setNewStudent({...newStudent, gender: val})}
                      options={[
                        { value: 'L', label: 'Laki-laki (L)' },
                        { value: 'P', label: 'Perempuan (P)' }
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 px-4 bg-[#0f6c46] hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
