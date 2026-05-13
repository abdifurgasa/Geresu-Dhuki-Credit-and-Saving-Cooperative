import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getMembers() {
  const snap = await getDocs(collection(db, "members"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createMember(data) {
  return await addDoc(collection(db, "members"), data);
}

export async function updateMember(id, data) {
  return await updateDoc(doc(db, "members", id), data);
}

export async function removeMember(id) {
  return await deleteDoc(doc(db, "members", id));
}
