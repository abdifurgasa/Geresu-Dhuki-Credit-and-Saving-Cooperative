import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

let selectedLoan = null;

/* =========================
   SEARCH LOANS (BY MEMBER)
========================= */

window.searchLoans = async function () {

  const keyword = document.getElementById("memberSearch").value.toLowerCase().trim();

  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  if (!keyword) return;

  const snapshot = await getDocs(collection(db, "loans"));

  snapshot.forEach(docSnap => {

    const l = docSnap.data();

    const text = `
      ${l.memberName}
      ${l.phone}
    `.toLowerCase();

    if (text.includes(keyword) && l.status === "active") {

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
    💰 Remaining: ${loan.remaining.toFixed(2)} ETB<br>
    📊 Monthly: ${loan.monthlyPayment.toFixed(2)} ETB
  `;

  document.getElementById("searchResults").innerHTML = "";
}

/* =========================
   CHECK PENALTY (AUTO)
========================= */

function calculatePenalty(loan) {

  const now = new Date();

  const due = new Date(loan.schedule.nextDueDate);

  const penaltyRate = loan.schedule.penaltyRate || 2;

  if (now > due) {

    const monthsLate =
      Math.floor((now - due) / (1000 * 60 * 60 * 24 * 30));

    const penalty =
      loan.remaining * (penaltyRate / 100) * (monthsLate || 1);

    return penalty;
  }

  return 0;
}

/* =========================
   MAKE REPAYMENT
========================= */

window.makeRepayment = async function () {

  if (!selectedLoan) {
    alert("Select loan first");
    return;
  }

  const amount = Number(document.getElementById("payAmount").value);

  if (!amount || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  /* =========================
     GET FRESH LOAN DATA
  ========================= */

  const loanRef = doc(db, "loans", selectedLoan.id);

  const loanSnap = await getDoc(loanRef);

  if (!loanSnap.exists()) {
    alert("Loan not found");
    return;
  }

  const loan = loanSnap.data();

  /* =========================
     APPLY PENALTY
  ========================= */

  const penalty = calculatePenalty(loan);

  let updatedRemaining =
    loan.remaining + penalty - amount;

  if (updatedRemaining < 0) {
    updatedRemaining = 0;
  }

  let status = updatedRemaining === 0 ? "completed" : "active";

  /* =========================
     UPDATE LOAN
  ========================= */

  await updateDoc(loanRef, {

    remaining: updatedRemaining,
    paid: (loan.paid || 0) + amount,
    status: status,

    "schedule.lastPaymentDate": new Date().toISOString()
  });

  /* =========================
     SAVE REPAYMENT RECORD
  ========================= */

  await addDoc(collection(db, "repayments"), {

    loanId: selectedLoan.id,
    memberId: loan.memberId,
    memberName: loan.memberName,

    amount,
    penalty,

    remainingAfter: updatedRemaining,

    date: new Date().toISOString(),
    createdAt: serverTimestamp()
  });

  alert("Payment successful");

  document.getElementById("payAmount").value = "";

  selectedLoan = null;

  document.getElementById("selectedLoan").innerHTML =
    "No loan selected";
};

/* =========================
   REALTIME TABLE
========================= */

function loadRepayments() {

  const table = document.getElementById("loanTable");

  onSnapshot(collection(db, "repayments"), (snap) => {

    table.innerHTML = "";

    snap.forEach(docSnap => {

      const r = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${r.memberName}</td>
          <td>${r.amount}</td>
          <td>${r.penalty || 0}</td>
          <td>${r.remainingAfter}</td>
          <td>${r.date}</td>
        </tr>
      `;
    });
  });
}

loadRepayments();
