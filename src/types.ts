export type ViewState = 'welcome' | 'dashboard' | 'siswa' | 'jadwal' | 'absensi' | 'nilai' | 'analisis' | 'jurnal' | 'bk' | 'laporan' | 'profil' | 'kalender' | 'menu';

export interface User {
  name: string;
  role: string;
  school: string;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
}

export interface Schedule {
  id: string;
  day: string;
  time: string;
  class: string;
  subject: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  notes?: string;
}

export interface Grade {
  studentId: string;
  subject: string;
  uh1?: number;
  uh2?: number;
  uh3?: number;
  uh4?: number;
  uh5?: number;
  sts?: number;
  sas?: number;
}
