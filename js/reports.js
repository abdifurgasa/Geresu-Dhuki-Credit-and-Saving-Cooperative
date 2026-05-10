
import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */
const reportTable =
  document.getElementById("reportTable");

/* =========================
   GLOBAL REPORT DATA
========================= */
let reportData = {

  members: 0,
  savings: 0,
  loans: 0,
  repayments: 0,
  outstanding: 0,
  balance: 0
};

/* =========================
   LOAD REPORTS
========================= */
async function loadReports() {

  try {

    /* MEMBERS */
    const membersSnap =
      await getDocs(collection(db, "members"));

    reportData.members =
      membersSnap.size;

    /* SAVINGS */
    const savingsSnap =
      await getDocs(collection(db, "savings"));

    reportData.savings = 0;

    savingsSnap.forEach(doc => {

      reportData.savings +=
        doc.data().amount || 0;
    });

    /* LOANS */
    const loansSnap =
      await getDocs(collection(db, "loans"));

    reportData.loans = 0;
    reportData.outstanding = 0;

    loansSnap.forEach(doc => {

      const l = doc.data();

      reportData.loans +=
        l.total || 0;

      reportData.outstanding +=
        l.remaining || 0;
    });

    /* REPAYMENTS */
    const repaySnap =
      await getDocs(collection(db, "repayments"));

    reportData.repayments = 0;

    repaySnap.forEach(doc => {

      reportData.repayments +=
        doc.data().amount || 0;
    });

    /* NET BALANCE */
    reportData.balance =
      reportData.savings -
      reportData.outstanding;

    /* UPDATE UI */
    updateCards();

    loadTable();

    loadChart();

  }

  catch (err) {

    console.error(err);
  }
}

/* =========================
   UPDATE CARDS
========================= */
function updateCards() {

  document.getElementById("totalMembers").innerText =
    reportData.members;

  document.getElementById("totalSavings").innerText =
    reportData.savings + " ETB";

  document.getElementById("totalLoans").innerText =
    reportData.loans + " ETB";

  document.getElementById("totalRepayments").innerText =
    reportData.repayments + " ETB";

  document.getElementById("outstandingLoans").innerText =
    reportData.outstanding + " ETB";

  document.getElementById("netBalance").innerText =
    reportData.balance + " ETB";
}

/* =========================
   LOAD TABLE
========================= */
function loadTable() {

  reportTable.innerHTML = `

    <tr>
      <td>Total Savings</td>
      <td>${reportData.savings} ETB</td>
    </tr>

    <tr>
      <td>Total Loans</td>
      <td>${reportData.loans} ETB</td>
    </tr>

    <tr>
      <td>Total Repayments</td>
      <td>${reportData.repayments} ETB</td>
    </tr>

    <tr>
      <td>Outstanding Loans</td>
      <td>${reportData.outstanding} ETB</td>
    </tr>

    <tr>
      <td>Net Balance</td>
      <td>${reportData.balance} ETB</td>
    </tr>
  `;
}

/* =========================
   LOAD CHART
========================= */
function loadChart() {

  const ctx =
    document.getElementById("financeChart");

  new Chart(ctx, {

    type: "bar",

    data: {

      labels: [
        "Savings",
        "Loans",
        "Repayments"
      ],

      datasets: [{

        label: "ETB",

        data: [
          reportData.savings,
          reportData.loans,
          reportData.repayments
        ]
      }]
    }
  });
}

/* =========================
   PDF EXPORT
========================= */
window.downloadPDF = function () {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text(
    "SACCO Financial Report",
    20,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Members: ${reportData.members}`,
    20,
    40
  );

  doc.text(
    `Savings: ${reportData.savings} ETB`,
    20,
    50
  );

  doc.text(
    `Loans: ${reportData.loans} ETB`,
    20,
    60
  );

  doc.text(
    `Repayments: ${reportData.repayments} ETB`,
    20,
    70
  );

  doc.text(
    `Outstanding: ${reportData.outstanding} ETB`,
    20,
    80
  );

  doc.text(
    `Net Balance: ${reportData.balance} ETB`,
    20,
    90
  );

  doc.save("sacco-report.pdf");
};

/* =========================
   INIT
========================= */
loadReports();
