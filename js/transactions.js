import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const table = document.getElementById("txnTable");

function loadTransactions() {

  const q = query(collection(db, "transactions"), orderBy("date", "desc"));

  onSnapshot(q, (snap) => {

    table.innerHTML = "";

    snap.forEach(doc => {

      const d = doc.data();

      let colorClass = "";

      if (d.type === "Loan") colorClass = "blue";
      if (d.type === "Saving") colorClass = "green";
      if (d.type === "Penalty") colorClass = "red";
      if (d.type === "Repayment") colorClass = "orange";

      table.innerHTML += `
        <tr class="${colorClass}">
          <td>${d.type}</td>
          <td>${d.member || "-"}</td>
          <td>$${d.amount}</td>
          <td>${d.date}</td>
          <td>${d.description || ""}</td>
        </tr>
      `;
    });

  });
}

document.addEventListener("DOMContentLoaded", loadTransactions);
