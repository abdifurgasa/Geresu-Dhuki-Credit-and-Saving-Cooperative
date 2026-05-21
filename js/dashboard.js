import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================================================
   ELEMENTS
========================================================= */

const membersEl =
  document.getElementById("members");

const savingsEl =
  document.getElementById("savings");

const loansEl =
  document.getElementById("loans");

const withdrawalsEl =
  document.getElementById("withdrawals");

const profitEl =
  document.getElementById("profit");

const roleBox =
  document.getElementById("roleBox");

/* =========================================================
   AUTH ROLE SYSTEM
========================================================= */

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;

  }

  /* ADMIN / MEMBER ROLE */
  const role =
    localStorage.getItem("role") || "member";

  if (roleBox) {

    roleBox.innerText =
      role === "admin"
        ? "👑 ADMIN"
        : "👤 MEMBER";

  }

  /* ADMIN ONLY */
  const adminOnly =
    document.querySelectorAll(".admin-only");

  adminOnly.forEach((item) => {

    item.style.display =
      role === "admin"
        ? "flex"
        : "none";

  });

});

/* =========================================================
   LOAD DASHBOARD DATA
========================================================= */

async function loadDashboard() {

  try {

    /* MEMBERS */
    const membersSnap =
      await getDocs(
        collection(db, "members")
      );

    let totalMembers =
      membersSnap.size;

    let totalSavings = 0;

    let totalLoans = 0;

    /* LOOP MEMBERS */
    membersSnap.forEach((doc) => {

      const data = doc.data();

      totalSavings +=
        Number(data.savings || 0);

      totalLoans +=
        Number(data.loanTotal || 0);

    });

    /* WITHDRAWALS */
    const withdrawSnap =
      await getDocs(
        collection(db, "withdrawals")
      );

    let totalWithdrawals = 0;

    withdrawSnap.forEach((doc) => {

      const data = doc.data();

      totalWithdrawals +=
        Number(data.amount || 0);

    });

    /* PROFIT */
    const profit =
      totalSavings - totalLoans;

    /* UPDATE UI */
    if (membersEl) {

      membersEl.innerText =
        totalMembers;

    }

    if (savingsEl) {

      savingsEl.innerText =
        totalSavings.toLocaleString()
        + " ETB";

    }

    if (loansEl) {

      loansEl.innerText =
        totalLoans.toLocaleString()
        + " ETB";

    }

    if (withdrawalsEl) {

      withdrawalsEl.innerText =
        totalWithdrawals.toLocaleString()
        + " ETB";

    }

    if (profitEl) {

      profitEl.innerText =
        profit.toLocaleString()
        + " ETB";

    }

    /* CHART */
    loadChart(
      totalSavings,
      totalLoans,
      totalWithdrawals,
      profit
    );

  } catch (error) {

    console.error(error);

  }

}

/* =========================================================
   CHART
========================================================= */

function loadChart(

  savings,
  loans,
  withdrawals,
  profit

) {

  const ctx =
    document.getElementById("financeChart");

  if (!ctx) return;

  new Chart(ctx, {

    type: "bar",

    data: {

      labels: [
        "Savings",
        "Loans",
        "Withdrawals",
        "Profit"
      ],

      datasets: [{

        label:
          "Financial Report",

        data: [
          savings,
          loans,
          withdrawals,
          profit
        ],

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

        legend: {

          display: false

        }

      }

    }

  });

}

/* =========================================================
   START
========================================================= */

loadDashboard();
