import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

let report = {
  members: 0,
  savings: 0,
  loans: 0,
  repayments: 0,
  outstanding: 0,
  netBalance: 0,
  risk: 0
};

/* =========================
   REAL-TIME REPORT ENGINE
========================= */

function initReports() {

  /* MEMBERS */
  onSnapshot(collection(db, "members"), snap => {
    report.members = snap.size;
    updateUI();
  });

  /* SAVINGS */
  onSnapshot(collection(db, "savings"), snap => {

    report.savings = 0;

    snap.forEach(d => {
      report.savings += Number(d.data().amount || 0);
    });

    updateUI();
  });

  /* LOANS */
  onSnapshot(collection(db, "loans"), snap => {

    report.loans = 0;
    report.outstanding = 0;

    snap.forEach(d => {

      const l = d.data();

      report.loans += Number(l.totalAmount || 0);

      report.outstanding += Number(l.remaining || 0);
    });

    updateUI();
  });

  /* REPAYMENTS */
  onSnapshot(collection(db, "repayments"), snap => {

    report.repayments = 0;

    snap.forEach(d => {
      report.repayments += Number(d.data().amount || 0);
    });

    updateUI();
  });
}

/* =========================
   FINANCIAL ANALYSIS ENGINE
========================= */

function updateUI() {

  /* NET BALANCE */
  report.netBalance =
    report.savings - report.outstanding;

  /* RISK CALCULATION */
  report.risk =
    report.loans > 0
      ? ((report.outstanding / report.loans) * 100)
      : 0;

  /* UI UPDATES */
  document.getElementById("totalMembers").innerText =
    report.members;

  document.getElementById("totalSavings").innerText =
    report.savings.toLocaleString() + " ETB";

  document.getElementById("totalLoans").innerText =
    report.loans.toLocaleString() + " ETB";

  document.getElementById("totalRepayments").innerText =
    report.repayments.toLocaleString() + " ETB";

  document.getElementById("outstandingLoans").innerText =
    report.outstanding.toLocaleString() + " ETB";

  document.getElementById("netBalance").innerText =
    report.netBalance.toLocaleString() + " ETB";

  document.getElementById("riskLevel").innerText =
    report.risk.toFixed(2) + "%";
}

/* =========================
   CHART SYSTEM (FIXED)
========================= */

function loadChart() {

  const ctx = document.getElementById("financeChart");

  new Chart(ctx, {

    type: "doughnut",

    data: {

      labels: ["Savings", "Loans", "Repayments"],

      datasets: [{

        data: [
          report.savings,
          report.loans,
          report.repayments
        ]
      }]
    }
  });
}

/* =========================
   PDF EXPORT (ENHANCED)
========================= */

window.downloadPDF = function () {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("SACCO Financial Report", 20, 20);

  doc.setFontSize(12);

  doc.text(`Members: ${report.members}`, 20, 40);
  doc.text(`Savings: ${report.savings} ETB`, 20, 50);
  doc.text(`Loans: ${report.loans} ETB`, 20, 60);
  doc.text(`Repayments: ${report.repayments} ETB`, 20, 70);
  doc.text(`Outstanding: ${report.outstanding} ETB`, 20, 80);
  doc.text(`Net Balance: ${report.netBalance} ETB`, 20, 90);
  doc.text(`Risk Level: ${report.risk.toFixed(2)}%`, 20, 100);

  doc.save("sacco-report.pdf");
};

/* =========================
   INIT SYSTEM
========================= */

initReports();
