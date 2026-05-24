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
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ======================================================
   ELEMENTS
====================================================== */

const membersEl = document.getElementById("members");
const savingsEl = document.getElementById("savings");
const loansEl = document.getElementById("loans");
const withdrawalsEl = document.getElementById("withdrawals");
const profitEl = document.getElementById("profit");

const roleBox = document.getElementById("roleBox");
const logoutBtn = document.getElementById("logoutBtn");

const transactionsTable =
  document.getElementById("recentTransactions");

const notificationsBox =
  document.getElementById("notifications");

/* ======================================================
   GLOBAL DATA
====================================================== */

let totalMembers = 0;
let totalSavings = 0;
let totalLoans = 0;
let totalWithdrawals = 0;
let totalProfit = 0;

let financeChart;

/* ======================================================
   SIDEBAR TOGGLE
====================================================== */

window.toggleSidebar = function () {

  document
    .getElementById("sidebar")
    .classList.toggle("collapsed");

  document
    .getElementById("main")
    .classList.toggle("expanded");
};

/* ======================================================
   FORMAT MONEY
====================================================== */

function formatMoney(amount) {

  return Number(amount || 0)
    .toLocaleString() + " ETB";
}

/* ======================================================
   AUTH GUARD
====================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }

  await loadRole(user);

  loadMembers();

  loadSavings();

  loadLoans();

  loadWithdrawals();

  loadProfit();

  loadChart();

  loadRecentTransactions();

  loadNotifications();
});

/* ======================================================
   LOAD USER ROLE
====================================================== */

async function loadRole(user) {

  try {

    const snapshot =
      await getDocs(collection(db, "users"));

    let found = false;

    snapshot.forEach((doc) => {

      const data = doc.data();

      if (data.email === user.email) {

        found = true;

        roleBox.innerHTML = `
          👤 ${data.name || "User"}
          <br>
          <small>${data.role || "Staff"}</small>
        `;

        if (data.role !== "Admin") {

          document
            .querySelectorAll(".admin-only")
            .forEach((el) => {

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

    console.error(error);
  }
}

/* ======================================================
   MEMBERS MODULE
====================================================== */

function loadMembers() {

  onSnapshot(collection(db, "members"), (snapshot) => {

    totalMembers = snapshot.size;

    membersEl.textContent = totalMembers;
  });
}

/* ======================================================
   SAVINGS MODULE
====================================================== */

function loadSavings() {

  onSnapshot(collection(db, "savings"), (snapshot) => {

    totalSavings = 0;

    snapshot.forEach((doc) => {

      totalSavings +=
        Number(doc.data().amount || 0);

    });

    savingsEl.textContent =
      formatMoney(totalSavings);

    loadProfit();

    updateChart();
  });
}

/* ======================================================
   LOANS MODULE
====================================================== */

function loadLoans() {

  onSnapshot(collection(db, "loans"), (snapshot) => {

    totalLoans = 0;

    snapshot.forEach((doc) => {

      totalLoans +=
        Number(doc.data().amount || 0);

    });

    loansEl.textContent =
      formatMoney(totalLoans);

    updateChart();
  });
}

/* ======================================================
   WITHDRAWALS MODULE
====================================================== */

function loadWithdrawals() {

  onSnapshot(collection(db, "withdrawals"), (snapshot) => {

    totalWithdrawals = 0;

    snapshot.forEach((doc) => {

      totalWithdrawals +=
        Number(doc.data().amount || 0);

    });

    withdrawalsEl.textContent =
      formatMoney(totalWithdrawals);

    loadProfit();

    updateChart();
  });
}

/* ======================================================
   PROFIT MODULE
====================================================== */

function loadProfit() {

  totalProfit =
    totalSavings - totalWithdrawals;

  profitEl.textContent =
    formatMoney(totalProfit);
}

/* ======================================================
   CHART MODULE
====================================================== */

function loadChart() {

  const ctx =
    document.getElementById("financeChart");

  if (!ctx) return;

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
          totalSavings,
          totalLoans,
          totalWithdrawals
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
}

/* ======================================================
   UPDATE CHART
====================================================== */

function updateChart() {

  if (!financeChart) return;

  financeChart.data.datasets[0].data = [

    totalSavings,
    totalLoans,
    totalWithdrawals

  ];

  financeChart.update();
}

/* ======================================================
   RECENT TRANSACTIONS MODULE
====================================================== */

async function loadRecentTransactions() {

  if (!transactionsTable) return;

  transactionsTable.innerHTML = "";

  try {

    const savingsQuery = query(
      collection(db, "savings"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot =
      await getDocs(savingsQuery);

    snapshot.forEach((doc) => {

      const data = doc.data();

      const tr =
        document.createElement("tr");

      tr.innerHTML = `

        <td>
          ${data.memberName || "-"}
        </td>

        <td>
          Savings
        </td>

        <td>
          ${formatMoney(data.amount)}
        </td>

        <td>
          ${
            data.createdAt
              ? new Date(
                  data.createdAt.seconds * 1000
                ).toLocaleDateString()
              : "-"
          }
        </td>

      `;

      transactionsTable.appendChild(tr);
    });

  } catch (error) {

    console.error(error);
  }
}

/* ======================================================
   NOTIFICATIONS MODULE
====================================================== */

function loadNotifications() {

  if (!notificationsBox) return;

  notificationsBox.innerHTML = `

    <div class="notification success">
      ✅ Dashboard loaded successfully
    </div>

    <div class="notification info">
      📊 Financial report updated
    </div>

    <div class="notification warning">
      ⚠ Monitor loan repayments
    </div>

  `;
}

/* ======================================================
   LOGOUT MODULE
====================================================== */

logoutBtn.addEventListener("click", async () => {

  const confirmLogout =
    confirm("Are you sure to logout?");

  if (!confirmLogout) return;

  try {

    await signOut(auth);

    window.location.href = "index.html";

  } catch (error) {

    console.error(error);

    alert(error.message);
  }
});

/* ======================================================
   REALTIME ACTIVITY LOGS
====================================================== */

function loadActivityLogs() {

  const activityBox =
    document.getElementById("activityLogs");

  if (!activityBox) return;

  activityBox.innerHTML = `

    <div class="activity-item">
      👤 New member registered
    </div>

    <div class="activity-item">
      💰 Savings deposited
    </div>

    <div class="activity-item">
      🏦 Loan approved
    </div>

  `;
}

loadActivityLogs();

/* ======================================================
   QUICK SEARCH MODULE
====================================================== */

window.searchDashboard = function () {

  const input =
    document.getElementById("dashboardSearch");

  if (!input) return;

  const filter =
    input.value.toLowerCase();

  document
    .querySelectorAll(".card")
    .forEach((card) => {

      const text =
        card.innerText.toLowerCase();

      card.style.display =
        text.includes(filter)
          ? "block"
          : "none";
    });
};

/* ======================================================
   AUTO REFRESH
====================================================== */

setInterval(() => {

  updateChart();

}, 5000);

/* ======================================================
   SYSTEM READY
====================================================== */

console.log(
  "GERESU DHUKI SACCO Dashboard Loaded"
);
