import { db } from "./firebase.js";

import {
  doc,
  updateDoc,
  getDoc,
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   REPAY LOAN
========================= */
window.repayLoan = async function (loanId) {

  const amount =
    Number(prompt("Repayment amount"));

  if (!amount) return;

  const ref =
    doc(db, "loans", loanId);

  const snap =
    await getDoc(ref);

  const loan =
    snap.data();

  const paid =
    loan.paid + amount;

  const remaining =
    loan.remaining - amount;

  let status = "active";

  if (remaining <= 0) {
    status = "completed";
  }

  await updateDoc(ref, {

    paid,
    remaining,
    status
  });

  /* SAVE TRANSACTION */
  await addDoc(collection(db, "transactions"), {

    uid: loan.uid,

    type: "loan_repayment",

    amount,

    date: new Date()
  });

  alert("Repayment successful");
};
