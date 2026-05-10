import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {

  try {

    const uid = auth.currentUser.uid;

    const userRef =
      doc(db, "users", uid);

    const userSnap =
      await getDoc(userRef);

    const role =
      userSnap.data().role;

    /* =========================
       ADMIN DASHBOARD
    ========================= */
    if (role === "admin") {

      await loadAdminDashboard();
    }

    /* =========================
       MEMBER DASHBOARD
    ========================= */
    else {

      await loadMemberDashboard(uid);
    }

  } catch (e) {

    console.error(e);
  }
}

/* =========================
   ADMIN DASHBOARD
========================= */
async function loadAdminDashboard() {

  /* MEMBERS */
  const membersSnap =
    await getDocs(collection(db, "members"));

  document.getElementById("members").innerText =
    membersSnap.size;

  /* SAVINGS */
  const savingsSnap =
    await getDocs(collection(db, "savings"));

  let totalSavings = 0;

  savingsSnap.forEach(doc => {

    totalSavings +=
      Number(doc.data().amount || 0);
  });

  document.getElementById("savings").innerText =
    totalSavings.toLocaleString() + " ETB";

  /* LOANS */
  const loansSnap =
    await getDocs(collection(db, "loans"));

  let totalLoans = 0;

  loansSnap.forEach(doc => {

    totalLoans +=
      Number(doc.data().amount || 0);
  });

  document.getElementById("loans").innerText =
    totalLoans.toLocaleString() + " ETB";

  /* PROFIT */
  const profit =
    totalSavings - totalLoans;

  document.getElementById("profit").innerText =
    profit.toLocaleString() + " ETB";

  /* LOAD CHART */
  loadChart(
    totalSavings,
    totalLoans,
    profit
  );
}

/* =========================
   MEMBER DASHBOARD
========================= */
async function loadMemberDashboard(uid) {

  document.querySelectorAll(".admin-only")
    .forEach(el => {
      el.style.display = "none";
    });

  document.getElementById("members").innerText =
    "My Account";

  /* MEMBER SAVINGS */
  const savingsQuery =
    query(
      collection(db, "savings"),
      where("uid", "==", uid)
    );

  const savingsSnap =
    await getDocs(savingsQuery);

  let totalSavings = 0;

  savingsSnap.forEach(doc => {

    totalSavings +=
      Number(doc.data().amount || 0);
  });

  document.getElementById("savings").innerText =
    totalSavings.toLocaleString() + " ETB";

  /* MEMBER LOANS */
  const loansQuery =
    query(
      collection(db, "loans"),
      where("uid", "==", uid)
    );

  const loansSnap =
    await getDocs(loansQuery);

  let totalLoans = 0;

  loansSnap.forEach(doc => {

    totalLoans +=
      Number(doc.data().amount || 0);
  });

  document.getElementById("loans").innerText =
    totalLoans.toLocaleString() + " ETB";

  /* MEMBER PROFIT */
  const profit =
    totalSavings - totalLoans;

  document.getElementById("profit").innerText =
    profit.toLocaleString() + " ETB";

  /* MEMBER CHART */
  loadChart(
    totalSavings,
    totalLoans,
    profit
  );
}

/* =========================
   CHART SYSTEM
========================= */
function loadChart(
  savings,
  loans,
  profit
) {

  const ctx =
    document.getElementById("dashboardChart");

  if (!ctx) return;

  new Chart(ctx, {

    type: "bar",

    data: {

      labels: [
        "Savings",
        "Loans",
        "Profit"
      ],

      datasets: [{

        label: "SACCO Analytics",

        data: [
          savings,
          loans,
          profit
        ]
      }]
    },

    options: {

      responsive: true,

      plugins: {

        legend: {
          display: true
        }
      }
    }
  });
}

/* =========================
   SIDEBAR
========================= */
const sidebar =
  document.getElementById("sidebar");

window.toggleSidebar = function () {

  sidebar.classList.toggle("collapsed");
};

/* =========================
   START
========================= */
loadDashboard();
