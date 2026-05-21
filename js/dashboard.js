import { db, auth } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================================================
   ELEMENTS
========================================================= */

const membersEl = document.getElementById("members");
const savingsEl = document.getElementById("savings");
const loansEl = document.getElementById("loans");
const withdrawalsEl = document.getElementById("withdrawals");
const profitEl = document.getElementById("profit");
const roleBox = document.getElementById("roleBox");

let financeChart = null;

/* =========================================================
   AUTH + ROLE
========================================================= */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const role = localStorage.getItem("role") || "member";

  if (roleBox) {
    roleBox.innerText =
      role === "admin" ? "👑 ADMIN" : "👤 MEMBER";
  }
});

/* =========================================================
   REAL-TIME DASHBOARD ENGINE
========================================================= */

function startLiveDashboard() {

  const membersRef = collection(db, "members");
  const savingsRef = collection(db, "savings");
  const loansRef = collection(db, "loans");
  const withdrawalsRef = collection(db, "withdrawals");

  let membersCount = 0;
  let savingsTotal = 0;
  let loansTotal = 0;
  let withdrawalsTotal = 0;

  /* =========================
     MEMBERS LIVE
  ========================= */
  onSnapshot(membersRef, (snap) => {

    membersCount = snap.size;

    savingsTotal = 0;
    loansTotal = 0;

    snap.forEach(doc => {
      const d = doc.data();
      savingsTotal += Number(d.savings || 0);
      loansTotal += Number(d.loanTotal || 0);
    });

    updateUI();
  });

  /* =========================
     SAVINGS LIVE
  ========================= */
  onSnapshot(savingsRef, (snap) => {
    let total = 0;

    snap.forEach(doc => {
      total += Number(doc.data().amount || 0);
    });

    savingsTotal = total;

    updateUI();
  });

  /* =========================
     LOANS LIVE
  ========================= */
  onSnapshot(loansRef, (snap) => {
    let total = 0;

    snap.forEach(doc => {
      total += Number(doc.data().amount || 0);
    });

    loansTotal = total;

    updateUI();
  });

  /* =========================
     WITHDRAWALS LIVE
  ========================= */
  onSnapshot(withdrawalsRef, (snap) => {
    let total = 0;

    snap.forEach(doc => {
      total += Number(doc.data().amount || 0);
    });

    withdrawalsTotal = total;

    updateUI();
  });

  /* =========================
     UI UPDATE FUNCTION
  ========================= */
  function updateUI() {

    const profit = savingsTotal - loansTotal;

    if (membersEl) membersEl.innerText = membersCount;
    if (savingsEl) savingsEl.innerText = savingsTotal.toLocaleString() + " ETB";
    if (loansEl) loansEl.innerText = loansTotal.toLocaleString() + " ETB";
    if (withdrawalsEl) withdrawalsEl.innerText = withdrawalsTotal.toLocaleString() + " ETB";
    if (profitEl) profitEl.innerText = profit.toLocaleString() + " ETB";

    updateChart(savingsTotal, loansTotal, withdrawalsTotal, profit);
  }
}

/* =========================================================
   LIVE CHART (NO DUPLICATES)
========================================================= */

function updateChart(savings, loans, withdrawals, profit) {

  const ctx = document.getElementById("financeChart");

  if (!ctx) return;

  if (financeChart) {
    financeChart.destroy();
  }

  financeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Savings", "Loans", "Withdrawals", "Profit"],
      datasets: [{
        label: "Live Financial Dashboard",
        data: [savings, loans, withdrawals, profit],
        backgroundColor: ["#17a8d3", "#f59e0b", "#ef4444", "#22c55e"],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* =========================================================
   START SYSTEM
========================================================= */

startLiveDashboard();
