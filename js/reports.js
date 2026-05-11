import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL DATA STORE
========================= */

let report = {
  savings: [],
  loans: [],
  repayments: [],
  labels: []
};

/* =========================
   INIT REAL-TIME DATA
========================= */

function initAdvancedReports() {

  /* SAVINGS */
  onSnapshot(collection(db, "savings"), snap => {

    let total = 0;

    snap.forEach(d => total += d.data().amount || 0);

    report.savings.push(total);

    updateCharts();
  });

  /* LOANS */
  onSnapshot(collection(db, "loans"), snap => {

    let total = 0;
    let outstanding = 0;

    snap.forEach(d => {
      total += d.data().totalAmount || 0;
      outstanding += d.data().remaining || 0;
    });

    report.loans.push(total);
    report.labels.push(new Date().toLocaleDateString());

    report.outstanding = outstanding;

    updateCharts();
  });

  /* REPAYMENTS */
  onSnapshot(collection(db, "repayments"), snap => {

    let total = 0;

    snap.forEach(d => total += d.data().amount || 0);

    report.repayments.push(total);

    updateCharts();
  });
}

/* =========================
   MAIN CHART ENGINE
========================= */

let trendChart;
let barChart;
let pieChart;

/* =========================
   UPDATE ALL CHARTS
========================= */

function updateCharts() {

  renderTrendChart();
  renderBarChart();
  renderPieChart();
}

/* =========================
   1. TREND LINE CHART
========================= */

function renderTrendChart() {

  const ctx = document.getElementById("trendChart");

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {

    type: "line",

    data: {

      labels: report.labels,

      datasets: [

        {
          label: "Savings Trend",
          data: report.savings,
          borderColor: "green",
          fill: false
        },

        {
          label: "Loans Trend",
          data: report.loans,
          borderColor: "red",
          fill: false
        },

        {
          label: "Repayments Trend",
          data: report.repayments,
          borderColor: "blue",
          fill: false
        }

      ]
    }
  });
}

/* =========================
   2. BAR PERFORMANCE CHART
========================= */

function renderBarChart() {

  const ctx = document.getElementById("barChart");

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {

    type: "bar",

    data: {

      labels: ["Savings", "Loans", "Repayments"],

      datasets: [{

        label: "Financial Overview",

        data: [
          report.savings.at(-1) || 0,
          report.loans.at(-1) || 0,
          report.repayments.at(-1) || 0
        ]
      }]
    }
  });
}

/* =========================
   3. PIE CHART (PORTFOLIO)
========================= */

function renderPieChart() {

  const ctx = document.getElementById("pieChart");

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {

    type: "pie",

    data: {

      labels: [
        "Healthy Loans",
        "Outstanding Loans",
        "Completed Portion"
      ],

      datasets: [{

        data: [
          (report.loans.at(-1) || 0) - (report.outstanding || 0),
          report.outstanding || 0,
          report.repayments.at(-1) || 0
        ]
      }]
    }
  });
}

/* =========================
   INIT SYSTEM
========================= */

initAdvancedReports();
