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
   ADD SAVING
========================= */
window.addSaving = async function () {

  let member = document.getElementById("memberSelect").value;
  let amount = document.getElementById("amount").value;

  if (!member || !amount) {
    return alert("Select member and enter amount");
  }

  amount = Number(amount);

  try {
    // 1. SAVE TO SAVINGS COLLECTION
    await addDoc(collection(db, "savings"), {
      member: member,
      amount: amount,
      date: new Date().toISOString().split("T")[0]
    });

    // 2. ALSO ADD TO TRANSACTIONS
    await addDoc(collection(db, "transactions"), {
      type: "Saving",
      member: member,
      amount: amount,
      description: "Monthly savings deposit",
      date: new Date().toISOString().split("T")[0]
    });

    document.getElementById("amount").value = "";

    alert("Saving recorded successfully");

  } catch (err) {
    console.error(err);
  }
};

/* =========================
   LOAD SAVINGS HISTORY
========================= */
function loadSavings() {

  const table = document.getElementById("savingsTable");

  const q = query(collection(db, "savings"), orderBy("date", "desc"));

  onSnapshot(q, (snap) => {

    table.innerHTML = "";

    snap.forEach(docSnap => {
      let d = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${d.member}</td>
          <td class="green">$${d.amount}</td>
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
  loadSavings();
});
