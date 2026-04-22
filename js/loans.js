import { db } from "./firebase.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore collection
const loansRef = collection(db, "loans");

/*
  CREATE LOAN REQUEST
*/
export async function createLoan(memberId, memberName, amount, durationMonths) {
  try {
    await addDoc(loansRef, {
      memberId,
      memberName,
      amount: Number(amount),
      remaining: Number(amount),
      durationMonths,
      status: "pending", // pending | approved | rejected
      createdAt: new Date()
    });

    alert("Loan request submitted");
  } catch (error) {
    alert(error.message);
  }
}

/*
  APPROVE LOAN
*/
export async function approveLoan(loanId) {
  try {
    await updateDoc(doc(db, "loans", loanId), {
      status: "approved"
    });

    alert("Loan approved");
  } catch (error) {
    alert(error.message);
  }
}

/*
  REJECT LOAN
*/
export async function rejectLoan(loanId) {
  try {
    await updateDoc(doc(db, "loans", loanId), {
      status: "rejected"
    });

    alert("Loan rejected");
  } catch (error) {
    alert(error.message);
  }
}

/*
  GET ALL LOANS
*/
export async function getAllLoans() {
  const snap = await getDocs(loansRef);

  let list = [];
  let total = 0;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    list.push({ id: docSnap.id, ...data });

    if (data.status === "approved") {
      total += data.amount || 0;
    }
  });

  return { list, total };
}

/*
  GET LOANS BY MEMBER
*/
export async function getLoansByMember(memberId) {
  const q = query(loansRef, where("memberId", "==", memberId));
  const snap = await getDocs(q);

  let list = [];
  let total = 0;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    list.push(data);

    if (data.status === "approved") {
      total += data.amount || 0;
    }
  });

  return { list, total };
}

/*
  GET PENDING LOANS (FOR ADMIN)
*/
export async function getPendingLoans() {
  const q = query(loansRef, where("status", "==", "pending"));
  const snap = await getDocs(q);

  let list = [];

  snap.forEach(docSnap => {
    list.push({ id: docSnap.id, ...docSnap.data() });
  });

  return list;
}
