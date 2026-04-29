import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ADD SAVING */
export async function addSaving(memberId, amount){

  await addDoc(collection(db, "savings"), {
    memberId,
    amount: Number(amount),
    date: new Date()
  });

  alert("Saving added!");
}

/* TOTAL SAVINGS CALC */
export async function getTotalSavings(){

  const snap = await getDocs(collection(db, "savings"));

  let total = 0;

  snap.forEach(doc => {
    total += doc.data().amount;
  });

  return total;
}
