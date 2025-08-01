import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase para Aeroportal Brasil
const firebaseConfig = {
  apiKey: "AIzaSyCvI99h6xutWyZ-SlMDCvbS7p-xp604aro",
  authDomain: "aeroportal-brasil.firebaseapp.com",
  projectId: "aeroportal-brasil",
  storageBucket: "aeroportal-brasil.firebasestorage.app",
  messagingSenderId: "136549004745",
  appId: "1:136549004745:web:e78ee54833482bdcfde418"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 