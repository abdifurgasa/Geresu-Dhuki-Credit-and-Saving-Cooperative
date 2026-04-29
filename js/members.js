import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ADD MEMBER */
export async function addMember(name, phone){

  await addDoc(collection(db, "members"), {
    name,
    phone,
    createdAt: new Date()
  });

  alert("Member added!");
}

/* GET MEMBERS */
export async function getMembers(){

  const snap = await getDocs(collection(db, "members"));

  let data = [];
  snap.forEach(d => {
    data.push({ id: d.id, ...d.data() });
  });

  return data;
}

/* DELETE MEMBER */
export async function deleteMember(id){

  await deleteDoc(doc(db, "members", id));
  alert("Deleted");
}
