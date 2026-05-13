import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD SAVINGS HISTORY
========================= */

onSnapshot(collection(db, "savings"), snap => {

  const table = document.getElementById("savingsTable");
  table.innerHTML = "";

  snap.forEach(docSnap => {

    const s = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${s.memberId}</td>
        <td>${s.amount} ETB</td>
        <td>${s.date}</td>
      </tr>
    `;
  });

});

/* =========================
   ADD SAVINGS (MAIN LOGIC)
========================= */

window.addSavings = async function () {

  const memberId = document.getElementById("memberId").value;
  const amount = Number(document.getElementById("amount").value);

  if (!memberId || amount <= 0) {
    alert("Invalid input");
    return;
  }

  /* SAVE TRANSACTION */
  await addDoc(collection(db, "savings"), {
    memberId,
    amount,
    date: new Date().toISOString()
  });

  /* UPDATE MEMBER BALANCE */
  const memberRef = doc(db, "members", memberId);
  const memberSnap = await getDoc(memberRef);

  if (memberSnap.exists()) {

    await updateDoc(memberRef, {
      savings: increment(amount)
    });

  }

  alert("Savings added successfully");

  document.getElementById("memberId").value = "";
  document.getElementById("amount").value = "";
};
