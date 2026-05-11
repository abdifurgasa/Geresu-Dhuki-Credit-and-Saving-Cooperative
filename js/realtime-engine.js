import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

export const state = {
  members: [],
  savings: [],
  loans: [],
  repayments: [],
  transactions: []
};

/* =========================
   REALTIME MEMBERS
========================= */
onSnapshot(collection(db, "members"), (snap) => {

  state.members = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  updateDashboard();
});

/* =========================
   REALTIME SAVINGS
========================= */
onSnapshot(collection(db, "savings"), (snap) => {

  state.savings = snap.docs.map(d => d.data());

  updateDashboard();
});

/* =========================
   REALTIME LOANS
========================= */
onSnapshot(collection(db, "loans"), (snap) => {

  state.loans = snap.docs.map(d => d.data());

  updateDashboard();
});

/* =========================
   REALTIME REPAYMENTS
========================= */
onSnapshot(collection(db, "repayments"), (snap) => {

  state.repayments = snap.docs.map(d => d.data());

  updateDashboard();
});

/* =========================
   REALTIME TRANSACTIONS
========================= */
onSnapshot(collection(db, "transactions"), (snap) => {

  state.transactions = snap.docs.map(d => d.data());

  updateDashboard();
});

/* =========================
   CALCULATIONS
========================= */

function sum(arr, key = "amount") {
  return arr.reduce((t, i) => t + Number(i[key] || 0), 0);
}

/* =========================
   UPDATE DASHBOARD HOOK
========================= */
function updateDashboard() {

  const membersCount = state.members.length;

  const totalSavings = sum(state.savings);
  const totalLoans = sum(state.loans, "principal");
  const totalRepayments = sum(state.repayments);

  const profit = totalRepayments - totalLoans;

  /* Update UI (if elements exist) */
  if (document.getElementById("members"))
    document.getElementById("members").innerText = membersCount;

  if (document.getElementById("savings"))
    document.getElementById("savings").innerText = totalSavings + " ETB";

  if (document.getElementById("loans"))
    document.getElementById("loans").innerText = totalLoans + " ETB";

  if (document.getElementById("profit"))
    document.getElementById("profit").innerText = profit + " ETB";

  /* trigger charts if available */
  if (window.renderCharts) {
    window.renderCharts(state);
  }
}
