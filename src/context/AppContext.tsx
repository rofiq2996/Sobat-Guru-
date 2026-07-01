import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getNationalHolidays, NATIONAL_HOLIDAYS_2026 } from '../lib/holidays';
import { initAuth, googleSignIn, logout, getAccessToken, db } from '../lib/auth';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { readDatabase, saveDatabase } from '../lib/sheets';

export interface SubjectData {
  id: string;
  name: string;
  kkm: number;
  classes: string[];
}

export interface AgendaData {
  title: string;
  time?: string;
  type: string;
}

export interface KopSuratData {
  header1: string;
  header2: string;
  namaSekolah: string;
  alamat: string;
  websiteEmail: string;
  logoUrl?: string;
}

export type UserStatus = 'loading' | 'pending' | 'approved' | 'admin' | 'unauthenticated';

export interface AppContextType {
  teacher: { name: string; role: string; school: string; };
  setTeacher: (teacher: { name: string; role: string; school: string; }) => void;
  semester: 'Ganjil' | 'Genap';
  setSemester: (semester: 'Ganjil' | 'Genap') => void;
  kopSurat: KopSuratData;
  setKopSurat: (kopSurat: KopSuratData) => void;
  classes: string[];
  setClasses: (classes: string[]) => void;
  subjects: SubjectData[];
  setSubjects: (subjects: SubjectData[]) => void;
  agendas: Record<string, AgendaData[]>;
  setAgendas: React.Dispatch<React.SetStateAction<Record<string, AgendaData[]>>>;
  students: { id: string; name: string; class: string; gender: string }[];
  setStudents: React.Dispatch<React.SetStateAction<{ id: string; name: string; class: string; gender: string }[]>>;
  jadwals: { id: number; hari: string; waktu: string; kelas: string; mapel: string }[];
  setJadwals: React.Dispatch<React.SetStateAction<{ id: number; hari: string; waktu: string; kelas: string; mapel: string }[]>>;
  jurnals: { id: number; date: string; class: string; mapel: string; topic: string; notes: string }[];
  setJurnals: React.Dispatch<React.SetStateAction<{ id: number; date: string; class: string; mapel: string; topic: string; notes: string }[]>>;
  attendances: Record<string, { id: number; name: string; status: string; note: string; isLocked: boolean }[]>;
  setAttendances: React.Dispatch<React.SetStateAction<Record<string, { id: number; name: string; status: string; note: string; isLocked: boolean }[]>>>;
  grades: Record<string, { id: number; name: string; nilai: string; isLocked: boolean; sikap: string; karakter: string }[]>;
  setGrades: React.Dispatch<React.SetStateAction<Record<string, { id: number; name: string; nilai: string; isLocked: boolean; sikap: string; karakter: string }[]>>>;
  user: User | null;
  userStatus: UserStatus;
  handleLogin: (customUser?: any) => Promise<void>;
  handleLogout: () => Promise<void>;
  isSyncing: boolean;
  syncToDrive: () => Promise<void>;
  schoolType: string;
  setSchoolType: (type: string) => void;
  loadSyncData: (data: any, code: string) => void;
  linkedSessionId: string | null;
  setLinkedSessionId: (code: string | null) => void;
  spreadsheetUrl: string | null;
  setSpreadsheetUrl: (url: string | null) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const getInitialAgendas = () => {
  const baseAgendas: Record<string, AgendaData[]> = {};
  
  for (const [dateKey, holidayInfo] of Object.entries(NATIONAL_HOLIDAYS_2026)) {
    if (!baseAgendas[dateKey]) {
      baseAgendas[dateKey] = [];
    }
    baseAgendas[dateKey].push({ title: holidayInfo.title, time: 'Sepanjang hari', type: holidayInfo.type });
  }
  return baseAgendas;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacher] = useState({ name: '', role: '', school: '' });
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [schoolType, setSchoolType] = useState('5 Hari (Senin - Jumat)');
  const [kopSurat, setKopSurat] = useState<KopSuratData>({
    header1: '',
    header2: '',
    namaSekolah: '',
    alamat: '',
    websiteEmail: ''
  });
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [agendas, setAgendas] = useState<Record<string, AgendaData[]>>(getInitialAgendas());
  const [students, setStudents] = useState<{ id: string; name: string; class: string; gender: string }[]>([]);
  const [jadwals, setJadwals] = useState<{ id: number; hari: string; waktu: string; kelas: string; mapel: string }[]>([]);
  const [jurnals, setJurnals] = useState<{ id: number; date: string; class: string; mapel: string; topic: string; notes: string }[]>([]);
  const [attendances, setAttendances] = useState<Record<string, { id: number; name: string; status: string; note: string; isLocked: boolean }[]>>({});
  const [grades, setGrades] = useState<Record<string, { id: number; name: string; nilai: string; isLocked: boolean; sikap: string; karakter: string }[]>>({});
  
  const [user, setUser] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('loading');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const userSnapshotUnsubscribe = useRef<(() => void) | null>(null);
  
  // Real-time bi-directional device sync state
  let initialLinkedSession = null;
  try {
    initialLinkedSession = localStorage.getItem('linkedSessionId');
  } catch (e) {}
  const [linkedSessionId, setLinkedSessionId] = useState<string | null>(initialLinkedSession);
  const lastReceivedData = useRef<string>('');
  const hasUnsavedChanges = useRef(false);
  
  const [spreadsheetUrl, setSpreadsheetUrlState] = useState<string | null>(null);

  const setSpreadsheetUrl = async (url: string | null) => {
    setSpreadsheetUrlState(url);
    if (!url) {
      setClasses([]);
      setSubjects([]);
      setAgendas(getInitialAgendas());
      setStudents([]);
      setJadwals([]);
      setJurnals([]);
      setAttendances({});
      setGrades({});
    }
    if (user && user.uid !== 'linked-device') {
      try {
        const userRef = doc(db, 'users', user.uid);
        if (url) {
          await setDoc(userRef, { spreadsheetUrl: url }, { merge: true });
        } else {
          await setDoc(userRef, { 
            spreadsheetUrl: "",
            appData: "" 
          }, { merge: true });
        }
      } catch (e) {
        console.error('Failed to save spreadsheet URL to db', e);
      }
    }
  };

  // 1. Listen to real-time updates from linkedSessionId if active
  useEffect(() => {
    if (!linkedSessionId) return;
    
    const unsubscribe = onSnapshot(doc(db, 'device_sync', linkedSessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.appData) {
          const stringified = JSON.stringify(data.appData);
          if (stringified !== lastReceivedData.current) {
            lastReceivedData.current = stringified;
            const appD = data.appData;
            if (appD.teacher) setTeacher(appD.teacher);
            if (appD.semester) setSemester(appD.semester);
            if (appD.schoolType) setSchoolType(appD.schoolType);
            if (appD.kopSurat) setKopSurat(appD.kopSurat);
            if (appD.classes) setClasses(appD.classes);
            if (appD.subjects) setSubjects(appD.subjects);
            if (appD.agendas) setAgendas(appD.agendas);
            if (appD.students) setStudents(appD.students);
            if (appD.jadwals) setJadwals(appD.jadwals);
            if (appD.jurnals) setJurnals(appD.jurnals);
            if (appD.attendances) setAttendances(appD.attendances);
            if (appD.grades) setGrades(appD.grades);
            
            if (!user) {
              setUser({ displayName: appD.teacher?.name || 'Linked Device', photoURL: '', uid: 'linked-device' } as User);
              setUserStatus('approved');
              setIsLoaded(true);
            }
          }
        }
      }
    }, (error) => {
      console.warn("Device sync listener error:", error);
    });
    
    return () => unsubscribe();
  }, [linkedSessionId, user]);

  // 2. Throttle and sync local changes to cloud (either Google Drive or Device Sync or both)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current || isSyncing) {
        e.preventDefault();
        e.returnValue = 'Data sedang disimpan. Perubahan mungkin belum tersimpan ke Cloud. Yakin ingin keluar?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSyncing]);

  useEffect(() => {
    if (!isLoaded || !user || userStatus === 'pending') return;
    
    // Mark that we have unsaved local changes
    hasUnsavedChanges.current = true;
    
    const timeout = setTimeout(() => {
      const currentData = {
        teacher,
        semester,
        schoolType,
        kopSurat,
        classes,
        subjects,
        agendas,
        students,
        jadwals,
        jurnals,
        attendances,
        grades
      };
      const stringified = JSON.stringify(currentData);
      
      if (user.uid === 'linked-device') {
        if (stringified !== lastReceivedData.current) {
          syncToDeviceSync(currentData);
        }
      } else {
        syncToDrive();
        if (linkedSessionId && stringified !== lastReceivedData.current) {
          syncToDeviceSync(currentData);
        }
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [teacher, semester, schoolType, kopSurat, classes, subjects, agendas, students, jadwals, jurnals, attendances, grades, isLoaded, user, userStatus, linkedSessionId]);

  const syncToDeviceSync = async (dataToSync: any) => {
    if (!linkedSessionId) return;
    setIsSyncing(true);
    try {
      await setDoc(doc(db, 'device_sync', linkedSessionId), {
        appData: dataToSync,
        lastUpdatedBy: user?.uid === 'linked-device' ? 'receiver' : 'sender',
        timestamp: new Date().toISOString()
      }, { merge: true });
      lastReceivedData.current = JSON.stringify(dataToSync);
    } catch (e) {
      console.error('Failed to sync to device_sync:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const checkAndSetUserStatus = async (loggedInUser: User) => {
    setUserStatus('loading');
    const userRef = doc(db, 'users', loggedInUser.uid);
    let isAdmin = loggedInUser.email === 'ronlam29boker@gmail.com';
    let localStatus: UserStatus = 'pending';
    
    try {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        try {
          await setDoc(userRef, {
            uid: loggedInUser.uid,
            email: loggedInUser.email,
            displayName: loggedInUser.displayName,
            photoURL: loggedInUser.photoURL,
            status: isAdmin ? 'admin' : 'pending',
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Failed to create user doc, proceeding in offline mode:", e);
        }
        localStatus = isAdmin ? 'admin' : 'pending';
      } else {
        const data = docSnap.data();
        localStatus = (data.status as UserStatus) || 'pending';
        if (isAdmin && localStatus !== 'admin') {
           try {
             await setDoc(userRef, { status: 'admin', role: 'admin' }, { merge: true });
           } catch (e) {
             console.warn("Failed to update user doc:", e);
           }
           localStatus = 'admin';
        }
      }
    } catch (error) {
      console.warn("Failed to get document because the client is offline or network error:", error);
      localStatus = isAdmin ? 'admin' : 'pending';
    }

    setUserStatus(localStatus);
    if (localStatus === 'admin' || localStatus === 'approved') {
       loadDriveData();
    }

    subscribeToUserData(loggedInUser.uid);
  };

  const subscribeToUserData = (uid: string) => {
    if (userSnapshotUnsubscribe.current) {
      userSnapshotUnsubscribe.current();
    }

    const userRef = doc(db, 'users', uid);
    userSnapshotUnsubscribe.current = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status) {
           const newStatus = data.status as UserStatus;
           setUserStatus((prev) => {
             if (prev !== newStatus && (newStatus === 'approved' || newStatus === 'admin')) {
               loadDriveData();
             }
             return newStatus;
           });
        }
      }
    }, (error) => {
      console.warn("User snapshot listener error:", error);
    });
  };

  const loadDriveData = async (currentUser: User | null = user) => {
    if (isLoaded || !currentUser) return;
    setIsSyncing(true);
    try {
      let data: any = null;
      let currentSpreadsheetUrl: string | null = spreadsheetUrl;
      let userSnap: any = null;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
           const userData = userSnap.data();
           if (userData.spreadsheetUrl !== undefined && userData.spreadsheetUrl !== "") {
             currentSpreadsheetUrl = userData.spreadsheetUrl;
             setSpreadsheetUrlState(currentSpreadsheetUrl);
           } else {
             currentSpreadsheetUrl = null;
             setSpreadsheetUrlState(null);
           }
        }
      } catch (err) {
        console.warn("Failed to get user doc in loadDriveData:", err);
      }

      try {
        data = await readDatabase(currentSpreadsheetUrl);
      } catch (err) {
        console.warn("Drive DB failed, trying Firestore", err);
      }
      
      if (data) {
        console.log("Loaded data from Cloud:", data);
        if (data.teacher) setTeacher(data.teacher);
        if (data.semester) setSemester(data.semester);
        if (data.schoolType) setSchoolType(data.schoolType);
        if (data.kopSurat) setKopSurat(data.kopSurat);
        if (data.classes) setClasses(data.classes);
        if (data.subjects) setSubjects(data.subjects);
        if (data.agendas) setAgendas(data.agendas);
        if (data.students) setStudents(data.students);
        if (data.jadwals) setJadwals(data.jadwals);
        if (data.jurnals) setJurnals(data.jurnals);
        if (data.attendances) setAttendances(data.attendances);
        if (data.grades) setGrades(data.grades);
      }
      setIsLoaded(true);
    } catch (e) {
      console.error("Gagal memuat data:", e);
      // We do NOT set isLoaded=true here, because if we do, the app will
      // think it's a new empty state and auto-save the empty state.
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let storedSession = null;
    try {
      storedSession = localStorage.getItem('linkedSessionId');
    } catch (e) {}
    
    if (storedSession) {
      setLinkedSessionId(storedSession);
      setUser({ displayName: 'Linked Device', photoURL: '', uid: 'linked-device' } as User);
      setUserStatus('approved');
      setIsLoaded(true);
      return;
    }
    
    let storedCustomUser = null;
    try {
      storedCustomUser = localStorage.getItem('customUserData');
    } catch (e) {}
    
    if (storedCustomUser) {
      try {
        const customUser = JSON.parse(storedCustomUser);
        if (!customUser) {
          try {
            localStorage.removeItem('customUserData');
          } catch (e) {}
          return;
        }
        const mockUser = {
          uid: customUser.id || 'custom',
          displayName: customUser.name || 'User',
          email: (customUser.phone || '000') + '@token.user',
          photoURL: '',
        } as User;
        setUser(mockUser);
        setTeacher((prev) => ({ ...prev, name: customUser.name || prev.name }));
        setUserStatus(customUser.role === 'admin' ? 'admin' : 'approved');
        // Let loadDriveData happen if needed, wait checkAndSetUserStatus isn't called for them because checkAndSetUserStatus works with Firestore user status
        // so we just call loadDriveData()
        loadDriveData(mockUser);
        subscribeToUserData(mockUser.uid);
        return;
      } catch(e) {
        console.error('Failed parsing custom user', e);
        try {
          localStorage.removeItem('customUserData');
        } catch (err) {}
      }
    }
    
    const unsubscribe = initAuth(
      async (loggedInUser, token) => {
        let hasLinkedOrCustom = false;
        try {
          hasLinkedOrCustom = !!(localStorage.getItem('linkedSessionId') || localStorage.getItem('customUserData'));
        } catch (e) {}
        
        if (hasLinkedOrCustom) {
          return;
        }
        setUser(loggedInUser);
        if (loggedInUser.displayName) setTeacher((prev) => ({ ...prev, name: loggedInUser.displayName || 'User' }));
        await checkAndSetUserStatus(loggedInUser);
      },
      () => {
        let hasLinkedOrCustom = false;
        try {
          hasLinkedOrCustom = !!(localStorage.getItem('linkedSessionId') || localStorage.getItem('customUserData'));
        } catch (e) {}
        
        if (hasLinkedOrCustom) {
          return;
        }
        if (userSnapshotUnsubscribe.current) {
          userSnapshotUnsubscribe.current();
          userSnapshotUnsubscribe.current = null;
        }
        setUser(null);
        setUserStatus('unauthenticated');
        setIsLoaded(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async (customUser?: any) => {
    try {
      setIsSyncing(true);
      
      if (customUser) {
        // Token logic bypasses Google Auth
        try {
          localStorage.setItem('customUserData', JSON.stringify(customUser));
        } catch (e) {}
        
        const mockUser = {
          uid: customUser.id || 'custom',
          displayName: customUser.name || 'User',
          email: (customUser.phone || '000') + '@token.user',
          photoURL: '',
        } as User;
        
        setUser(mockUser);
        setTeacher((prev) => ({ ...prev, name: mockUser.displayName || 'User' }));
        setUserStatus(customUser.role === 'admin' ? 'admin' : 'approved');
        setSpreadsheetUrlState(customUser.spreadsheetUrl || null);
        await loadDriveData(mockUser);
        subscribeToUserData(mockUser.uid);
        setIsLoaded(true);
        setIsSyncing(false);
        return;
      }
      
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        if (result.user.displayName) setTeacher((prev) => ({ ...prev, name: result.user.displayName || 'User' }));
        await checkAndSetUserStatus(result.user);
      }
    } catch (e: any) {
      console.error('Firebase Login Error:', e);
      setIsSyncing(false);
      
      const errMsg = e.message || '';
      if (errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('domain')) {
        alert("Login diblokir oleh sistem keamanan Firebase.\n\nHal ini terjadi karena domain ini (.run.app atau domain public Anda) belum ditambahkan ke daftar 'Authorized Domains' di Firebase Authentication.\n\nUntuk production, harap buat Firebase Project milik Anda sendiri dan perbarui firebase-applet-config.json, lalu tambahkan domain deploy Anda ke Firebase Authorized Domains.");
      } else {
        alert("Gagal melakukan login menggunakan Google: " + (e.message || "Pastikan popup browser tidak diblokir."));
      }
    }
  };

  const loadSyncData = (data: any, code: string) => {
    if (data.teacher) setTeacher(data.teacher);
    if (data.semester) setSemester(data.semester);
    if (data.schoolType) setSchoolType(data.schoolType);
    if (data.kopSurat) setKopSurat(data.kopSurat);
    if (data.classes) setClasses(data.classes);
    if (data.subjects) setSubjects(data.subjects);
    if (data.agendas) setAgendas(data.agendas);
    if (data.students) setStudents(data.students);
    if (data.jadwals) setJadwals(data.jadwals);
    if (data.jurnals) setJurnals(data.jurnals);
    if (data.attendances) setAttendances(data.attendances);
    if (data.grades) setGrades(data.grades);
    
    setLinkedSessionId(code);
    try {
      localStorage.setItem('linkedSessionId', code);
    } catch (e) {}
    
    // Bypass user authentication
    setUser({ displayName: data.teacher?.name || 'Linked Device', photoURL: '', uid: 'linked-device' } as User);
    setUserStatus('approved');
    setIsLoaded(true);
  };

  const handleLogout = async () => {
    if (user?.uid !== 'linked-device') {
      try {
        if (userSnapshotUnsubscribe.current) {
          userSnapshotUnsubscribe.current();
          userSnapshotUnsubscribe.current = null;
        }
        await logout();
      } catch (err) {
        console.error(err);
      }
    }
    setLinkedSessionId(null);
    try {
      localStorage.removeItem('linkedSessionId');
      localStorage.removeItem('customUserData');
    } catch (e) {}
    setUser(null);
    setUserStatus('unauthenticated');
    setIsLoaded(false);
  };

  const syncToDrive = async () => {
    if (!user || userStatus === 'pending' || user.uid === 'linked-device') return;
    setIsSyncing(true);
    try {
      const currentData = { teacher, semester, schoolType, kopSurat, classes, subjects, agendas, students, jadwals, jurnals, attendances, grades };
      const stringified = JSON.stringify(currentData);
      lastReceivedData.current = stringified; // Prevent loopback from realtime listener
      
      const token = await getAccessToken();
      if (!token && !spreadsheetUrl) {
        hasUnsavedChanges.current = false;
        setIsSyncing(false);
        return;
      }
      
      try {
        await saveDatabase(currentData, spreadsheetUrl);
      } catch (e) {
        console.warn("saveDatabase failed", e);
      }
      hasUnsavedChanges.current = false;
    } catch (e) {
      console.error(e);
      // alert('Gagal sinkronisasi data ke Cloud!');
    } finally {
      setIsSyncing(false);
    }
  };

  const resetAllData = async () => {
    setIsSyncing(true);
    try {
      setTeacher({ name: user?.displayName || '', role: '', school: '' });
      setSemester('Ganjil');
      setSchoolType('5 Hari (Senin - Jumat)');
      setKopSurat({
        header1: '',
        header2: '',
        namaSekolah: '',
        alamat: '',
        websiteEmail: ''
      });
      setClasses([]);
      setSubjects([]);
      setAgendas(getInitialAgendas());
      setStudents([]);
      setJadwals([]);
      setJurnals([]);
      setAttendances({});
      setGrades({});
      setSpreadsheetUrlState(null);

      if (user && user.uid !== 'linked-device') {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { 
          spreadsheetUrl: ""
        }, { merge: true });
      }

      const emptyData = {
        teacher: { name: user?.displayName || '', role: '', school: '' },
        semester: 'Ganjil',
        schoolType: '5 Hari (Senin - Jumat)',
        kopSurat: { header1: '', header2: '', namaSekolah: '', alamat: '', websiteEmail: '' },
        classes: [],
        subjects: [],
        agendas: getInitialAgendas(),
        students: [],
        jadwals: [],
        jurnals: [],
        attendances: {},
        grades: {}
      };

      try {
        await saveDatabase(emptyData, spreadsheetUrl);
      } catch (err) {
        console.warn("Failed to clear spreadsheet during reset", err);
      }

      hasUnsavedChanges.current = false;
    } catch (e) {
      console.error('Failed to reset all data:', e);
      throw e;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppContext.Provider value={{ 
      teacher, setTeacher, 
      semester, setSemester, 
      schoolType, setSchoolType, 
      kopSurat, setKopSurat, 
      classes, setClasses, 
      subjects, setSubjects, 
      agendas, setAgendas, 
      students, setStudents,
      jadwals, setJadwals,
      jurnals, setJurnals,
      attendances, setAttendances,
      grades, setGrades,
      user, userStatus, 
      handleLogin, handleLogout, 
      isSyncing, syncToDrive, 
      loadSyncData,
      linkedSessionId,
      setLinkedSessionId,
      spreadsheetUrl,
      setSpreadsheetUrl,
      resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}

