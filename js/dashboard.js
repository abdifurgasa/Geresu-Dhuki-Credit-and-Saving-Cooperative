import { db, auth } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   GLOBALS
========================= */

let savingsChart;
let repaymentChart;

const sidebar =
  document.getElementById("sidebar");

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;
  }

  loadDashboard(user);
});

/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard(user) {

  const role =
    localStorage.getItem("role");

  /* =========================
     ROLE DISPLAY
  ========================= */

  const roleBox =
    document.getElementById("roleBox");

  if (roleBox) {

    if (role === "admin") {

      roleBox.innerHTML =
        "👑 Admin";

    } else {

      roleBox.innerHTML =
        "👤 Member";
    }
  }

  /* =========================
     ADMIN CONTROL
  ========================= */

  if (role !== "admin") {

    document
      .querySelectorAll(".admin-only")
      .forEach(el => {

        el.style.display = "none";
      });
  }

  /* =========================
     LOAD DASHBOARD TYPE
  ========================= */

  if (role === "member") {

    loadMemberDashboard(user.uid);

  } else {

    loadAdminDashboard();
  }

  /* =========================
     ACTIVE MENU
  ========================= */

  document
    .querySelectorAll(".nav-item")
    .forEach(link => {

      if (
        link.href ===
        window.location.href
      ) {

        link.classList.add(
          "active"
        );
      }
    });
}

/* =========================
   ADMIN DASHBOARD
========================= */

function loadAdminDashboard() {

  let totalMembers = 0;
  let totalSavings = 0;
  let totalLoans = 0;
  let totalRepayments = 0;

  /* MEMBERS */

  onSnapshot(
    collection(db, "members"),

    (snapshot) => {

      totalMembers =
        snapshot.size;

      document.getElementById(
        "members"
      ).innerText =
        totalMembers.toLocaleString();
    }
  );

  /* SAVINGS */

  onSnapshot(
    collection(db, "savings"),

    (snapshot) => {

      totalSavings = 0;

      snapshot.forEach(doc => {

        totalSavings += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById(
        "savings"
      ).innerText =

        totalSavings.toLocaleString()
        + " ETB";

      updateProfit(
        totalLoans,
        totalRepayments
      );

      updateCharts(
        totalSavings,
        totalLoans,
        totalRepayments
      );
    }
  );

  /* LOANS */

  onSnapshot(
    collection(db, "loans"),

    (snapshot) => {

      totalLoans = 0;

      snapshot.forEach(doc => {

        totalLoans += Number(
          doc.data().totalAmount || 0
        );
      });

      document.getElementById(
        "loans"
      ).innerText =

        totalLoans.toLocaleString()
        + " ETB";

      updateProfit(
        totalLoans,
        totalRepayments
      );

      updateCharts(
        totalSavings,
        totalLoans,
        totalRepayments
      );
    }
  );

  /* REPAYMENTS */

  onSnapshot(
    collection(db, "repayments"),

    (snapshot) => {

      totalRepayments = 0;

      snapshot.forEach(doc => {

        totalRepayments += Number(
          doc.data().amount || 0
        );
      });

      updateProfit(
        totalLoans,
        totalRepayments
      );

      updateCharts(
        totalSavings,
        totalLoans,
        totalRepayments
      );
    }
  );
}

/* =========================
   MEMBER DASHBOARD
========================= */

function loadMemberDashboard(uid) {

  /* MEMBERS PRIVATE */

  document.getElementById(
    "members"
  ).innerText = "Private";

  /* SAVINGS */

  onSnapshot(

    query(
      collection(db, "savings"),
      where("memberId", "==", uid)
    ),

    (snapshot) => {

      let mySavings = 0;

      snapshot.forEach(doc => {

        mySavings += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById(
        "savings"
      ).innerText =

        mySavings.toLocaleString()
        + " ETB";

      updateMemberCharts(
        mySavings,
        0,
        0
      );
    }
  );

  /* LOANS */

  onSnapshot(

    query(
      collection(db, "loans"),
      where("memberId", "==", uid)
    ),

    (snapshot) => {

      let myLoans = 0;

      snapshot.forEach(doc => {

        myLoans += Number(
          doc.data().totalAmount || 0
        );
      });

      document.getElementById(
        "loans"
      ).innerText =

        myLoans.toLocaleString()
        + " ETB";

      updateMemberCharts(
        0,
        myLoans,
        0
      );
    }
  );

  /* REPAYMENTS */

  onSnapshot(

    query(
      collection(db, "repayments"),
      where("memberId", "==", uid)
    ),

    (snapshot) => {

      let myRepayments = 0;

      snapshot.forEach(doc => {

        myRepayments += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById(
        "profit"
      ).innerText =

        myRepayments.toLocaleString()
        + " ETB";

      updateMemberCharts(
        0,
        0,
        myRepayments
      );
    }
  );
}

/* =========================
   PROFIT ENGINE
========================= */

function updateProfit(
  loans,
  repayments
) {

  const profit =
    repayments - loans;

  document.getElementById(
    "profit"
  ).innerText =

    profit.toLocaleString()
    + " ETB";
}

/* =========================
   ADMIN CHARTS
========================= */

function updateCharts(
  savings,
  loans,
  repayments
) {

  /* BAR CHART */

  const ctx1 =
    document.getElementById(
      "dashboardChart"
    );

  if (ctx1) {

    if (savingsChart) {
      savingsChart.destroy();
    }

    savingsChart =
      new Chart(ctx1, {

        type: "bar",

        data: {

          labels: [
            "Savings",
            "Loans"
          ],

          datasets: [{

            label:
              "Financial Analytics",

            data: [
              savings,
              loans
            ],

            borderWidth: 1
          }]
        },

        options: {
          responsive: true
        }
      });
  }

  /* DOUGHNUT */

  const ctx2 =
    document.getElementById(
      "repaymentChart"
    );

  if (ctx2) {

    if (repaymentChart) {
      repaymentChart.destroy();
    }

    repaymentChart =
      new Chart(ctx2, {

        type: "doughnut",

        data: {

          labels: [
            "Loans",
            "Repayments"
          ],

          datasets: [{

            label:
              "Repayment Analytics",

            data: [
              loans,
              repayments
            ],

            borderWidth: 1
          }]
        },

        options: {
          responsive: true
        }
      });
  }
}

/* =========================
   MEMBER CHARTS
========================= */

function updateMemberCharts(
  savings,
  loans,
  repayments
) {

  const ctx =
    document.getElementById(
      "dashboardChart"
    );

  if (!ctx) return;

  if (savingsChart) {
    savingsChart.destroy();
  }

  savingsChart =
    new Chart(ctx, {

      type: "pie",

      data: {

        labels: [
          "Savings",
          "Loans",
          "Repayments"
        ],

        datasets: [{

          data: [
            savings,
            loans,
            repayments
          ]
        }]
      },

      options: {
        responsive: true
      }
    });
}

/* =========================
   SIDEBAR TOGGLE
========================= */

if (
  localStorage.getItem("sidebar")
  === "collapsed"
) {

  sidebar.classList.add(
    "collapsed"
  );
}

window.toggleSidebar =
function () {

  sidebar.classList.toggle(
    "collapsed"
  );

  localStorage.setItem(

    "sidebar",

    sidebar.classList.contains(
      "collapsed"
    )
      ? "collapsed"
      : "expanded"
  );
};

/* =========================
   LOGOUT
========================= */

window.logoutUser =
async function () {

  await signOut(auth);

  localStorage.clear();

  window.location.href =
    "index.html";
};

/* =========================
   SESSION TIMEOUT
========================= */

let timeout;

function resetTimeout() {

  clearTimeout(timeout);

  timeout = setTimeout(

    async () => {

      alert(
        "Session expired"
      );

      await signOut(auth);

      localStorage.clear();

      window.location.href =
        "index.html";

    },

    1000 * 60 * 30
  );
}

window.onload =
  resetTimeout;

document.onmousemove =
  resetTimeout;

document.onkeypress =
  resetTimeout;
