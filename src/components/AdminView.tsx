import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/auth';
import { UserCheck, Shield, Clock, ShieldAlert, Key, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { UserRegistration } from '../lib/db';
import { ConfirmModal } from './ui/ConfirmModal';

export const AdminView = () => {
  const [users, setUsers] = useState<UserRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: UserRegistration[] = [];
      snapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() } as UserRegistration);
      });
      // sort: pending first, then others
      userList.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now());
      });
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      console.warn("Admin users listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string | undefined, status: string, role: string) => {
    if (!id) return;
    const token = status === 'approved' ? `SG-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : '';
    await setDoc(doc(db, 'users', id), { status, role, token }, { merge: true });
  };

  const handleDeleteUser = (id: string | undefined) => {
    if (!id) return;
    setUserToDelete(id);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteDoc(doc(db, 'users', userToDelete));
    setUserToDelete(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat data pengguna...</div>;
  }

  const filteredUsers = users.filter(u => 
    (u.name || (u as any).displayName)?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Panel</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola persetujuan dan token pengguna (Sistem Offline-Token).</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Daftar Pendaftar</h2>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-medium">
              {filteredUsers.length}
            </span>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari nama pengguna..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
            />
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 sm:px-6 font-semibold text-slate-500 dark:text-slate-400">Nama</th>
                <th className="py-3 px-4 sm:px-6 font-semibold text-slate-500 dark:text-slate-400">Nomor HP</th>
                <th className="py-3 px-4 sm:px-6 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                <th className="py-3 px-4 sm:px-6 font-semibold text-slate-500 dark:text-slate-400">Token Login</th>
                <th className="py-3 px-4 sm:px-6 font-semibold p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="align-middle">
              {paginatedUsers.map((u, i) => (
                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <p className="font-bold text-slate-800 dark:text-white leading-tight">{u.name || (u as any).displayName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{u.role === 'admin' ? 'Administrator' : 'Pengguna Biasa'}</p>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{u.phone || (u as any).email || '-'}</p>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    {u.status === 'admin' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs sm:text-sm font-medium"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Admin</span>}
                    {u.status === 'approved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs sm:text-sm font-medium"><UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Disetujui</span>}
                    {u.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs sm:text-sm font-medium"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Menunggu</span>}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    {u.token ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700">
                          {u.token}
                        </code>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm italic">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(u.id, 'approved', 'user')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                          Setujui & Buat Token
                        </button>
                      )}
                      {u.status === 'approved' && u.role !== 'admin' && (
                        <button 
                          onClick={() => handleUpdateStatus(u.id, 'pending', 'user')}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          Cabut Akses
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View Dropdown style omitted for brevity, keeping simple listing */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedUsers.map((u) => (
            <div key={u.id} className="p-3 sm:p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{u.name || (u as any).displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{u.phone || (u as any).email || '-'}</p>
                </div>
                <div className="shrink-0">
                  {u.status === 'admin' && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Admin</span>}
                  {u.status === 'approved' && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Disetujui</span>}
                  {u.status === 'pending' && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Menunggu</span>}
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-3 mt-1">
                <div className="flex-1">
                  {u.token ? (
                    <code className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{u.token}</code>
                  ) : (
                    <span className="text-xs text-slate-400 italic">-</span>
                  )}
                </div>
                
                <div className="shrink-0 flex items-center gap-1">
                  {u.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(u.id, 'approved', 'user')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    >
                      Setujui
                    </button>
                  )}
                  {u.status === 'approved' && u.role !== 'admin' && (
                    <button 
                      onClick={() => handleUpdateStatus(u.id, 'pending', 'user')}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    >
                      Cabut
                    </button>
                  )}
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {paginatedUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">Tidak ada data yang ditemukan.</div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <p className="text-xs text-slate-500 hidden sm:block">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} data
            </p>
            <div className="flex items-center gap-1 sm:mx-0 mx-auto">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={userToDelete !== null}
        title="Hapus Pengguna"
        message="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
