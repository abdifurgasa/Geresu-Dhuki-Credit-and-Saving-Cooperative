import { db } from "./firebase.js";
import { calculateLoan } from "./interestEngine.js";

import {
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD MEMBERS
========================= */
function loadMembers() {

  const select = document.getElementById("memberSelect");

  onSnapshot(collection(db, "members"), (snap) => {

    select.innerHTML = `<option value="">Select Member</option>`;

    snap.forEach(doc => {
      select.innerHTML += `
        <option value="${doc.data().name}">
          ${doc.data().name}
        </option>
      `;
    });

  });
}

/* =========================
   CREATE LOAN (WITH INTEREST)
========================= */
window.addLoan = async function () {

  const member = document.getElementById("memberSelect").value;
  const amount = Number(document.getElementById("amount").value);
  const rate = Number(document.getElementById("rate").value);
  const months = Number(document.getElementById("months").value);

  if (!member || !amount || !rate || !months) {
    return alert("Please fill all fields");
  }

  const calc = calculateLoan(amount, rate, months);

  try {

    // SAVE LOAN
    await addDoc(collection(db, "loans"), {
      member,
      principal: calc.principal,
      interest: calc.interest,
      amount: calc.total,
      monthlyInstallment: calc.monthly,
      paid: 0,
      balance: calc.total,
      rate,
      months,
      status: "active",
      date: new Date().toISOString().split("T")[0]
    });

    // SAVE TRANSACTION
    await addDoc(collection(db, "transactions"), {
      type: "Loan",
      member,
      amount: calc.total,
      description: `Loan (${rate}% interest)`,
      date: new Date().toISOString().split("T")[0]
    });

    alert("Loan created successfully");

  } catch (err) {
    console.error(err);
  }
};

/* =========================
   LIVE LOAN LIST
========================= */
function loadLoans() {

  const table = document.getElementById("loanTable");

  onSnapshot(collection(db, "loans"), (snap) => {

    table.innerHTML = "";

    snap.forEach(doc => {

      const d = doc.data();

      table.innerHTML += `
        <tr>
          <td>${d.member}</td>
          <td>$${d.principal}</td>
          <td>$${d.interest}</td>
          <td>$${d.amount}</td>
          <td>$${d.monthlyInstallment}</td>
          <td>${d.status}</td>
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
  loadMembers();
  loadLoans();
});
