import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD MEMBERS INTO SELECT
========================= */
function loadMembers() {
  const select = document.getElementById("memberSelect");

  onSnapshot(collection(db, "members"), (snap) => {
    select.innerHTML = `<option value="">Select Member</option>`;

    snap.forEach(docSnap => {
      let data = docSnap.data();

      select.innerHTML += `
        <option value="${data.name}">
          ${data.name}
        </option>
      `;
    });
  });
}

/* =========================
   ADD LOAN
========================= */
window.addLoan = async function () {

  let member = document.getElementById("memberSelect").value;
  let amount = document.getElementById("amount").value;
  let purpose = document.getElementById("purpose").value;

  if (!member || !amount) {
    return alert("Select member and enter amount");
  }

  amount = Number(amount);

  try {

    // 1. SAVE LOAN
    await addDoc(collection(db, "loans"), {
      member: member,
      amount: amount,
      purpose: purpose || "General loan",
      date: new Date().toISOString().split("T")[0],
      status: "active"
    });

    // 2. ADD TRANSACTION
    await addDoc(collection(db, "transactions"), {
      type: "Loan",
      member: member,
      amount: amount,
      description: purpose || "Loan issued",
      date: new Date().toISOString().split("T")[0]
    });

    document.getElementById("amount").value = "";
    document.getElementById("purpose").value = "";

    alert("Loan created successfully");

  } catch (err) {
    console.error(err);
  }
};

/* =========================
   LOAD LOANS HISTORY
========================= */
function loadLoans() {

  const table = document.getElementById("loanTable");

  const q = query(collection(db, "loans"), orderBy("date", "desc"));

  onSnapshot(q, (snap) => {

    table.innerHTML = "";

    snap.forEach(docSnap => {
      let d = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${d.member}</td>
          <td class="red">$${d.amount}</td>
          <td>${d.purpose}</td>
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
