import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ================= FIREBASE ================= */
const auth = getAuth();
const withdrawalsRef = collection(db, "withdrawals");

/* ================= TABLE ================= */
const table = document.getElementById("withdrawTable");

/* ================= SAVE WITHDRAWAL ================= */
window.saveWithdrawal = async function () {

  const withdrawer =
    document.getElementById("withdrawer").value.trim();

  const amount =
    Number(document.getElementById("amount").value);

  const reason =
    document.getElementById("reason").value.trim();

  if (!withdrawer || !amount || !reason) {
    alert("Fill all fields");
    return;
  }

  if (amount <= 0) {
    alert("Invalid amount");
    return;
  }

  /* 👇 WHO DID ACTION (REAL AUTH USER) */
  const user = auth.currentUser;

  const actionBy = user
    ? user.email
    : "Unknown User";

  try {

    await addDoc(withdrawalsRef, {

      withdrawer,
      amount,
      reason,

      actionBy,   // ✅ WHO DID IT

      createdAt: serverTimestamp()

    });

    alert("Withdrawal saved");

    closeModal();

    loadWithdrawals();

  } catch (e) {

    console.error(e);

    alert("Error saving withdrawal");
  }
};

/* ================= LOAD ================= */
async function loadWithdrawals() {

  table.innerHTML = "";

  const snap = await getDocs(withdrawalsRef);

  let total = 0;

  snap.forEach(d => {

    const w = d.data();

    total += Number(w.amount || 0);

    table.innerHTML += `

      <tr>

        <td>${w.withdrawer}</td>

        <td>${Number(w.amount).toLocaleString()} ETB</td>

        <td>${w.reason}</td>

        <td>${w.actionBy || "-"}</td>

        <td>${w.createdAt ? "Saved" : ""}</td>

        <td>
          <button class="btn danger"
            onclick="deleteWithdrawal('${d.id}')">
            Delete
          </button>
        </td>

      </tr>
    `;
  });

  /* optional dashboard sync */
  const el = document.getElementById("totalWithdrawals");
  if (el) el.innerText = total.toLocaleString() + " ETB";
}

/* ================= DELETE ================= */
window.deleteWithdrawal = async function (id) {

  if (!confirm("Delete this withdrawal?")) return;

  await deleteDoc(doc(db, "withdrawals", id));

  alert("Deleted");

  loadWithdrawals();
};

/* ================= INIT ================= */
window.addEventListener("load", loadWithdrawals);
