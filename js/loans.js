import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   CREATE LOAN
========================= */
window.createLoan = async function () {

  const memberId =
    selectedMember.id;

  const amount =
    Number(document.getElementById("loanAmount").value);

  const interest =
    Number(document.getElementById("interest").value);

  const months =
    Number(document.getElementById("months").value);

  if (!amount || !interest || !months) {
    return alert("All fields required");
  }

  /* =========================
     BANK CALCULATION
  ========================= */

  const interestAmount =
    amount * (interest / 100);

  const totalRepayment =
    amount + interestAmount;

  const monthlyPayment =
    totalRepayment / months;

  await addDoc(collection(db, "loans"), {

    uid: memberId,

    amount,
    interest,
    months,

    interestAmount,
    totalRepayment,
    monthlyPayment,

    paid: 0,
    remaining: totalRepayment,

    status: "active",

    createdAt: Timestamp.now(),

    createdBy: auth.currentUser.uid
  });

  alert("Loan created");
};
