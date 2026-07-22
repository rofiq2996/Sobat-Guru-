import { useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { DatePicker } from './ui/DatePicker';
import { ConfirmModal } from './ui/ConfirmModal';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';

export function JurnalView() {
  const { classes, subjects, jurnals, setJurnals, touchActivity } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [newJurnal, setNewJurnal] = useState({ date: today, class: '', mapel: '', topic: '', notes: '' });

  const handleSave = () => {
    if (!newJurnal.date || !newJurnal.topic || !newJurnal.class || !newJurnal.mapel) return;
    
    if (editingId) {
      setJurnals(jurnals.map(j => j.id === editingId ? { ...newJurnal, id: editingId, updatedAt: Date.now() } : j));
      touchActivity(`jurnal-${editingId}`);
    } else {
      const newId = Date.now();
      setJurnals([{ id: newId, ...newJurnal, updatedAt: newId }, ...jurnals]);
      touchActivity(`jurnal-${newId}`);
    }
    
    setNewJurnal({ date: today, class: '', mapel: '', topic: '', notes: '' });
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleEdit = (rec: any) => {
    setNewJurnal(rec);
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
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Jurnal Kelas</h2>
          <p className="text-sm text-slate-500">Rekap kegiatan belajar mengajar</p>
        </div>
        <button 
          onClick={() => {
            setNewJurnal({ date: today, class: '', mapel: '', topic: '', notes: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-[#0f6c46] hover:bg-primary-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full max-w-full relative">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold w-32 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4 font-semibold w-24 whitespace-nowrap">Kelas</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Mata Pelajaran</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Materi / Topik</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Kegiatan/Catatan</th>
                <th className="py-3 px-4 font-semibold w-24 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {jurnals.map((jurnal) => (
                <tr key={jurnal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{jurnal.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{jurnal.class}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{jurnal.mapel}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{jurnal.topic}</td>
                  <td className="py-3 px-4 text-slate-500">{jurnal.notes}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(jurnal)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="Edit Jurnal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(jurnal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Hapus Jurnal"
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
        title="Hapus Jurnal"
        message="Apakah Anda yakin ingin menghapus jurnal ini?"
        onConfirm={() => {
          if (itemToDelete !== null) {
            setJurnals(jurnals.filter(j => j.id !== itemToDelete));
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-20">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingId ? 'Edit Jurnal Mengajar' : 'Tambah Jurnal Mengajar'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col">
              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <DatePicker 
                    value={newJurnal.date}
                    onChange={val => setNewJurnal({...newJurnal, date: val})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kelas</label>
                  <SelectDropdown
                    placeholder="Pilih Kelas"
                    value={newJurnal.class}
                    onChange={val => setNewJurnal({...newJurnal, class: val})}
                    options={classes.map(c => ({ value: c, label: c }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Pelajaran</label>
                  <SelectDropdown
                    placeholder="Pilih Mapel"
                    value={newJurnal.mapel}
                    onChange={val => setNewJurnal({...newJurnal, mapel: val})}
                    options={subjects.map(s => ({ value: s.name, label: s.name }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Materi / Topik</label>
                  <input 
                    type="text" 
                    value={newJurnal.topic}
                    onChange={e => setNewJurnal({...newJurnal, topic: e.target.value})}
                    placeholder="Masukkan materi / topik" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kegiatan / Catatan</label>
                  <textarea 
                    value={newJurnal.notes}
                    onChange={e => setNewJurnal({...newJurnal, notes: e.target.value})}
                    placeholder="Masukkan kegiatan / catatan" 
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none" 
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
                  className="flex-1 py-2.5 px-4 bg-[#0f6c46] hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
                >
                  Simpan Jurnal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
