import { db, auth } from "./firebase.js";

import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   STATE
========================= */

let role = null;
let chartsInitialized = false;

/* =========================
   AUTH + ROLE LOCK (FIXED)
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    alert("User not found");
    return;
  }

  role = snap.data().role;

  localStorage.setItem("role", role);

  document.getElementById("roleBox").innerText =
    role === "admin" ? "👑 Admin" : "👤 Member";

  if (role === "admin") {
    loadAdminDashboard();
  } else {
    loadMemberDashboard(user.uid);

    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "none");
  }
});

/* =========================
   ADMIN DASHBOARD
========================= */

function loadAdminDashboard() {

  let stats = {
    members: 0,
    savings: 0,
    loans: 0,
    repayments: 0,
    outstanding: 0
  };

  /* MEMBERS */
  onSnapshot(collection(db, "members"), snap => {
    stats.members = snap.size;
    document.getElementById("members").innerText = stats.members;
  });

  /* SAVINGS */
  onSnapshot(collection(db, "savings"), snap => {

    stats.savings = 0;

    snap.forEach(d => {
      stats.savings += Number(d.data().amount || 0);
    });

    document.getElementById("savings").innerText =
      stats.savings.toLocaleString() + " ETB";

    updateCharts(stats);
  });

  /* LOANS */
  onSnapshot(collection(db, "loans"), snap => {

    stats.loans = 0;
    stats.outstanding = 0;

    snap.forEach(d => {
      const l = d.data();
      stats.loans += Number(l.totalAmount || 0);
      stats.outstanding += Number(l.remaining || 0);
    });

    document.getElementById("loans").innerText =
      stats.loans.toLocaleString() + " ETB";

    updateCharts(stats);
  });

  /* REPAYMENTS */
  onSnapshot(collection(db, "repayments"), snap => {

    stats.repayments = 0;

    snap.forEach(d => {
      stats.repayments += Number(d.data().amount || 0);
    });

    document.getElementById("profit").innerText =
      stats.repayments.toLocaleString() + " ETB";

    updateCharts(stats);
  });
}

/* =========================
   MEMBER DASHBOARD
========================= */

function loadMemberDashboard(uid) {

  onSnapshot(
    query(collection(db, "savings"), where("memberId", "==", uid)),
    snap => {
      let total = 0;
      snap.forEach(d => total += Number(d.data().amount || 0));

      document.getElementById("savings").innerText =
        total.toLocaleString() + " ETB";
    }
  );

  onSnapshot(
    query(collection(db, "loans"), where("memberId", "==", uid)),
    snap => {
      let total = 0;
      snap.forEach(d => total += Number(d.data().totalAmount || 0));

      document.getElementById("loans").innerText =
        total.toLocaleString() + " ETB";
    }
  );

  onSnapshot(
    query(collection(db, "repayments"), where("memberId", "==", uid)),
    snap => {
      let total = 0;
      snap.forEach(d => total += Number(d.data().amount || 0));

      document.getElementById("profit").innerText =
        total.toLocaleString() + " ETB";
    }
  );
}

/* =========================
   FINANCE RISK ENGINE
========================= */

function calculateRisk(loans, outstanding) {

  if (loans === 0) return 0;

  return (outstanding / loans) * 100;
}

/* =========================
   CHART SYSTEM (ADVANCED)
========================= */

let financeChart;
let repaymentChart;

/* =========================
   UPDATE CHARTS
========================= */

function updateCharts(stats) {

  if (!chartsInitialized) {
    initCharts();
    chartsInitialized = true;
  }

  const risk = calculateRisk(stats.loans, stats.outstanding);

  /* UPDATE MAIN CHART */
  financeChart.data.datasets[0].data = [
    stats.savings,
    stats.loans,
    stats.repayments
  ];

  financeChart.update();

  /* UPDATE REPAYMENT CHART */
  repaymentChart.data.datasets[0].data = [
    stats.loans,
    stats.repayments,
    stats.outstanding
  ];

  repaymentChart.update();

  /* OPTIONAL RISK DISPLAY */
  const riskBox = document.getElementById("riskLevel");
  if (riskBox) riskBox.innerText = risk.toFixed(2) + "%";
}

/* =========================
   INIT CHARTS
========================= */

function initCharts() {

  const ctx1 = document.getElementById("dashboardChart");
  const ctx2 = document.getElementById("repaymentChart");

  financeChart = new Chart(ctx1, {

    type: "bar",

    data: {
      labels: ["Savings", "Loans", "Repayments"],

      datasets: [{
        label: "ETB Overview",
        data: [0, 0, 0]
      }]
    }
  });

  repaymentChart = new Chart(ctx2, {

    type: "doughnut",

    data: {
      labels: ["Loans", "Repayments", "Outstanding"],

      datasets: [{
        data: [0, 0, 0]
      }]
    }
  });
}

/* =========================
   LOGOUT
========================= */

window.logoutUser = async function () {

  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
};
