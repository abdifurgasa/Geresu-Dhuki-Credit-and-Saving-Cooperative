import { db, auth } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================================================
   ELEMENTS
========================================================= */

const membersEl = document.getElementById("members");
const savingsEl = document.getElementById("savings");
const loansEl = document.getElementById("loans");
const withdrawalsEl = document.getElementById("withdrawals");
const profitEl = document.getElementById("profit");

const roleBox = document.getElementById("roleBox");

/* =========================================================
   AUTH + ROLE SYSTEM
========================================================= */

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const role = localStorage.getItem("role") || "member";

  if (roleBox) {
    roleBox.innerText =
      role === "admin"
        ? "👑 ADMIN"
        : role === "cashier"
          ? "💼 CASHIER"
          : "👤 MEMBER";
  }

  /* ADMIN ONLY ELEMENTS */
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = role === "admin" ? "flex" : "none";
  });

});

/* =========================================================
   ANIMATED COUNTER
========================================================= */

function animateValue(el, start, end, duration = 800) {

  if (!el) return;

  let startTimestamp = null;

  const step = (timestamp) => {

    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    const value = Math.floor(progress * (end - start) + start);

    el.innerText = value.toLocaleString();

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }

  };

  window.requestAnimationFrame(step);
}

/* =========================================================
   REAL-TIME DASHBOARD
========================================================= */

function loadRealtimeDashboard() {

  /* MEMBERS */
  onSnapshot(collection(db, "members"), (snapshot) => {

    let totalMembers = snapshot.size;
    let totalSavings = 0;
    let totalLoans = 0;

    snapshot.forEach(doc => {
      const d = doc.data();
      totalSavings += Number(d.savings || 0);
      totalLoans += Number(d.loanTotal || 0);
    });

    animateValue(membersEl, 0, totalMembers);

    animateValue(
      savingsEl,
      0,
      totalSavings
    );
    savingsEl.innerText = totalSavings.toLocaleString() + " ETB";

    animateValue(loansEl, 0, totalLoans);
    loansEl.innerText = totalLoans.toLocaleString() + " ETB";

    updateChart();

  });

  /* WITHDRAWALS */
  onSnapshot(collection(db, "withdrawals"), (snapshot) => {

    let totalWithdrawals = 0;

    snapshot.forEach(doc => {
      totalWithdrawals += Number(doc.data().amount || 0);
    });

    animateValue(withdrawalsEl, 0, totalWithdrawals);
    withdrawalsEl.innerText = totalWithdrawals.toLocaleString() + " ETB";

    updateChart();

  });

}

/* =========================================================
   PROFIT CALCULATION
========================================================= */

let lastSavings = 0;
let lastLoans = 0;
let lastWithdrawals = 0;

/* =========================================================
   CHART
========================================================= */

let chart;

function initChart() {

  const ctx = document.getElementById("financeChart");

  if (!ctx) return;

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Savings", "Loans", "Withdrawals", "Profit"],
      datasets: [{
        label: "SACCO Overview",
        data: [0, 0, 0, 0],
        backgroundColor: [
          "#17a8d3",
          "#f59e0b",
          "#ef4444",
          "#22c55e"
        ],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });

}

/* =========================================================
   UPDATE CHART (LIVE SYNC)
========================================================= */

function updateChart() {

  if (!chart) return;

  const savings =
    parseFloat(savingsEl.innerText.replace(/[^0-9]/g, "")) || 0;

  const loans =
    parseFloat(loansEl.innerText.replace(/[^0-9]/g, "")) || 0;

  const withdrawals =
    parseFloat(withdrawalsEl.innerText.replace(/[^0-9]/g, "")) || 0;

  const profit =
    savings - loans - withdrawals;

  animateValue(profitEl, 0, profit);
  profitEl.innerText = profit.toLocaleString() + " ETB";

  chart.data.datasets[0].data = [
    savings,
    loans,
    withdrawals,
    profit
  ];

  chart.update();

}

/* =========================================================
   START SYSTEM
========================================================= */

initChart();
loadRealtimeDashboard();
