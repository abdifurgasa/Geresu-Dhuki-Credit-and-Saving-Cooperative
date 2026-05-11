import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
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
   SEARCH ACTIVE LOANS
========================= */

window.searchLoans = async function () {

  const keyword = document
    .getElementById("memberSearch")
    .value
    .toLowerCase()
    .trim();

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
        💰 Loan: ${l.totalAmount} ETB<br>
        📱 ${l.phone}
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

  selectedLoan = {
    id,
    ...loan
  };

  document.getElementById("selectedLoan").innerHTML = `
    👤 ${loan.memberName}<br>
    💰 Remaining: ${loan.remaining} ETB<br>
    📊 Status: ${loan.status}
  `;

  document.getElementById("searchResults").innerHTML = "";
}

/* =========================
   REPAYMENT ENGINE (WITH PENALTY)
========================= */

window.makeRepayment = async function () {

  if (!selectedLoan) {
    alert("Select loan first");
    return;
  }

  const amount = Number(
    document.getElementById("payAmount").value
  );

  if (!amount || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  let now = new Date();

  let dueDate = selectedLoan.schedule?.nextDueDate
    ? new Date(selectedLoan.schedule.nextDueDate)
    : null;

  let penalty = 0;

  let remaining = Number(selectedLoan.remaining);

  /* =========================
     PENALTY CALCULATION
  ========================= */

  if (dueDate && now > dueDate && remaining > 0) {

    let daysLate =
      Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

    let rate = 0.02; // 2% per month equivalent

    penalty = remaining * rate * (daysLate / 30);

    remaining += penalty;
  }

  let paid = Number(selectedLoan.paid || 0);

  let newPaid = paid + amount;

  let newRemaining = remaining - amount;

  if (newRemaining < 0) newRemaining = 0;

  let status = newRemaining === 0 ? "completed" : "active";

  /* =========================
     UPDATE LOAN
  ========================= */

  const loanRef = doc(db, "loans", selectedLoan.id);

  await updateDoc(loanRef, {

    paid: newPaid,
    remaining: newRemaining,
    status,

    "schedule.lastPaymentDate": new Date().toISOString(),

    updatedAt: serverTimestamp()
  });

  /* =========================
     SAVE REPAYMENT
  ========================= */

  await addDoc(collection(db, "repayments"), {

    loanId: selectedLoan.id,
    memberId: selectedLoan.memberId,
    memberName: selectedLoan.memberName,

    amount,
    penalty,

    date: new Date().toISOString(),
    createdAt: serverTimestamp()
  });

  alert(
    penalty > 0
      ? `Paid with penalty: ${penalty.toFixed(2)} ETB`
      : "Payment successful"
  );

  document.getElementById("payAmount").value = "";
};

/* =========================
   REALTIME TABLE
========================= */

function loadLoans() {

  const table = document.getElementById("loanTable");

  onSnapshot(collection(db, "loans"), (snapshot) => {

    table.innerHTML = "";

    snapshot.forEach(docSnap => {

      const l = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${l.memberName}</td>
          <td>${l.principal}</td>
          <td>${l.paid || 0}</td>
          <td>${l.remaining}</td>
          <td>${l.schedule?.penaltyRate || 0}%</td>
          <td>
            <span class="status ${
              l.status === "active"
                ? "pending"
                : "active"
            }">
              ${l.status}
            </span>
          </td>
        </tr>
      `;
    });
  });
}

loadLoans();
