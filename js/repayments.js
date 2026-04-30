import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD LOANS INTO SELECT
========================= */
function loadLoans() {

  const select = document.getElementById("loanSelect");

  onSnapshot(collection(db, "loans"), (snap) => {

    select.innerHTML = `<option value="">Select Loan</option>`;

    snap.forEach(docSnap => {

      let d = docSnap.data();

      select.innerHTML += `
        <option value="${docSnap.id}">
          ${d.member} | Remaining $${d.balance}
        </option>
      `;
    });

  });
}

/* =========================
   ADD REPAYMENT
========================= */
window.addRepayment = async function () {

  const loanId = document.getElementById("loanSelect").value;
  const amount = Number(document.getElementById("amount").value);

  if (!loanId || !amount) {
    return alert("Select loan and enter amount");
  }

  try {

    const loanRef = doc(db, "loans", loanId);
    const loanSnap = await getDoc(loanRef);

    if (!loanSnap.exists()) return;

    const loan = loanSnap.data();

    let newPaid = (loan.paid || 0) + amount;
    let newBalance = loan.amount - newPaid;

    let newStatus = newBalance <= 0 ? "closed" : "active";

    // UPDATE LOAN
    await updateDoc(loanRef, {
      paid: newPaid,
      balance: newBalance,
      status: newStatus
    });

    // SAVE TRANSACTION
    await addDoc(collection(db, "transactions"), {
      type: "Repayment",
      member: loan.member,
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
   REPAYMENT HISTORY
========================= */
function loadRepayments() {

  const table = document.getElementById("repayTable");

  onSnapshot(collection(db, "transactions"), (snap) => {

    table.innerHTML = "";

    snap.forEach(doc => {

      let d = doc.data();

      if (d.type !== "Repayment") return;

      table.innerHTML += `
        <tr>
          <td>${d.member}</td>
          <td class="green">$${d.amount}</td>
          <td>${d.description}</td>
          <td>${d.date}</td>
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
