import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';
import { TimeScrollPicker } from './ui/TimeScrollPicker';
import { ConfirmModal } from './ui/ConfirmModal';

export function JadwalView() {
  const { classes, subjects, schoolType, jadwals: jadwalList, setJadwals: setJadwalList } = useAppContext();
  
  const [filterHari, setFilterHari] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJadwal, setNewJadwal] = useState({ hari: 'Senin', waktuMulai: '', waktuSelesai: '', kelas: '', mapel: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const filteredJadwal = filterHari === 'Semua' ? jadwalList : jadwalList.filter(j => j.hari === filterHari);

  const daysOptions = [
    { value: 'Senin', label: 'Senin' },
    { value: 'Selasa', label: 'Selasa' },
    { value: 'Rabu', label: 'Rabu' },
    { value: 'Kamis', label: 'Kamis' },
    { value: 'Jumat', label: 'Jumat' },
  ];
  if (schoolType === '6 Hari (Senin - Sabtu)') {
    daysOptions.push({ value: 'Sabtu', label: 'Sabtu' });
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJadwal.waktuMulai || !newJadwal.waktuSelesai || !newJadwal.kelas || !newJadwal.mapel) return;
    const waktu = `${newJadwal.waktuMulai} - ${newJadwal.waktuSelesai}`;
    
    if (editId !== null) {
      setJadwalList(jadwalList.map(j => j.id === editId ? { id: editId, hari: newJadwal.hari, waktu, kelas: newJadwal.kelas, mapel: newJadwal.mapel } : j));
    } else {
      setJadwalList([...jadwalList, { id: Date.now(), hari: newJadwal.hari, waktu, kelas: newJadwal.kelas, mapel: newJadwal.mapel }]);
    }
    setIsModalOpen(false);
    setNewJadwal({ hari: 'Senin', waktuMulai: '', waktuSelesai: '', kelas: '', mapel: '' });
    setEditId(null);
  };

  const handleEdit = (id: number) => {
    const jadwal = jadwalList.find(j => j.id === id);
    if (jadwal) {
      const [waktuMulai, waktuSelesai] = jadwal.waktu.split(' - ');
      setNewJadwal({
        hari: jadwal.hari,
        waktuMulai,
        waktuSelesai,
        kelas: jadwal.kelas,
        mapel: jadwal.mapel
      });
      setEditId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-semibold text-slate-500 shrink-0">Filter Hari:</span>
            <div className="w-full sm:w-40">
              <SelectDropdown
                value={filterHari}
                onChange={setFilterHari}
                options={[
                  { value: 'Semua', label: 'Semua Hari' },
                  ...daysOptions
                ]}
              />
            </div>
          </div>
          <button 
            onClick={() => {
              setNewJadwal({ hari: 'Senin', waktuMulai: '', waktuSelesai: '', kelas: '', mapel: '' });
              setEditId(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-[#0f6c46] hover:bg-primary-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        </div>
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-5">Hari</th>
                <th className="py-3 px-5">Waktu</th>
                <th className="py-3 px-5 text-center">Kelas</th>
                <th className="py-3 px-5">Mata Pelajaran</th>
                <th className="py-3 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredJadwal.map((jadwal) => (
                <tr key={jadwal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-5 font-medium text-slate-700 dark:text-slate-300">{jadwal.hari}</td>
                  <td className="py-3 px-5 text-slate-600 dark:text-slate-400">{jadwal.waktu}</td>
                  <td className="py-3 px-5 text-center">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300">
                      {jadwal.kelas}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-700 dark:text-slate-300">{jadwal.mapel}</td>
                  <td className="py-3 px-5 text-right flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(jadwal.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(jadwal.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus jadwal ini?"
        onConfirm={() => {
          if (itemToDelete !== null) {
            setJadwalList(jadwalList.filter(j => j.id !== itemToDelete));
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-20">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editId !== null ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col">
              <div className="p-4 sm:p-5 space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hari</label>
                  <SelectDropdown
                    value={newJadwal.hari}
                    onChange={val => setNewJadwal({...newJadwal, hari: val})}
                    options={daysOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Waktu</label>
                  <div className="flex items-center gap-2">
                    <TimeScrollPicker
                      value={newJadwal.waktuMulai}
                      onChange={val => setNewJadwal({...newJadwal, waktuMulai: val})}
                      placeholder="Mulai"
                      align="left"
                    />
                    <span className="text-slate-500 font-medium">-</span>
                    <TimeScrollPicker
                      value={newJadwal.waktuSelesai}
                      onChange={val => setNewJadwal({...newJadwal, waktuSelesai: val})}
                      placeholder="Selesai"
                      align="right"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kelas</label>
                  <SelectDropdown
                    placeholder="Pilih Kelas"
                    value={newJadwal.kelas}
                    onChange={val => setNewJadwal({...newJadwal, kelas: val})}
                    options={classes.map(cls => ({ value: cls, label: cls }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Pelajaran</label>
                  <SelectDropdown
                    placeholder="Pilih Mapel"
                    value={newJadwal.mapel}
                    onChange={val => setNewJadwal({...newJadwal, mapel: val})}
                    options={subjects.map(s => ({ value: s.name, label: s.name }))}
                  />
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
