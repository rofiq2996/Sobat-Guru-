import { useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { DatePicker } from './ui/DatePicker';
import { ConfirmModal } from './ui/ConfirmModal';
import { SelectDropdown } from './ui/SelectDropdown';
import { useAppContext } from '../context/AppContext';

export function CatatanView() {
  const { students, catatan, setCatatan } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [newRecord, setNewRecord] = useState({ date: today, name: '', issue: '', action: '', status: 'Proses' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const studentSuggestions = students.map(s => ({ name: s.name, class: s.class }));

  const handleSave = () => {
    if (!newRecord.date || !newRecord.name) return;
    
    if (editingId) {
      setCatatan(catatan.map(r => r.id === editingId ? { ...newRecord, id: editingId } : r));
    } else {
      setCatatan([{ id: Date.now(), ...newRecord }, ...catatan]);
    }
    
    setNewRecord({ date: today, name: '', issue: '', action: '', status: 'Proses' });
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleEdit = (rec: any) => {
    setNewRecord(rec);
    setEditingId(rec.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 overflow-hidden w-full max-w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Catatan Siswa</h2>
          <p className="text-sm text-slate-500">Rekap kasus dan tindak lanjut siswa</p>
        </div>
        <button 
          onClick={() => {
            setNewRecord({ date: today, name: '', issue: '', action: '', status: 'Proses' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full max-w-full relative">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold w-32">Tanggal</th>
                <th className="py-3 px-4 font-semibold w-1/4">Nama Siswa</th>
                <th className="py-3 px-4 font-semibold">Kasus</th>
                <th className="py-3 px-4 font-semibold">Tindak Lanjut</th>
                <th className="py-3 px-4 font-semibold w-32">Status</th>
                <th className="py-3 px-4 font-semibold w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {catatan.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rec.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{rec.name}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{rec.issue}</td>
                  <td className="py-3 px-4 text-slate-500">{rec.action}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      rec.status === 'Selesai' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(rec)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="Edit Catatan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(rec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan ini?"
        onConfirm={() => {
          if (itemToDelete !== null) {
            setCatatan(catatan.filter(r => r.id !== itemToDelete));
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-20">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingId ? 'Edit Catatan Siswa' : 'Tambah Catatan Siswa'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                <DatePicker 
                  value={newRecord.date}
                  onChange={val => setNewRecord({...newRecord, date: val})}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Siswa</label>
                <input 
                  type="text" 
                  value={newRecord.name}
                  onChange={e => {
                    setNewRecord({...newRecord, name: e.target.value});
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Masukkan nama siswa" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-rose-500 focus:border-rose-500 dark:focus:ring-rose-500 dark:focus:border-rose-500" 
                />
                
                {showSuggestions && (
                  <div className="absolute z-[70] w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mt-1 rounded-xl shadow-lg max-h-40 overflow-y-auto no-scrollbar overflow-hidden">
                    {studentSuggestions.filter(s => `${s.name} - ${s.class}`.toLowerCase().includes(newRecord.name.toLowerCase())).map(s => (
                      <button
                        key={s.name}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                        onClick={() => {
                          setNewRecord({...newRecord, name: `${s.name} - ${s.class}`});
                          setShowSuggestions(false);
                        }}
                      >
                        {s.name} - {s.class}
                      </button>
                    ))}
                    {studentSuggestions.filter(s => `${s.name} - ${s.class}`.toLowerCase().includes(newRecord.name.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        Siswa tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kasus / Masalah</label>
                <input 
                  type="text" 
                  value={newRecord.issue}
                  onChange={e => setNewRecord({...newRecord, issue: e.target.value})}
                  placeholder="Deskripsikan kasus atau masalah" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-rose-500 focus:border-rose-500 dark:focus:ring-rose-500 dark:focus:border-rose-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tindak Lanjut</label>
                <input 
                  type="text" 
                  value={newRecord.action}
                  onChange={e => setNewRecord({...newRecord, action: e.target.value})}
                  placeholder="Keterangan tindak lanjut" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-rose-500 focus:border-rose-500 dark:focus:ring-rose-500 dark:focus:border-rose-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status Penanganan</label>
                <SelectDropdown
                  value={newRecord.status}
                  onChange={val => setNewRecord({...newRecord, status: val})}
                  options={[
                    { value: 'Proses', label: 'Sedang Diproses' },
                    { value: 'Selesai', label: 'Sudah Selesai' }
                  ]}
                />
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
