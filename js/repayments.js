import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD LOANS
========================= */
const loanSelect = document.getElementById("loanSelect");

async function loadLoans(){
  const snapshot = await getDocs(collection(db, "loans"));

  loanSelect.innerHTML = "<option>Select Loan</option>";

  snapshot.forEach(docSnap => {
    const loan = docSnap.data();

    if(loan.balance > 0){
      loanSelect.innerHTML += `
        <option value="${docSnap.id}">
          ${loan.memberName} - Balance: ${loan.balance}
        </option>
      `;
    }
  });
}

loadLoans();

/* =========================
   MAKE REPAYMENT
========================= */
window.makeRepayment = async function(){

  const loanId = loanSelect.value;
  const amount = parseFloat(document.getElementById("amount").value);

  if(!loanId || !amount){
    alert("Fill all fields");
    return;
  }

  const loanRef = doc(db, "loans", loanId);
  const loanSnap = await getDoc(loanRef);

  if(!loanSnap.exists()){
    alert("Loan not found");
    return;
  }

  const loan = loanSnap.data();

  let newBalance = loan.balance - amount;

  if(newBalance < 0){
    alert("Amount exceeds balance");
    return;
  }

  let status = newBalance === 0 ? "completed" : "ongoing";

  /* UPDATE LOAN */
  await updateDoc(loanRef, {
    balance: newBalance,
    status: status
  });

  /* SAVE REPAYMENT */
  await addDoc(collection(db, "repayments"), {
    loanId,
    memberName: loan.memberName,
    amount,
    date: new Date().toISOString()
  });

  alert("Repayment successful");

  loadLoans();
  loadRepayments();
};

/* =========================
   LOAD REPAYMENTS
========================= */
const table = document.getElementById("repaymentTable");

async function loadRepayments(){
  const snapshot = await getDocs(collection(db, "repayments"));

  table.innerHTML = "";

  snapshot.forEach(docSnap => {
    const r = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${r.memberName}</td>
        <td class="amount green">$${r.amount}</td>
        <td>${new Date(r.date).toLocaleDateString()}</td>
      </tr>
    `;
  });
}

loadRepayments();
