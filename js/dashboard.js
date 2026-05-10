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

    /* WAIT FOR AUTH */
    auth.onAuthStateChanged(async (user) => {

      if (!user) {
        window.location.href = "index.html";
        return;
      }

      const uid = user.uid;

      /* USER ROLE */
      const userRef =
        doc(db, "users", uid);

      const userSnap =
        await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User profile not found");
        return;
      }

      const role =
        userSnap.data().role;

      /* ROLE LABEL */
      document.getElementById("roleBox").innerText =
        role.toUpperCase();

      /* ADMIN */
      if (role === "admin") {

        await loadAdminDashboard();
      }

      /* MEMBER */
      else {

        await loadMemberDashboard(uid);
      }

    });

  } catch (e) {

    console.error(e);

    alert("Dashboard loading failed");
  }
}

/* =========================
   ADMIN DASHBOARD
========================= */
async function loadAdminDashboard() {

  /* =========================
     MEMBERS
  ========================= */
  const membersSnap =
    await getDocs(collection(db, "members"));

  const totalMembers =
    membersSnap.size;

  document.getElementById("members").innerText =
    totalMembers;

  /* =========================
     SAVINGS
  ========================= */
  const savingsSnap =
    await getDocs(collection(db, "savings"));

  let totalSavings = 0;

  savingsSnap.forEach((doc) => {

    totalSavings +=
      Number(doc.data().amount || 0);

  });

  document.getElementById("savings").innerText =
    totalSavings.toLocaleString() + " ETB";

  /* =========================
     LOANS
  ========================= */
  const loansSnap =
    await getDocs(collection(db, "loans"));

  let totalLoans = 0;

  loansSnap.forEach((doc) => {

    totalLoans +=
      Number(doc.data().amount || 0);

  });

  document.getElementById("loans").innerText =
    totalLoans.toLocaleString() + " ETB";

  /* =========================
     REPAYMENTS
  ========================= */
  const transactionsSnap =
    await getDocs(collection(db, "transactions"));

  let repayments = 0;

  transactionsSnap.forEach((doc) => {

    const data = doc.data();

    if (data.type === "loan_repayment") {

      repayments +=
        Number(data.amount || 0);
    }

  });

  /* =========================
     PROFIT
  ========================= */
  const profit =
    totalSavings + repayments - totalLoans;

  document.getElementById("profit").innerText =
    profit.toLocaleString() + " ETB";

  /* =========================
     CHARTS
  ========================= */
  loadCharts(
    totalSavings,
    totalLoans,
    repayments,
    profit
  );
}

/* =========================
   MEMBER DASHBOARD
========================= */
async function loadMemberDashboard(uid) {

  /* HIDE ADMIN MENUS */
  document.querySelectorAll(".admin-only")
    .forEach(el => {

      el.style.display = "none";

    });

  document.getElementById("members").innerText =
    "My Account";

  /* =========================
     MEMBER SAVINGS
  ========================= */
  const savingsQuery =
    query(
      collection(db, "savings"),
      where("uid", "==", uid)
    );

  const savingsSnap =
    await getDocs(savingsQuery);

  let totalSavings = 0;

  savingsSnap.forEach((doc) => {

    totalSavings +=
      Number(doc.data().amount || 0);

  });

  document.getElementById("savings").innerText =
    totalSavings.toLocaleString() + " ETB";

  /* =========================
     MEMBER LOANS
  ========================= */
  const loansQuery =
    query(
      collection(db, "loans"),
      where("uid", "==", uid)
    );

  const loansSnap =
    await getDocs(loansQuery);

  let totalLoans = 0;

  loansSnap.forEach((doc) => {

    totalLoans +=
      Number(doc.data().amount || 0);

  });

  document.getElementById("loans").innerText =
    totalLoans.toLocaleString() + " ETB";

  /* =========================
     MEMBER REPAYMENTS
  ========================= */
  const txQuery =
    query(
      collection(db, "transactions"),
      where("uid", "==", uid)
    );

  const txSnap =
    await getDocs(txQuery);

  let repayments = 0;

  txSnap.forEach((doc) => {

    const data = doc.data();

    if (data.type === "loan_repayment") {

      repayments +=
        Number(data.amount || 0);
    }

  });

  /* =========================
     PROFIT
  ========================= */
  const profit =
    totalSavings + repayments - totalLoans;

  document.getElementById("profit").innerText =
    profit.toLocaleString() + " ETB";

  /* CHARTS */
  loadCharts(
    totalSavings,
    totalLoans,
    repayments,
    profit
  );
}

/* =========================
   CHARTS
========================= */
function loadCharts(
  savings,
  loans,
  repayments,
  profit
) {

  /* =========================
     MAIN CHART
  ========================= */
  const chart1 =
    document.getElementById("dashboardChart");

  if (chart1) {

    new Chart(chart1, {

      type: "bar",

      data: {

        labels: [
          "Savings",
          "Loans",
          "Repayments",
          "Profit"
        ],

        datasets: [{

          label: "Financial Analytics",

          data: [
            savings,
            loans,
            repayments,
            profit
          ]
        }]
      }
    });
  }

  /* =========================
     REPAYMENT CHART
  ========================= */
  const chart2 =
    document.getElementById("repaymentChart");

  if (chart2) {

    new Chart(chart2, {

      type: "doughnut",

      data: {

        labels: [
          "Loans",
          "Repayments"
        ],

        datasets: [{

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
   SIDEBAR
========================= */
window.toggleSidebar = function () {

  document.getElementById("sidebar")
    .classList.toggle("collapsed");
};

/* =========================
   START
========================= */
loadDashboard();
