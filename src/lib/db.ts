import { db } from './auth';
import { collection, addDoc, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';

export interface UserRegistration {
  id?: string;
  name: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  token?: string;
  spreadsheetUrl?: string; // URL Apps Script Web App atau public id
  role?: 'user' | 'admin';
  createdAt?: any;
}

export const registerUser = async (name: string, phone: string) => {
  const docRef = await addDoc(collection(db, 'users'), {
    name,
    phone,
    status: 'pending',
    role: 'user',
    createdAt: serverTimestamp()
  });
  
  // Kirim notifikasi Telegram (tanpa block flow jika error)
  sendTelegramNotification(name, phone);
  
  return docRef.id;
};

export const loginWithToken = async (token: string): Promise<UserRegistration | null> => {
  // Hardcode admin token for testing and initial setup
  if (token === 'SG-2910') {
    return { id: 'admin', name: 'Administrator', phone: '-', status: 'approved', role: 'admin', token: 'SG-2910' };
  }

  const q = query(collection(db, 'users'), where('token', '==', token), where('status', '==', 'approved'));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() } as UserRegistration;
};

export const getPendingUsers = async (): Promise<UserRegistration[]> => {
  const q = query(collection(db, 'users'), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRegistration));
};

export const getApprovedUsers = async (): Promise<UserRegistration[]> => {
  const q = query(collection(db, 'users'), where('status', '==', 'approved'), where('role', '==', 'user'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRegistration));
};

export const approveUser = async (userId: string, token: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    status: 'approved',
    token
  }, { merge: true });
};

export const rejectUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    status: 'rejected'
  }, { merge: true });
};

export const updateUserSpreadsheetUrl = async (userId: string, url: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    spreadsheetUrl: url
  }, { merge: true });
};
