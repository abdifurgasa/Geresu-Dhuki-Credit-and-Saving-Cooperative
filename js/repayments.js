import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

let selectedLoan = null;

/* =========================
   SEARCH LOANS
========================= */

window.searchLoans = async function () {

  const keyword =
    document.getElementById("memberSearch")
      .value
      .toLowerCase()
      .trim();

  const box =
    document.getElementById("searchResults");

  box.innerHTML = "";

  if (!keyword) return;

  const snapshot =
    await getDocs(
      collection(db, "loans")
    );

  snapshot.forEach(docSnap => {

    const loan = docSnap.data();

    const text = `
      ${loan.memberName}
      ${loan.phone || ""}
    `.toLowerCase();

    if (text.includes(keyword)) {

      const div =
        document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        👤 ${loan.memberName}<br>
        🏦 Loan: ${loan.totalAmount} ETB<br>
        💰 Remaining: ${loan.remaining} ETB
      `;

      div.onclick = () =>
        selectLoan(docSnap.id, loan);

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

  document.getElementById(
    "selectedLoan"
  ).innerHTML = `
    👤 ${loan.memberName}<br>
    🏦 Loan: ${loan.totalAmount} ETB<br>
    💰 Paid: ${loan.paid || 0} ETB<br>
    📉 Remaining: ${loan.remaining} ETB<br>
    📊 Status: ${loan.status}
  `;

  document.getElementById(
    "searchResults"
  ).innerHTML = "";
}

/* =========================
   MAKE REPAYMENT
========================= */

window.makeRepayment = async function () {

  if (!selectedLoan) {

    alert("Select loan first");
    return;
  }

  const amount =
    Number(
      document.getElementById("payAmount").value
    );

  if (!amount || amount <= 0) {

    alert("Invalid amount");
    return;
  }

  let paid =
    Number(selectedLoan.paid || 0);

  let remaining =
    Number(selectedLoan.remaining || 0);

  let newPaid = paid + amount;

  let newRemaining = remaining - amount;

  if (newRemaining < 0) newRemaining = 0;

  let status =
    newRemaining === 0
      ? "completed"
      : "active";

  /* =========================
     UPDATE LOAN
  ========================= */

  const loanRef =
    doc(db, "loans", selectedLoan.id);

  await updateDoc(loanRef, {

    paid: newPaid,
    remaining: newRemaining,
    status,
    updatedAt: serverTimestamp()
  });

  /* =========================
     SAVE REPAYMENT RECORD
  ========================= */

  await addDoc(
    collection(db, "repayments"),
    {
      loanId: selectedLoan.id,
      memberId: selectedLoan.memberId,
      memberName: selectedLoan.memberName,

      amount,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    }
  );

  alert("Repayment successful");

  document.getElementById("payAmount").value = "";
};

/* =========================
   REALTIME LOAN TABLE
========================= */

function loadLoans() {

  const table =
    document.getElementById("loanTable");

  onSnapshot(
    collection(db, "loans"),
    (snapshot) => {

      table.innerHTML = "";

      snapshot.forEach(docSnap => {

        const l = docSnap.data();

        table.innerHTML += `
          <tr>
            <td>${l.memberName}</td>
            <td>${l.totalAmount} ETB</td>
            <td>${l.paid || 0}</td>
            <td>${l.remaining}</td>
            <td>
              <span class="status ${
                l.status === "completed"
                  ? "active"
                  : "pending"
              }">
                ${l.status}
              </span>
            </td>
          </tr>
        `;
      });
    }
  );
}

/* =========================
   INIT
========================= */

loadLoans();
