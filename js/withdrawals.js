import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ================= FIREBASE ================= */
const auth = getAuth();
const ref = collection(db, "withdrawals");

/* ================= TABLE ================= */
const table = document.getElementById("withdrawTable");

/* ================= INIT ================= */
window.addEventListener("load", loadWithdrawals);

/* ================= MAKE WITHDRAWAL ================= */
window.makeWithdrawal = async function () {

  const withdrawer = document.getElementById("withdrawer").value.trim();
  const amount = Number(document.getElementById("withdrawAmount").value);
  const reason = document.getElementById("withdrawReason").value.trim();

  if (!withdrawer || !amount || !reason) {
    alert("Please fill all fields");
    return;
  }

  const user = auth.currentUser;
  const actionBy = user ? user.email : "Unknown";

  try {

    await addDoc(ref, {
      withdrawer,
      amount,
      reason,
      actionBy,
      createdAt: serverTimestamp()
    });

    alert("Withdrawal saved successfully");

    document.getElementById("withdrawer").value = "";
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("withdrawReason").value = "";

    loadWithdrawals();

  } catch (err) {

    console.error(err);
    alert("Error saving withdrawal");
  }
};

/* ================= LOAD ================= */
async function loadWithdrawals() {

  table.innerHTML = "";

  const snap = await getDocs(ref);

  let total = 0;

  snap.forEach(d => {

    const w = d.data();
    total += Number(w.amount || 0);

    const date = w.createdAt
      ? new Date(w.createdAt.toDate()).toLocaleString()
      : "-";

    table.innerHTML += `
      <tr>

        <td>${w.withdrawer}</td>
        <td>${Number(w.amount).toLocaleString()} ETB</td>
        <td>${w.reason}</td>
        <td>${w.actionBy || "-"}</td>
        <td>${date}</td>

      </tr>
    `;
  });

  document.getElementById("totalWithdrawals").innerText =
    total.toLocaleString() + " ETB";

  document.getElementById("withdrawCount").innerText =
    snap.size;
}
