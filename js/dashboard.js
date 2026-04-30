import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD STATS (REAL FIRESTORE)
========================= */
function loadStats(){

  // MEMBERS
  onSnapshot(collection(db, "members"), (snap) => {
    document.querySelector(".members h2").innerText = snap.size;
  });

  // SAVINGS TOTAL
  onSnapshot(collection(db, "savings"), (snap) => {
    let total = 0;
    snap.forEach(d => total += Number(d.data().amount || 0));

    document.querySelector(".savings h2").innerText =
      "$" + total.toLocaleString();
  });

  // LOANS TOTAL
  onSnapshot(collection(db, "loans"), (snap) => {
    let total = 0;
    snap.forEach(d => total += Number(d.data().amount || 0));

    document.querySelector(".loans h2").innerText =
      "$" + total.toLocaleString();
  });

  // PROFIT
  onSnapshot(collection(db, "savings"), (s1) => {
    onSnapshot(collection(db, "loans"), (s2) => {

      let savings = 0;
      let loans = 0;

      s1.forEach(d => savings += Number(d.data().amount || 0));
      s2.forEach(d => loans += Number(d.data().amount || 0));

      let profit = savings - loans;

      document.querySelector(".profit h2").innerText =
        "$" + profit.toLocaleString();

    });
  });

}

/* =========================
   LOAD TRANSACTIONS
========================= */
function loadTransactions(){

  const table = document.getElementById("transactionTable");

  const q = query(
    collection(db, "transactions"),
    orderBy("date", "desc"),
    limit(25)
  );

  onSnapshot(q, (snap) => {

    table.innerHTML = "";

    snap.forEach(doc => {
      let d = doc.data();

      let color = "green";
      if(d.type === "Loan") color = "blue";
      if(d.type === "Repayment") color = "red";

      table.innerHTML += `
        <tr>
          <td>${d.type}</td>
          <td>${d.member}</td>
          <td>${d.description || "-"}</td>
          <td class="${color}">$${d.amount}</td>
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
  loadStats();
  loadTransactions();
});
import { protectPage } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  protectPage();
});
