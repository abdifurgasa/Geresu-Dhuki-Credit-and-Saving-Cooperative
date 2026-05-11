import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   SELECTED LOAN
========================= */
let selectedLoan = null;

/* =========================
   SEARCH LOANS
========================= */
window.searchLoans = async function () {

  const keyword = document.getElementById("loanSearch").value.toLowerCase();

  const snap = await getDocs(collection(db, "loans"));

  const results = document.getElementById("searchResults");
  results.innerHTML = "";

  snap.forEach(docSnap => {

    const l = docSnap.data();

    if (
      l.memberName?.toLowerCase().includes(keyword) ||
      l.memberId?.includes(keyword)
    ) {

      const div = document.createElement("div");
      div.className = "result-item";

      div.innerText =
        `${l.memberName} - Remaining: ${l.remaining} ETB`;

      div.onclick = () => {

        selectedLoan = {
          id: docSnap.id,
          ...l
        };

        document.getElementById("selectedLoan").innerText =
          "Selected Loan: " + l.memberName;

        results.innerHTML = "";
      };

      results.appendChild(div);
    }
  });
};

/* =========================
   MAKE REPAYMENT
========================= */
window.makeRepayment = async function () {

  if (!selectedLoan) {
    alert("Select a loan first");
    return;
  }

  const amount = Number(document.getElementById("repayAmount").value);

  if (!amount || amount <= 0) {
    alert("Invalid repayment amount");
    return;
  }

  try {

    const loanRef = doc(db, "loans", selectedLoan.id);
    const loanSnap = await getDoc(loanRef);

    if (!loanSnap.exists()) return;

    const loan = loanSnap.data();

    let newPaid = (loan.paid || 0) + amount;
    let newRemaining = (loan.remaining || 0) - amount;

    if (newRemaining < 0) newRemaining = 0;

    let status = "active";

    if (newRemaining === 0) {
      status = "paid";
    }

    /* =========================
       UPDATE LOAN
    ========================= */

    await updateDoc(loanRef, {

      paid: newPaid,
      remaining: newRemaining,
      status: status

    });

    /* =========================
       REPAYMENT RECORD
    ========================= */

    await addDoc(collection(db, "repayments"), {

      loanId: selectedLoan.id,
      memberId: loan.memberId,
      amount: amount,
      date: serverTimestamp()

    });

    /* =========================
       TRANSACTION LOG
    ========================= */

    await addDoc(collection(db, "transactions"), {

      type: "repayment",
      memberId: loan.memberId,
      amount: amount,
      date: serverTimestamp()

    });

    alert("Repayment successful");

    document.getElementById("repayAmount").value = "";

  } catch (err) {

    console.error(err);
    alert("Repayment failed");

  }
};
