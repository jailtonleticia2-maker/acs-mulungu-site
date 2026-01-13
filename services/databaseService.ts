
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Member, APSIndicator, DentalIndicator } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyDIS91OFlTIzbq44YCAAn95BAzGW5A-KBw",
  authDomain: "acs-mulungu.firebaseapp.com",
  projectId: "acs-mulungu",
  storageBucket: "acs-mulungu.firebasestorage.app",
  messagingSenderId: "390767593306",
  appId: "1:390767593306:web:2a06306d7e560f6c3e9563"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const databaseService = {
  // --- MEMBROS ---
  subscribeMembers: (callback: (members: Member[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "members"), orderBy("registrationDate", "desc"));
    return onSnapshot(q, 
      (snapshot) => callback(snapshot.docs.map(doc => doc.data() as Member)),
      (error) => onError(error)
    );
  },

  saveMember: async (member: Member) => {
    await setDoc(doc(db, "members", member.id), member);
  },

  deleteMember: async (id: string) => {
    await deleteDoc(doc(db, "members", id));
  },

  // --- INDICADORES APS ---
  subscribeAPS: (callback: (indicators: APSIndicator[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "aps_indicators"), orderBy("code", "asc"));
    return onSnapshot(q, 
      (snapshot) => callback(snapshot.docs.map(doc => doc.data() as APSIndicator)),
      (error) => onError(error)
    );
  },

  updateAPS: async (indicator: APSIndicator) => {
    await setDoc(doc(db, "aps_indicators", indicator.code), indicator);
  },

  // --- INDICADORES BUCAIS ---
  subscribeDental: (callback: (indicators: DentalIndicator[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "dental_indicators"), orderBy("code", "asc"));
    return onSnapshot(q, 
      (snapshot) => callback(snapshot.docs.map(doc => doc.data() as DentalIndicator)),
      (error) => onError(error)
    );
  },

  updateDental: async (indicator: DentalIndicator) => {
    await setDoc(doc(db, "dental_indicators", indicator.code), indicator);
  },

  seedInitialData: async (aps: APSIndicator[], dental: DentalIndicator[]) => {
    const batch = writeBatch(db);
    aps.forEach(item => batch.set(doc(db, "aps_indicators", item.code), item));
    dental.forEach(item => batch.set(doc(db, "dental_indicators", item.code), item));
    await batch.commit();
  }
};
