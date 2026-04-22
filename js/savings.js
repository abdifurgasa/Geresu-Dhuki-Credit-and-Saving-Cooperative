import { db } from "./firebase.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore collection
const savingsRef = collection(db, "savings");

/*
  ADD SAVING
  structure:
  {
    memberId,
    memberName,
    amount,
    month,
    createdAt
  }
*/
export async function addSaving(memberId, memberName, amount, month) {
  try {
    await addDoc(savingsRef, {
      memberId,
      memberName,
      amount: Number(amount),
      month,
      createdAt: new Date()
    });

    alert("Saving added successfully");
  } catch (error) {
    alert(error.message);
  }
}

/*
  GET ALL SAVINGS
*/
export async function getAllSavings() {
  const snap = await getDocs(savingsRef);

  let list = [];
  let total = 0;

  snap.forEach(doc => {
    const data = doc.data();
    list.push({ id: doc.id, ...data });
    total += data.amount || 0;
  });

  return { list, total };
}

/*
  GET SAVINGS BY MEMBER
*/
export async function getSavingsByMember(memberId) {
  const q = query(savingsRef, where("memberId", "==", memberId));
  const snap = await getDocs(q);

  let total = 0;
  let list = [];

  snap.forEach(doc => {
    const data = doc.data();
    list.push(data);
    total += data.amount || 0;
  });

  return { list, total };
}

/*
  GET MONTHLY SAVINGS REPORT
*/
export async function getMonthlySavings(month) {
  const q = query(savingsRef, where("month", "==", month));
  const snap = await getDocs(q);

  let total = 0;

  snap.forEach(doc => {
    total += doc.data().amount || 0;
  });

  return total;
}
