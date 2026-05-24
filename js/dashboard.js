import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ======================================================
   ELEMENTS
====================================================== */

const membersEl = document.getElementById("members");
const savingsEl = document.getElementById("savings");
const loansEl = document.getElementById("loans");
const withdrawalsEl = document.getElementById("withdrawals");
const profitEl = document.getElementById("profit");

const logoutBtn = document.getElementById("logoutBtn");
const roleBox = document.getElementById("roleBox");

/* ======================================================
   SIDEBAR TOGGLE
====================================================== */

window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
  document.getElementById("main").classList.toggle("expanded");
};

/* ======================================================
   AUTH CHECK
====================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  loadDashboard();
  loadRole(user);
});

/* ======================================================
   LOAD ROLE
====================================================== */

async function loadRole(user) {

  try {

    const usersSnapshot = await getDocs(collection(db, "users"));

    let found = false;

    usersSnapshot.forEach((doc) => {

      const data = doc.data();

      if (data.email === user.email) {

        found = true;

        roleBox.innerHTML = `
          👤 ${data.name || "User"} 
          <br>
          <small>${data.role || "Staff"}</small>
        `;

        // ADMIN ACCESS
        if (data.role !== "Admin") {

          document.querySelectorAll(".admin-only").forEach(el => {
            el.style.display = "none";
          });

        }

      }

    });

    if (!found) {

      roleBox.innerHTML = `
        👤 ${user.email}
        <br>
        <small>Staff</small>
      `;
    }

  } catch (error) {

    console.error("Role Load Error:", error);

  }

}

/* ======================================================
   FORMAT MONEY
====================================================== */

function formatMoney(amount) {

  return Number(amount || 0).toLocaleString() + " ETB";

}

/* ======================================================
   DASHBOARD DATA
====================================================== */

async function loadDashboard() {

  try {

    /* ================================
       MEMBERS
    ================================ */

    onSnapshot(collection(db, "members"), (snapshot) => {

      membersEl.textContent = snapshot.size;

    });

    /* ================================
       SAVINGS
    ================================ */

    onSnapshot(collection(db, "savings"), (snapshot) => {

      let total = 0;

      snapshot.forEach(doc => {

        total += Number(doc.data().amount || 0);

      });

      savingsEl.textContent = formatMoney(total);

      updateProfit();

      updateChart();

    });

    /* ================================
       LOANS
    ================================ */

    onSnapshot(collection(db, "loans"), (snapshot) => {

      let total = 0;

      snapshot.forEach(doc => {

        total += Number(doc.data().amount || 0);

      });

      loansEl.textContent = formatMoney(total);

      updateProfit();

      updateChart();

    });

    /* ================================
       WITHDRAWALS
    ================================ */

    onSnapshot(collection(db, "withdrawals"), (snapshot) => {

      let total = 0;

      snapshot.forEach(doc => {

        total += Number(doc.data().amount || 0);

      });

      withdrawalsEl.textContent = formatMoney(total);

      updateProfit();

      updateChart();

    });

  } catch (error) {

    console.error("Dashboard Error:", error);

  }

}

/* ======================================================
   NET PROFIT
====================================================== */

async function updateProfit() {

  try {

    const savingsSnap = await getDocs(collection(db, "savings"));
    const loansSnap = await getDocs(collection(db, "loans"));
    const withdrawalsSnap = await getDocs(collection(db, "withdrawals"));

    let savings = 0;
    let loans = 0;
    let withdrawals = 0;

    savingsSnap.forEach(doc => {
      savings += Number(doc.data().amount || 0);
    });

    loansSnap.forEach(doc => {
      loans += Number(doc.data().amount || 0);
    });

    withdrawalsSnap.forEach(doc => {
      withdrawals += Number(doc.data().amount || 0);
    });

    const profit = savings - withdrawals;

    profitEl.textContent = formatMoney(profit);

  } catch (error) {

    console.error("Profit Error:", error);

  }

}

/* ======================================================
   CHART.JS
====================================================== */

let financeChart;

async function updateChart() {

  try {

    const savingsSnap = await getDocs(collection(db, "savings"));
    const loansSnap = await getDocs(collection(db, "loans"));
    const withdrawalsSnap = await getDocs(collection(db, "withdrawals"));

    let savings = 0;
    let loans = 0;
    let withdrawals = 0;

    savingsSnap.forEach(doc => {
      savings += Number(doc.data().amount || 0);
    });

    loansSnap.forEach(doc => {
      loans += Number(doc.data().amount || 0);
    });

    withdrawalsSnap.forEach(doc => {
      withdrawals += Number(doc.data().amount || 0);
    });

    const ctx = document.getElementById("financeChart");

    if (financeChart) {
      financeChart.destroy();
    }

    financeChart = new Chart(ctx, {

      type: "bar",

      data: {

        labels: [
          "Savings",
          "Loans",
          "Withdrawals"
        ],

        datasets: [{
          label: "Financial Overview",

          data: [
            savings,
            loans,
            withdrawals
          ],

          backgroundColor: [
            "#16a34a",
            "#ea580c",
            "#dc2626"
          ],

          borderRadius: 10,
          borderWidth: 0
        }]
      },

      options: {

        responsive: true,

        plugins: {

          legend: {
            display: false
          }

        },

        scales: {

          y: {

            beginAtZero: true

          }

        }

      }

    });

  } catch (error) {

    console.error("Chart Error:", error);

  }

}

/* ======================================================
   RECENT TRANSACTIONS
====================================================== */

async function loadRecentTransactions() {

  try {

    const tbody = document.getElementById("recentTransactions");

    if (!tbody) return;

    tbody.innerHTML = "";

    const savingsQuery = query(
      collection(db, "savings"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(savingsQuery);

    snapshot.forEach(doc => {

      const data = doc.data();

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${data.memberName || "-"}</td>
        <td>Saving</td>
        <td>${formatMoney(data.amount)}</td>
        <td>
          ${data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
            : "-"
          }
        </td>
      `;

      tbody.appendChild(tr);

    });

  } catch (error) {

    console.error("Recent Transactions Error:", error);

  }

}

/* ======================================================
   LOGOUT
====================================================== */

logoutBtn.addEventListener("click", async () => {

  const confirmLogout = confirm("Are you sure you want to logout?");

  if (!confirmLogout) return;

  try {

    await signOut(auth);

    window.location.href = "index.html";

  } catch (error) {

    console.error("Logout Error:", error);

    alert(error.message);

  }

});

/* ======================================================
   AUTO LOAD
====================================================== */

loadRecentTransactions();
updateChart();
updateProfit();
