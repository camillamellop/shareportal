import { db } from "@/integrations/firebase/config";
import {
  collection, addDoc, getDocs, query, orderBy, where,
  doc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import { auth } from "@/integrations/firebase/config";

const getUid = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  return uid;
};

// -------- HOLERITES ----------
export async function addHolerite(meta: {
  fileName: string;
  fileUrl: string;
  filePath: string;
  month: string;
}) {
  const uid = getUid();
  const ref = collection(db, "users", uid, "holerites");
  await addDoc(ref, {
    ...meta,
    uploadDate: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function listHolerites() {
  const uid = getUid();
  const ref = collection(db, "users", uid, "holerites");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

export async function deleteHolerite(holeriteId: string) {
  const uid = getUid();
  await deleteDoc(doc(db, "users", uid, "holerites", holeriteId));
}

// -------- DOCUMENTOS ----------
export async function addDocumento(meta: {
  nome: string;
  url: string;
  path: string;
  tamanho: string;
  tipo: string;
  pasta: string;
}) {
  const uid = getUid();
  const ref = collection(db, "users", uid, "documentos");
  await addDoc(ref, {
    ...meta,
    dataUpload: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function listDocumentos(pasta?: string) {
  const uid = getUid();
  const ref = collection(db, "users", uid, "documentos");
  const q = pasta
    ? query(ref, where("pasta", "==", pasta), orderBy("createdAt", "desc"))
    : query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

export async function deleteDocumento(docId: string) {
  const uid = getUid();
  await deleteDoc(doc(db, "users", uid, "documentos", docId));
}