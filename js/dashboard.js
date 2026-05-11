import { db, auth } from "./firebase.js";

import {
  collection,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   SIDEBAR TOGGLE
========================= */

const sidebar = document.getElementById("sidebar");

if (localStorage.getItem("sidebar") === "collapsed") {
  sidebar.classList.add("collapsed");
}

window.toggleSidebar = function () {

  sidebar.classList.toggle("collapsed");

  localStorage.setItem(
    "sidebar",
    sidebar.classList.contains("collapsed")
      ? "collapsed"
      : "expanded"
  );
};

/* =========================
   LOGOUT
========================= */

window.logoutUser = async function () {

  await auth.signOut();

  localStorage.clear();

  window.location.href = "index.html";
};

/* =========================
   ROLE CONTROL
========================= */

const role = localStorage.getItem("role");

if (role !== "admin") {

  document.querySelectorAll(".admin-only")
    .forEach(el => el.style.display = "none");
}

/* =========================
   REALTIME DASHBOARD
========================= */

let savingsChart;
let repaymentChart;

/* LOAD ALL DATA */
async function loadDashboard() {

  let totalMembers = 0;
  let totalSavings = 0;
  let totalLoans = 0;
  let totalRepayments = 0;

  /* =========================
     MEMBERS
  ========================= */

  onSnapshot(collection(db, "members"), (snapshot) => {

    totalMembers = snapshot.size;

    document.getElementById("members").innerText =
      totalMembers;
  });

  /* =========================
     SAVINGS
  ========================= */

  onSnapshot(collection(db, "savings"), (snapshot) => {

    totalSavings = 0;

    snapshot.forEach(doc => {
      totalSavings += Number(doc.data().amount || 0);
    });

    document.getElementById("savings").innerText =
      totalSavings.toLocaleString() + " ETB";

    updateCharts(
      totalSavings,
      totalLoans,
      totalRepayments
    );
  });

  /* =========================
     LOANS
  ========================= */

  onSnapshot(collection(db, "loans"), (snapshot) => {

    totalLoans = 0;

    snapshot.forEach(doc => {
      totalLoans += Number(doc.data().totalAmount || 0);
    });

    document.getElementById("loans").innerText =
      totalLoans.toLocaleString() + " ETB";

    updateProfit(
      totalSavings,
      totalLoans,
      totalRepayments
    );

    updateCharts(
      totalSavings,
      totalLoans,
      totalRepayments
    );
  });

  /* =========================
     REPAYMENTS
  ========================= */

  onSnapshot(collection(db, "repayments"), (snapshot) => {

    totalRepayments = 0;

    snapshot.forEach(doc => {
      totalRepayments += Number(doc.data().amount || 0);
    });

    updateProfit(
      totalSavings,
      totalLoans,
      totalRepayments
    );

    updateCharts(
      totalSavings,
      totalLoans,
      totalRepayments
    );
  });
}

/* =========================
   PROFIT ENGINE
========================= */

function updateProfit(
  savings,
  loans,
  repayments
) {

  const profit = repayments - loans;

  document.getElementById("profit").innerText =
    profit.toLocaleString() + " ETB";
}

/* =========================
   CHART SYSTEM
========================= */

function updateCharts(
  savings,
  loans,
  repayments
) {

  /* =========================
     SAVINGS VS LOANS
  ========================= */

  const ctx1 =
    document.getElementById("dashboardChart");

  if (ctx1) {

    if (savingsChart) {
      savingsChart.destroy();
    }

    savingsChart = new Chart(ctx1, {

      type: "bar",

      data: {

        labels: [
          "Savings",
          "Loans"
        ],

        datasets: [{
          label: "Financial Overview",
          data: [
            savings,
            loans
          ]
        }]
      }
    });
  }

  /* =========================
     LOANS VS REPAYMENTS
  ========================= */

  const ctx2 =
    document.getElementById("repaymentChart");

  if (ctx2) {

    if (repaymentChart) {
      repaymentChart.destroy();
    }

    repaymentChart = new Chart(ctx2, {

      type: "doughnut",

      data: {

        labels: [
          "Loans",
          "Repayments"
        ],

        datasets: [{
          label: "Repayment Analytics",
          data: [
            loans,
            repayments
          ]
        }]
      }
    });
  }
}

/* =========================
   ACTIVE MENU
========================= */

document.querySelectorAll(".nav-item")
.forEach(link => {

  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});

/* START */
loadDashboard();
