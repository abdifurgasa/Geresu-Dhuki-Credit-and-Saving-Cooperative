import { db } from "./firebase.js";

import {
  collection,
  onSnapshot

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   SIDEBAR COLLAPSE
========================= */

const sidebar = document.getElementById("sidebar");

if(localStorage.getItem("sidebar") === "collapsed"){
  sidebar.classList.add("collapsed");
}

window.toggleSidebar = function(){

  sidebar.classList.toggle("collapsed");

  localStorage.setItem(
    "sidebar",
    sidebar.classList.contains("collapsed")
      ? "collapsed"
      : "expanded"
  );
};

/* =========================
   ROLE DISPLAY
========================= */

const role = localStorage.getItem("role") || "member";

const roleBox = document.getElementById("roleBox");

if(roleBox){
  roleBox.innerHTML = `👑 ${role.toUpperCase()}`;
}

/* =========================
   DASHBOARD DATA
========================= */

let totalMembers = 0;
let totalSavings = 0;
let totalLoans = 0;
let totalRepayments = 0;
let totalProfit = 0;

/* =========================
   MEMBERS
========================= */

onSnapshot(collection(db, "members"), snapshot => {

  totalMembers = snapshot.size;

  document.getElementById("members").innerText = totalMembers;

  updateCharts();
});

/* =========================
   SAVINGS
========================= */

onSnapshot(collection(db, "savings"), snapshot => {

  totalSavings = 0;

  snapshot.forEach(doc => {
    totalSavings += Number(doc.data().amount || 0);
  });

  document.getElementById("savings")
  .innerText = totalSavings.toLocaleString() + " ETB";

  calculateProfit();
  updateCharts();
});

/* =========================
   LOANS
========================= */

onSnapshot(collection(db, "loans"), snapshot => {

  totalLoans = 0;

  snapshot.forEach(doc => {
    totalLoans += Number(doc.data().principal || 0);
  });

  document.getElementById("loans")
  .innerText = totalLoans.toLocaleString() + " ETB";

  calculateProfit();
  updateCharts();
});

/* =========================
   REPAYMENTS
========================= */

onSnapshot(collection(db, "repayments"), snapshot => {

  totalRepayments = 0;

  snapshot.forEach(doc => {
    totalRepayments += Number(doc.data().amount || 0);
  });

  calculateProfit();
  updateRepaymentChart();
});

/* =========================
   PROFIT ENGINE
========================= */

function calculateProfit(){

  totalProfit = totalRepayments - totalLoans;

  document.getElementById("profit")
  .innerText = totalProfit.toLocaleString() + " ETB";
}

/* =========================
   DASHBOARD CHART
========================= */

let dashboardChart;

function updateCharts(){

  const ctx = document
    .getElementById("dashboardChart")
    .getContext("2d");

  if(dashboardChart){
    dashboardChart.destroy();
  }

  dashboardChart = new Chart(ctx, {

    type: "bar",

    data: {

      labels: [
        "Members",
        "Savings",
        "Loans"
      ],

      datasets: [{

        label: "Financial Analytics",

        data: [
          totalMembers,
          totalSavings,
          totalLoans
        ],

        borderWidth: 2

      }]
    },

    options: {
      responsive: true
    }
  });
}

/* =========================
   REPAYMENT CHART
========================= */

let repaymentChart;

function updateRepaymentChart(){

  const ctx = document
    .getElementById("repaymentChart")
    .getContext("2d");

  if(repaymentChart){
    repaymentChart.destroy();
  }

  repaymentChart = new Chart(ctx, {

    type: "line",

    data: {

      labels: [
        "Loans",
        "Repayments"
      ],

      datasets: [{

        label: "Loans vs Repayments",

        data: [
          totalLoans,
          totalRepayments
        ],

        borderWidth: 3,
        tension: 0.3

      }]
    },

    options: {
      responsive: true
    }
  });
}

/* =========================
   ACTIVE MENU
========================= */

document.querySelectorAll(".nav-item")
.forEach(link => {

  if(link.href === window.location.href){
    link.classList.add("active");
  }
});
