import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

let selectedLoan = null;
let isProcessing = false;

/* =========================
   SEARCH LOANS
========================= */

window.searchLoans = async function () {

  const keyword = document.getElementById("memberSearch")
    .value.toLowerCase().trim();

  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  if (!keyword) return;

  const snapshot = await getDocs(collection(db, "loans"));

  snapshot.forEach(docSnap => {

    const l = docSnap.data();

    const text = `${l.memberName} ${l.phone}`.toLowerCase();

    if (text.includes(keyword)) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        👤 ${l.memberName}<br>
        📱 ${l.phone}<br>
        💰 Remaining: ${l.remaining}
      `;

      div.onclick = () => selectLoan(docSnap.id, l);

      box.appendChild(div);
    }
  });
};

/* =========================
   SELECT LOAN
========================= */

function selectLoan(id, loan) {

  selectedLoan = { id, ...loan };

  document.getElementById("selectedLoan").innerHTML = `
    👤 ${loan.memberName}<br>
    📱 ${loan.phone}<br>
    💰 Remaining: ${loan.remaining}
  `;

  document.getElementById("searchResults").innerHTML = "";
}

/* =========================
   PENALTY CALCULATION
========================= */

function calculatePenalty(loan) {

  if (!loan.schedule?.nextDueDate) return 0;

  const today = new Date();
  const due = new Date(loan.schedule.nextDueDate);

  if (today <= due) return 0;

  const diffDays =
    Math.floor((today - due) / (1000 * 60 * 60 * 24));

  const penaltyRate = loan.schedule.penaltyRate || 2;

  const penalty =
    (loan.remaining * penaltyRate / 100) * diffDays;

  return penalty;
}

/* =========================
   MAKE REPAYMENT (FIXED)
========================= */

window.makeRepayment = async function () {

  if (isProcessing) return;

  if (!selectedLoan) {
    alert("Select a loan first");
    return;
  }

  const amount = Number(document.getElementById("payAmount").value);

  if (!amount || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  try {

    isProcessing = true;

    const penalty = calculatePenalty(selectedLoan);

    const totalPayment = amount;

    const newRemaining =
      (selectedLoan.remaining + penalty) - totalPayment;

    /* =========================
       SAVE REPAYMENT
    ========================= */

    await addDoc(collection(db, "repayments"), {

      loanId: selectedLoan.id,
      memberId: selectedLoan.memberId,
      memberName: selectedLoan.memberName,
      phone: selectedLoan.phone,

      amount: totalPayment,
      penalty,

      createdAt: serverTimestamp(),
      date: new Date().toISOString()
    });

    /* =========================
       UPDATE LOAN
    ========================= */

    const loanRef = doc(db, "loans", selectedLoan.id);

    await updateDoc(loanRef, {

      paid: (selectedLoan.paid || 0) + totalPayment,
      remaining: newRemaining > 0 ? newRemaining : 0,

      status:
        newRemaining <= 0 ? "completed" : "active"
    });

    /* =========================
       SUCCESS ALERT (FIXED)
    ========================= */

    alert("Payment Successful");

    document.getElementById("payAmount").value = "";

  } catch (err) {

    console.error(err);
    alert("Payment Failed");

  } finally {

    isProcessing = false;
  }
};

/* =========================
   REALTIME TABLE (FIXED)
========================= */

function loadLoanTable() {

  const table = document.getElementById("loanTable");

  onSnapshot(collection(db, "loans"), (snap) => {

    table.innerHTML = "";

    snap.forEach(docSnap => {

      const l = docSnap.data();

      const penalty = calculatePenalty(l);

      table.innerHTML += `
        <tr>
          <td>${l.memberName}</td>
          <td>${l.totalAmount || 0}</td>
          <td>${l.paid || 0}</td>
          <td>${l.remaining || 0}</td>
          <td>${penalty.toFixed(2)}</td>
          <td>${l.status}</td>
        </tr>
      `;
    });
  });
}

loadLoanTable();
