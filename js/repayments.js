import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD LOANS INTO SELECT
========================= */
function loadLoans() {
  const select = document.getElementById("loanSelect");

  onSnapshot(collection(db, "loans"), (snap) => {
    select.innerHTML = `<option value="">Select Loan</option>`;

    snap.forEach(d => {
      let data = d.data();

      let remaining = (data.balance ?? data.amount);

      select.innerHTML += `
        <option value="${d.id}">
          ${data.member} - Remaining $${remaining}
        </option>
      `;
    });
  });
}

/* =========================
   ADD REPAYMENT
========================= */
window.addRepayment = async function () {

  let loanId = document.getElementById("loanSelect").value;
  let amount = Number(document.getElementById("amount").value);

  if (!loanId || !amount) {
    return alert("Select loan and enter amount");
  }

  try {

    const loanRef = doc(db, "loans", loanId);

    // GET CURRENT LOAN SNAPSHOT
    let loanSnap = await fetchLoan(loanRef);

    let newPaid = (loanSnap.paid || 0) + amount;
    let newBalance = loanSnap.amount - newPaid;

    // UPDATE LOAN
    await updateDoc(loanRef, {
      paid: newPaid,
      balance: newBalance,
      status: newBalance <= 0 ? "closed" : "active"
    });

    // ADD TRANSACTION
    await addDoc(collection(db, "transactions"), {
      type: "Repayment",
      member: loanSnap.member,
      amount: amount,
      description: "Loan repayment",
      date: new Date().toISOString().split("T")[0]
    });

    document.getElementById("amount").value = "";

    alert("Repayment successful");

  } catch (err) {
    console.error(err);
  }
};

/* =========================
   FETCH LOAN DATA
========================= */
async function fetchLoan(ref){
  let snap = await ref.get();
  return snap.data();
}

/* =========================
   LOAD REPAYMENTS HISTORY
========================= */
function loadRepayments() {

  const table = document.getElementById("repayTable");

  const q = query(collection(db, "transactions"), orderBy("date","desc"));

  onSnapshot(q, snap => {

    table.innerHTML = "";

    snap.forEach(d => {
      let data = d.data();

      if(data.type !== "Repayment") return;

      table.innerHTML += `
        <tr>
          <td>${data.member}</td>
          <td class="green">$${data.amount}</td>
          <td>${data.date}</td>
        </tr>
      `;
    });

  });

}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadLoans();
  loadRepayments();
});
