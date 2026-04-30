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

  onSnapshot(collection(db, "members"), snap => {

    select.innerHTML = `<option value="">Select Member</option>`;

    snap.forEach(d => {
      select.innerHTML += `
        <option value="${d.data().name}">
          ${d.data().name}
        </option>
      `;
    });

  });
}

/* =========================
   CREATE LOAN (FULL + OVERDUE SUPPORT)
========================= */
window.addLoan = async function () {

  const member = document.getElementById("memberSelect").value;
  const amount = Number(document.getElementById("amount").value);
  const rate = Number(document.getElementById("rate").value);
  const months = Number(document.getElementById("months").value);

  if (!member || !amount || !rate || !months) {
    return alert("Fill all fields");
  }

  const calc = calculateLoan(amount, rate, months);

  try {

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

      // 🔥 OVERDUE SYSTEM
      dueDate: new Date(Date.now() + (months * 30 * 24 * 60 * 60 * 1000))
        .toISOString().split("T")[0],

      penaltyRate: 5,
      penalty: 0,
      lastPenaltyApplied: null,

      date: new Date().toISOString().split("T")[0]
    });

    await addDoc(collection(db, "transactions"), {
      type: "Loan",
      member,
      amount: calc.total,
      description: "Loan issued with interest",
      date: new Date().toISOString().split("T")[0]
    });

    alert("Loan created successfully");

  } catch (err) {
    console.error(err);
  }
};

/* =========================
   LOAD LOANS TABLE
========================= */
function loadLoans() {

  const table = document.getElementById("loanTable");

  onSnapshot(collection(db, "loans"), snap => {

    table.innerHTML = "";

    snap.forEach(d => {

      const x = d.data();

      table.innerHTML += `
        <tr>
          <td>${x.member}</td>
          <td>$${x.principal}</td>
          <td>$${x.interest}</td>
          <td>$${x.amount}</td>
          <td>$${x.monthlyInstallment}</td>

          <td>${x.dueDate}</td>

          <td class="red">$${x.penalty || 0}</td>

          <td>$${x.balance}</td>

          <td>${x.status}</td>
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
