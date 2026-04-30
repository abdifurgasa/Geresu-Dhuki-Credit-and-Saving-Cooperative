import { db } from "./firebase.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let transactions = [];

/* =========================
   LOAD ALL TRANSACTIONS
========================= */
function loadData() {

  onSnapshot(collection(db, "transactions"), (snap) => {

    transactions = [];

    snap.forEach(doc => {
      transactions.push(doc.data());
    });

    calculateTotals(transactions);
    renderTable(transactions);

  });
}

/* =========================
   CALCULATE TOTALS
========================= */
function calculateTotals(data) {

  let income = 0;
  let loans = 0;
  let savings = 0;
  let penalty = 0;

  data.forEach(t => {

    if (t.type === "Saving") savings += t.amount;
    if (t.type === "Loan") loans += t.amount;
    if (t.type === "Penalty") penalty += t.amount;

  });

  income = savings - loans;

  document.getElementById("income").innerText = "$" + income;
  document.getElementById("loans").innerText = "$" + loans;
  document.getElementById("savings").innerText = "$" + savings;
  document.getElementById("penalty").innerText = "$" + penalty;
}

/* =========================
   TABLE RENDER
========================= */
function renderTable(data) {

  const table = document.getElementById("reportTable");
  table.innerHTML = "";

  data.forEach(t => {

    table.innerHTML += `
      <tr>
        <td>${t.type}</td>
        <td>${t.member || "-"}</td>
        <td>$${t.amount}</td>
        <td>${t.date}</td>
      </tr>
    `;
  });
}

/* =========================
   DATE FILTER
========================= */
window.loadReport = function () {

  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  const filtered = transactions.filter(t => {

    if (!from || !to) return true;

    return t.date >= from && t.date <= to;

  });

  calculateTotals(filtered);
  renderTable(filtered);
};

/* INIT */
document.addEventListener("DOMContentLoaded", loadData);
